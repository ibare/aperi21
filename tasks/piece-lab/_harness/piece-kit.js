/*
 * piece-kit — 자유 구현 조각이 싣는 최소 계측.
 *
 * 그리기 도구가 아니다. 무엇을 어떻게 그릴지는 조각이 전부 정한다.
 * 이 파일이 하는 일은 셋뿐이다.
 *
 *   1. 결정적 시계 — ?t=6.5 로 열면 고정 dt 로 6.5 초까지 미리 돌린 뒤 한 번 그리고 멈춘다.
 *      headless 브라우저는 RAF 를 거의 돌리지 않아서, 시간이 지나야 보이는 장면을
 *      찍으려면 이것이 필요하다.
 *   2. 시드 난수 — ?seed=3. 같은 장면을 다시 찍을 수 있게.
 *   3. 묶음 계측 — mark('물줄기', () => { ... }) 안에서 일어난 캔버스 호출을 센다.
 *      분석하는 쪽은 코드를 읽기 전에 이 표를 먼저 본다.
 *
 * 결과는 <script type="application/json" id="piece-report"> 로 DOM 에 게시된다.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var seekT = params.has('t') ? Math.max(0, parseFloat(params.get('t')) || 0) : null;
  var seed = parseInt(params.get('seed') || '1', 10) || 1;
  var DT = 1 / 60;

  // ---- 시드 난수 (mulberry32) ----
  var s = seed >>> 0;
  function random() {
    s = (s + 0x6d2b79f5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // ---- 묶음 계측 ----
  var OPS = [
    'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'fillText', 'strokeText',
    'beginPath', 'moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse', 'rect',
    'bezierCurveTo', 'quadraticCurveTo', 'drawImage', 'setLineDash', 'createLinearGradient',
    'createRadialGradient', 'clip', 'putImageData', 'getImageData',
  ];
  var current = '(묶음 밖)';
  var counts = {};
  var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  if (P) {
    OPS.forEach(function (name) {
      var orig = P[name];
      if (typeof orig !== 'function') return;
      P[name] = function () {
        var m = counts[current] || (counts[current] = {});
        m[name] = (m[name] || 0) + 1;
        return orig.apply(this, arguments);
      };
    });
  }
  function mark(name, fn) {
    var prev = current;
    current = name;
    try { return fn(); } finally { current = prev; }
  }

  // ---- 오류 수집 ----
  var errors = [];
  window.addEventListener('error', function (e) { errors.push(String(e.message || e)); });

  // ---- 시계 ----
  var state = { t: 0, frames: 0 };
  function publish(extra) {
    var el = document.getElementById('piece-report');
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/json';
      el.id = 'piece-report';
      document.body.appendChild(el);
    }
    var canvases = Array.prototype.map.call(document.querySelectorAll('canvas'), function (c) {
      return { w: c.clientWidth, h: c.clientHeight };
    });
    el.textContent = JSON.stringify(Object.assign({
      t: state.t, frames: state.frames, seed: seed, seek: seekT,
      marks: counts, canvases: canvases, errors: errors,
    }, extra || {}));
    window.__pieceReady = true;
  }

  /**
   * loop({ step(dt, t), draw(t) })
   * step 은 언제나 고정 dt 로 불린다. 실시간에서는 누적해서 여러 번, ?t= 에서는 한꺼번에.
   * draw 는 프레임마다 한 번. 계측은 매 draw 직전에 초기화된다 — 표는 마지막 프레임 것이다.
   */
  function loop(hooks) {
    var step = hooks.step || function () {};
    var draw = hooks.draw || function () {};

    function frame() {
      counts = {};
      current = '(묶음 밖)';
      draw(state.t);
      state.frames++;
    }

    if (seekT !== null) {
      var n = Math.round(seekT / DT);
      try {
        for (var i = 0; i < n; i++) { step(DT, state.t); state.t += DT; }
        frame();
      } catch (e) { errors.push(String(e && e.stack || e)); }
      publish();
      return;
    }

    var last = null;
    var acc = 0;
    function tick(now) {
      if (last === null) last = now;
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (acc >= DT) { step(DT, state.t); state.t += DT; acc -= DT; }
      frame();
      if (state.frames === 1) publish();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  window.PieceKit = {
    DT: DT, seed: seed, seekT: seekT, random: random, mark: mark, loop: loop,
    /** 지금이 ?t= 로 멈춰 찍는 중인가. 조작기·호버 같은 것을 끌 때 쓴다. */
    frozen: seekT !== null,
  };
})();
