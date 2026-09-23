/**
 * projectile-range 개념 선언.
 *
 * 「무엇이 사거리를 바꾸는가」 를 다루는 셋 중 **쏘는 각도**가 이쪽 몫이다. 셋은
 * 고정해 두는 것으로 갈린다 —
 *   projectile-range            각도만 바꾼다 (속력 · 중력 · 공기는 그대로)
 *   range-and-surface-gravity   하늘의 중력만 바꾼다 (각도 · 속력은 그대로)
 *   projectile-in-wind          공기의 움직임만 바꾼다 (각도 · 중력은 그대로)
 * 이쪽만 겨눔 · 보각의 짝 · 45° 어휘를 갖는다.
 *
 * 옛 선언(스테이지 탭으로 지구 · 달 · 우주를 오가고 환경 토글로 바람을 넣던 `aperi21:projectile`)
 * 을 새 화면 기준으로 통째로 다시 썼다. 새 화면에는 조작기가 없으므로 affordances 에
 * **저절로 일어나는 것**을 적는다 — 없는 것을 적으면 그 개념을 맥락에 집어넣는 역효과만 낸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const projectileRangeConcept: Aperi21ConceptSource = {
  id: 'projectile-range',
  label: 'Range and Launch Angle',
  canonicalSim: 'aperi21:projectile-range',

  surface: {
    definition:
      'How far a throw of fixed speed carries as the launch angle alone is varied, the reach greatest at forty five degrees and angles equally either side of it landing together.',
    exemplarKeywords: [
      'range of a projectile',
      'launch angle and distance',
      'why forty five degrees goes furthest',
      'best angle to throw something',
      'complementary angles give the same range',
      'thirty degrees and sixty degrees land in the same place',
      'how far will it go if I throw it at this angle',
      'firing angle and distance to target',
      'flat shot versus lobbed shot',
      'aiming for maximum distance',
    ],
  },

  briefing: {
    observable: [
      'Five balls leave one launch point at the same instant. Before they go, five arrows fan out from that point and they are all the same length — that equal length is how the screen says the speed is the same for all five.',
      'Each arrow carries its angle written beyond its tip — fifteen, thirty, forty five, sixty and seventy five degrees. The balls themselves are all drawn in the same ink, so nothing but the angle distinguishes them.',
      'They land in order, the shallowest first. Each landing puts a short mark across the ground, a half ring spreads from it, and the ball is taken away so that the mark is what remains.',
      'The sixty degree ball comes down on the mark the thirty degree ball already left, and the seventy five degree ball comes down on the mark the fifteen degree one left — a late arrival settling onto ground that is already marked.',
      'Under each mark the angle names stack in rows, the later arrival on the second row: thirty with sixty under one mark, fifteen with seventy five under another. Forty five is the one name standing alone on a single row, and its mark is the furthest out.',
      'The five paths stay drawn after the balls are gone, so the paired flights are seen ending at the same place along the ground rather than remembered as having done so.',
      'At the end a dashed line in the accent colour runs from the furthest paired mark to the forty five degree mark, giving the extra distance as a length.',
      'The only writing on the picture is the five angle names and the caption line; how far and how fast are read from where the marks fall.',
    ],

    screen: {
      affordances: [
        'The whole cycle runs and repeats on its own — the five arrows fanned out, the launch, the landings one after another, the paired marks held to be read, the measuring line drawn, and a fade back to the aim.',
        'The flight is slowed to seven tenths of real speed, because five balls crossing in two seconds is too quick to follow one against another.',
        'The screen is arrived at mid-flight, with the balls already in the air and the shallowest about to come down, rather than on a still picture of the aim.',
        'Everything the comparison needs is present at once — five launches of one speed, their paths, and the marks they leave — so the answer is found by looking along the ground rather than by firing twice and remembering.',
      ],
    },

    useWhen: [
      'The article asks which angle throws furthest and wants that answer arrived at rather than quoted. The one mark with no partner is where the answer lands, and it can be pointed to.',
      'The reader is to be shown that two different aims can reach exactly the same distance. The moment a ball settles onto a mark another ball already made is the thing the prose should be written against.',
      'A claim about aiming is being made and nothing else about the throw is meant to move — the speed, the ground and the air are all to be held still while only the aim changes.',
    ],

    avoidWhen: [
      'The subject is how the strength of gravity or the state of the air changes a flight. Every one of the five launches happens in one unchanging world.',
      'The range, the greatest height or the time of flight are wanted as figures. No number appears except the five angles; the argument is made out of where the marks lie.',
      'The point is that the forward motion leaves the descent alone, or that bodies sent off at different speeds come down together. The five here differ in aim, and they land at five different moments.',
      'The article is about the shape of the path as a curve, or about a relation between how far across and how high. The paths are left on screen as records of where flights ended, and nothing is said about their form.',
      'The reader is meant to set the aim or the speed and fire. The five launches are fixed and the cycle repeats them unchanged.',
      'The subject is a body dropped from rest or thrown straight up. Every launch here has a forward reach.',
    ],

    contrastWith: [
      {
        concept: 'range-and-surface-gravity',
        note: 'Both ask what sets how far a launch carries. One varies the aim and holds the world fixed; the other holds the aim and varies the gravity of the world it is thrown in.',
      },
      {
        concept: 'projectile-in-wind',
        note: 'One lets the aim decide the reach in air that is standing still; the other fixes the aim and lets air that is moving carry the landing point off where still air would have put it.',
      },
      {
        concept: 'projectile-motion',
        note: 'One asks which aim carries furthest and makes the comparison between different aims; the other asks whether the forward motion touches the descent at all, and answers that it does not.',
      },
      {
        concept: 'trajectory-equation',
        note: 'One is about where a flight ends and which launch condition puts it there; the other is about the curve between the ends, taken as a relation that survives when the clock is stripped away.',
      },
      {
        concept: 'vector-decomposition',
        note: 'One is a claim about which aim reaches furthest; the other is the geometry by which any aim is split into a forward part and an upward part in the first place, which is what makes such a claim answerable.',
      },
    ],
  },
};
