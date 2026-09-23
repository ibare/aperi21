/**
 * keplers-third-law 개념 선언.
 *
 * 위험한 짝은 `geostationary-orbit` — 둘 다 주기와 반지름이다. **주장을 갈랐다.**
 *   keplers-third-law    주기가 반지름보다 **훨씬 빨리** 자란다 — 4배 반지름에 8배 주기, 바퀴 수로 센다
 *   geostationary-orbit  **딱 한 높이**에서 주기가 자전과 같아진다 — 하늘 한 자리에 멈춘다
 * 이쪽만 두 궤도의 견줌 · 바퀴 수 · 긴반지름 어휘를 갖고, 기지국 · 머리 위 · 지구의 자전은 쓰지 않는다.
 * `keplers-second-law` 와는 궤도 하나 / 궤도 둘로 갈랐다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const keplersThirdLawConcept: Aperi21ConceptSource = {
  id: 'keplers-third-law',
  label: "Kepler's Third Law — How Period Grows with Orbit Size",
  canonicalSim: 'aperi21:keplers-third-law',

  surface: {
    definition:
      'Across orbits of different size the time for one lap grows far faster than the radius, because the wider body travels further and also moves more slowly.',
    exemplarKeywords: [
      "Kepler's third law",
      'T squared is proportional to a cubed',
      'why outer planets take so much longer',
      'period against semi-major axis',
      'Neptune takes 165 years and Earth takes one',
      'a farther orbit is a slower orbit',
      'four times the radius means eight times the period',
      'harmonic law of planetary motion',
      'relating orbital period to distance',
      'how long one lap takes at a given distance',
    ],
  },

  briefing: {
    observable: [
      'Two circular orbits share one centre, the outer one four times as wide as the inner, and a planet leaves a marked start line on each of them at the same moment.',
      'The inner planet comes round again and again while the outer one only inches along, dragging a coloured arc behind it that shows how little of its circle it has covered.',
      'Beside the orbits a horizontal strip records the time: the inner planet fills one numbered box per lap, and the outer planet grows a single bar whose full length is one of its own laps.',
      'A hollow ring travels the outer circle at the speed the inner planet has, and it finishes the wide lap after four boxes — exactly the four you would expect from a circle four times as long.',
      'The real outer planet at that moment is only about halfway round, and the gap between it and the hollow ring is what says it is not merely further but genuinely slower.',
      'When the outer planet finally returns to the start line the inner one arrives there too, having completed its eighth lap, with all eight boxes filled and the bar reaching the end of the strip.',
      'Only four marks carry any writing — a radius named beside each circle and a period named under each row of the strip — and the eight is something counted in boxes rather than stated.',
      'The comparison is set up so both numbers are whole: the widening is four and the slowing brings the lap count to eight.',
    ],

    screen: {
      affordances: [
        'The race runs on its own from the shared start line and begins again once both planets are back on it; nothing has to be pressed.',
        'Both orbits are drawn as circles, so the radius each is named by is simply the width you can see rather than a construction that has to be explained first.',
        'Arriving mid-race is the normal case — the inner planet is already partway through a lap and the first box is filling.',
      ],
    },

    useWhen: [
      'The article has given the relation between period and orbit size as a formula and the reader has taken away only that outer orbits are longer. Counting eight laps of the inner planet against one of the outer turns the exponent into something watched rather than read.',
      'The prose needs to separate two reasons an outer body is slow to come round — the greater distance and the lower speed — and a case is wanted where the two are shown apart.',
    ],

    avoidWhen: [
      'The orbits in question are ellipses and what matters is how speed varies within a single orbit. Both paths here are circles run at unchanging speed.',
      'The article turns on matching an orbit to the rotation of a planet below, or on a satellite that holds one spot in the sky. Nothing here spins beneath the orbits and no ground observer is present.',
      'Actual periods or distances are needed — years, kilometres, astronomical units. The only writing is symbolic, naming one radius against the other and one period against the other.',
      'The subject is why an orbit closes at all, or the force that bends the path. No pull is drawn and the circles are simply travelled.',
      'The article is about two bodies of comparable mass and where their common centre lies. The centre here is fixed and holds nothing that moves.',
    ],

    contrastWith: [
      {
        concept: 'keplers-second-law',
        note: 'One compares two separate orbits and asks how the time for a lap grows with size; the other stays inside one orbit and asks what remains constant while the speed along it changes.',
      },
      {
        concept: 'geostationary-orbit',
        note: 'One is the general rule that period rises steeply with radius; the other is the single consequence of solving that rule backwards for one particular period — the turning of the planet underneath.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'One asks how the time for a lap depends on how wide the circle is; the other stays with a single circle and asks what unchanging speed along a curve does to the velocity.',
      },
    ],
  },
};
