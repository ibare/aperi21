/**
 * projectile-in-wind 개념 선언.
 *
 * 「무엇이 사거리를 바꾸는가」 를 다루는 셋 중 **공기의 움직임**이 이쪽 몫이다. 셋은
 * 고정해 두는 것으로 갈린다 —
 *   projectile-in-wind          바람만 바꾼다 (각도 · 속력 · 중력은 그대로)
 *   projectile-range            쏘는 각도만 바꾼다 (속력 · 중력 · 공기는 그대로)
 *   range-and-surface-gravity   하늘의 중력만 바꾼다 (각도 · 속력은 그대로)
 * 이쪽만 뒷바람 · 앞바람 · 공기에 대한 속도 어휘를 갖는다.
 *
 * 저항 이웃들(`drag-force` · `terminal-velocity` · `stokes-drag`)과도 갈린다 —
 * 저 셋은 **가만히 있는 공기**를 다루고, 이쪽은 공기가 **흐른다**는 것 하나를 바꾼다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const projectileInWindConcept: Aperi21ConceptSource = {
  id: 'projectile-in-wind',
  label: 'Projectile Range in Wind',
  canonicalSim: 'aperi21:projectile-in-wind',

  surface: {
    definition:
      'How far one and the same launch carries when the air it flies through is itself moving, a tailwind carrying the landing point beyond the still-air mark and a headwind leaving it short.',
    exemplarKeywords: [
      'throwing into the wind',
      'tailwind and headwind on a projectile',
      'wind carries the ball further',
      'golf drive downwind',
      'why the shot fell short into the wind',
      'wind blows a throw off its distance',
      'air moving past a flying body',
      'speed relative to the air',
      'archery in wind',
      'how much distance does the wind cost',
    ],
  },

  briefing: {
    observable: [
      'Three grounds are stacked, one above the other, and the same launch is made on each: three launch arrows of the same length at the same angle, standing at launch points that lie at the same place along the ground.',
      'Each ground is named for the air above it and carries a wind arrow at the left — one pointing back against the flight, one pointing along it, and the middle ground carrying only its name, since air standing still is written as nothing rather than as a short arrow.',
      'The three balls pass the same heights together and draw apart only sideways: the one flying into the wind trails behind, the one with the wind runs ahead, and the middle one stays between them.',
      'A dashed vertical line stands at the distance a throw reaches in still air and runs through all three grounds. The middle ball always comes down on it.',
      'All three touch down at the same instant and three marks in the accent colour appear at once — one short of the line, one on it, one beyond it — reading across as a staircase.',
      'Lines in the accent colour then measure from the standing line out to each of the two outer marks, drawn to the left on the ground where the wind blew against the flight and to the right where it blew along.',
      'The paths are visibly different shapes as well as different lengths: the one flown into the wind comes down more steeply than the one flown with it.',
      'The closing line says the ball that had the wind behind it landed beyond the still-air mark and the ball that flew into the wind fell short.',
    ],

    screen: {
      affordances: [
        'A slider at the top right sets how strongly the air moves, in metres per second, from a light breeze up to a strong one. Pulling it lengthens or shortens all three wind arrows at once and moves the two outer landing marks further out or closer in.',
        'The middle ground and the standing line do not move at any setting of the slider, so what the pulling shows is that only the two outer flights depend on the wind at all.',
        'Apart from the slider the cycle runs and repeats on its own — the aim, the flight, the three landing together, the measured picture held to be read, and a fade back to the aim.',
        'The flight is slowed to six tenths of real speed, because a little over a second is not long enough to watch three balls separate.',
        'The screen is arrived at mid-flight, with the three already more than a metre apart and coming down.',
        'The framing is fixed, so pulling the slider to its strongest setting moves the marks without the view shifting under them.',
      ],
    },

    useWhen: [
      'The article says wind changes where a throw comes down and the reader is to see that it changes where, not how long: three balls touching the ground at one instant in three different places is exactly that distinction.',
      'A comparison is wanted against a known baseline — what the same throw would have done in still air — with the shortfall and the gain measured out from that one line.',
      'The reader should be able to push the wind harder and watch the gap open, having been told that a stronger wind costs or gives more distance.',
      'The article treats air as something that moves rather than something that merely resists, and needs a screen where the same body is put into three different airs at once.',
    ],

    avoidWhen: [
      'The subject is resistance itself — how it grows with speed, how it balances weight, or what it depends on. The air here is characterised only by which way it is moving and how fast.',
      'The point is which angle throws furthest, or how strong gravity is. The angle and the gravity are one fixed pair on all three grounds.',
      'A crosswind, a gust, or wind changing during a flight is meant. The air moves along the line of flight and it blows steadily the whole way.',
      'The article wants the distance gained or lost as a figure. Nothing is written but the wind speed on the slider; the shift is given as the length of a measuring line.',
      'Perfectly still air is the case being argued about, or a throw in a vacuum. The slider never reaches zero, and the flights are noticeably bent by the air at every setting.',
      'The claim is that the forward motion and the descent are independent of each other. Here the body is acted on sideways throughout the flight, and that is the whole point.',
    ],

    contrastWith: [
      {
        concept: 'projectile-range',
        note: 'One holds the aim fixed and lets moving air carry the landing point off where still air would have put it; the other holds the air still and lets the aim decide the reach.',
      },
      {
        concept: 'range-and-surface-gravity',
        note: 'Both shift a landing point by changing the world rather than the launch. One changes what the air is doing; the other changes how hard the ground pulls.',
      },
      {
        concept: 'drag-force',
        note: 'One is about air in motion, which carries a flight away from where still air would have ended it; the other is about the resistance itself and how steeply it climbs as a body goes faster.',
      },
      {
        concept: 'terminal-velocity',
        note: 'One turns on the body meeting air that is already moving, so that the same launch is pushed along or held back; the other turns on resistance in still air growing until it matches gravity and no more speed can be gained.',
      },
      {
        concept: 'projectile-motion',
        note: 'One shows a sideways push that leaves the descent untouched, so three flights land at one instant in three places; the other shows that the forward speed a body is given never touches the descent in the first place.',
      },
    ],
  },
};
