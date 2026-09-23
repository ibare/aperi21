/**
 * angular-acceleration 개념 선언.
 *
 * 형제 넷의 갈림은 주어다 (`centripetal-acceleration.ts` 의 주석에 표를 두었다).
 * 이쪽의 주어는 **도는 빠르기 자체**이고, 주장은 「같은 0.5초가 매번 더 넓은 각을
 * 쓴다」이다. 속도도 방향도 화살표도 화면에 없다 — 테두리 위의 눈금뿐이다.
 *
 * 그래서 이쪽만 ω·α·rad/s²·바퀴·회전수 어휘를 갖고, 「중심을 향함」 · 「몫으로 갈림」
 * 어휘는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const angularAccelerationConcept: Aperi21ConceptSource = {
  id: 'angular-acceleration',
  label: 'Angular Acceleration',
  canonicalSim: 'aperi21:angular-acceleration',

  surface: {
    definition:
      'The rate at which a rate of turning itself grows, shown by a body whose every equal slice of the clock covers a wider angle than the slice before.',
    exemplarKeywords: [
      'angular acceleration',
      'alpha in radians per second squared',
      'angular velocity that keeps increasing',
      'a wheel spinning up',
      'omega equals omega zero plus alpha t',
      'the rotational counterpart of acceleration',
      'revs climbing',
      'more angle covered in each successive second',
      'flywheel picking up spin',
      'a turntable getting up to speed',
    ],
  },

  briefing: {
    observable: [
      'A wheel is drawn as a pale rim with a pale hub, and a dark spoke runs from hub to rim, turning clockwise.',
      'Every half second a short dark tick is stamped across the rim where the spoke has got to, and the ticks stay where they were stamped.',
      'The gap between one tick and the next keeps widening as the record fills, although every gap stands for the same half second.',
      'An accent-coloured sector opens between the last tick and the moving spoke, closing to nothing and reopening every half second, and reaching further open each time.',
      'When the record has run its course the ticks fade off the rim, the rim is left bare for a moment, and the stamping begins again from the start.',
      'One line under the wheel says that a mark goes down every half second and that the gaps go on widening.',
      'Two sliders sit under the wheel, one for the starting rate of turning and one for the angular acceleration, each showing its value.',
      'Moving a slider re-lays the ticks already stamped as well as those still to come, so the whole fan re-forms at once instead of bending only at its far end.',
      'With the angular-acceleration slider taken down to nothing the fan stands with even gaps all the way round; lifting it off nothing reopens the widening.',
      'Raising the starting rate widens every gap together, and they go on widening from one to the next just the same.',
    ],

    screen: {
      affordances: [
        'A slider sets the starting rate of turning and a second sets the angular acceleration; both carry their value in figures beside them.',
        'The angular-acceleration slider reaches all the way down to nothing, which is the setting that undoes the claim, and up to one where the fan opens sharply.',
        'Whatever a slider is moved to takes hold of the marks already on the rim as well as the ones to come, so the record answers to the setting as a whole.',
        'The half second between stamps is fixed and is not offered to be changed, which keeps "the same slice of the clock" as the thing held steady while the angle varies.',
        'The record fades and begins again on its own, so any setting can be watched from a bare rim.',
        'The rim carries nothing but the marks — no angle scale is laid round it, so a widening gap is read as time recorded rather than as the rim being ruled that way.',
      ],
    },

    useWhen: [
      'The reader has angular velocity in hand and is being handed a second symbol on top of it, and needs a case where the second symbol can be turned down to nothing and back — the fan of even gaps set against the fan of widening ones.',
      'The prose is running the parallel between straight-line and rotating quantities, and the rotating one has to be met on its own terms, as angle laid down on a rim rather than distance along a road.',
    ],

    avoidWhen: [
      'The subject is what a turning body’s acceleration does to its velocity, or where that acceleration aims. The rim carries marks and nothing else; no velocity and no arrow is drawn.',
      'Torque, moment of inertia or what sets the wheel going is the point. Nothing is applied to this wheel and no cause appears.',
      'Figures are to be read off or quoted. The value beside the angular-acceleration slider is carried to two places while the slider itself moves in finer steps, so neighbouring settings can print alike.',
      'The article is about revolutions, how many turns are made in a minute, or how long one turn takes. No turn is counted and no clock reading is shown.',
    ],

    contrastWith: [
      {
        concept: 'centripetal-acceleration',
        note: 'One asks how quickly the turning itself is picking up; the other holds the turning steady and asks what it does to the velocity meanwhile.',
      },
      {
        concept: 'uniformly-accelerated-motion',
        note: 'The same claim about a quantity that gains a fixed amount in every equal interval, made of angle swept on a rim rather than ground covered along a line.',
      },
      {
        concept: 'tangential-normal-acceleration',
        note: 'One counts how much angle is got through in equal times as the turning quickens; the other asks what an acceleration does to a velocity arrow and answers with two separate jobs.',
      },
    ],
  },
};
