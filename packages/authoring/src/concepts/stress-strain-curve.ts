/**
 * stress-strain-curve 개념 선언.
 *
 * 형제는 `youngs-modulus`. 이쪽은 **한 재료를 얼마나 멀리 당기는가**를 바꾼다 — 꺾인
 * 곳을 넘으면 놓아도 오던 곡선을 되짚지 않고 늘어난 채로 남는다. 저쪽의 여러 선 견줌 ·
 * 길이 무관 어휘는 쓰지 않고, 이쪽만 꺾임 · 되짚지 않음 · 남은 늘어남 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 **한 바퀴가 저절로 하는 일**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stressStrainCurveConcept: Aperi21ConceptSource = {
  id: 'stress-strain-curve',
  label: 'Stress–Strain Curve',
  canonicalSim: 'aperi21:stress-strain-curve',

  surface: {
    definition:
      'The changing response of one material as it is pulled further and further, which past a bend in the curve no longer comes back down the way it went up but leaves the body permanently longer.',
    exemplarKeywords: [
      'stress-strain curve',
      'elastic and plastic behaviour',
      'yield point of a material',
      'why does a bent paperclip stay bent',
      'permanent stretch after unloading',
      'it does not go back to its original shape',
      'loading and unloading a specimen',
      'pulled past the elastic limit',
      'unloading line parallel to the first slope',
      'pulling a bar until it gives',
    ],
  },

  briefing: {
    observable: [
      'A bar is fixed to a hatched wall at one end and pulled by a handle at the other, with an arrow for the pull and a dashed mark where the bar’s end started out.',
      'Beside the bar, axes named for stress and for strain carry the trail of where the bar has been, drawn as the pull goes on, with a dot for where it is now.',
      'First the bar is pulled a little: the trail is a straight sloping line, and on release the dot comes back down that very line to the origin and the bar is its original length again.',
      'Then the bar is pulled much further: the trail runs straight for a while, bends over, and past the bend a small further rise buys a great deal more stretch.',
      'Released from there, the dot does not retrace the curve — it drops along a straight line of the first slope and stops short of the origin.',
      'What is left over is marked in two places at once: a bracket in the accent colour on the bar itself, named as the stretch that stayed, and a matching segment along the strain axis from the origin.',
      'The bar visibly thins as it lengthens.',
      'The scene fades, a fresh bar comes in, and the whole round of seventeen seconds begins again.',
    ],

    screen: {
      affordances: [
        'The two pulls, the two releases and the change of bar run in order by themselves and repeat; arriving, the first pull is already under way.',
        'The small pull comes first, so the case that returns to the origin is seen before the case that does not, and both are drawn on the same pair of axes.',
        'The trail is left standing rather than wiped, so the way up and the way down can be compared at the place where they part.',
        'The claim is put as a question of shape — whether the dot comes home to the origin — and the axes carry no scale, so nothing invites a value to be read off.',
      ],
    },

    useWhen: [
      'The reader has been told a material "goes back when you let go" and has taken that as always true. The second release, dropping on a straight line and stopping short of the origin while the bar stands visibly longer, is what puts the limit on it.',
      'The article turns on the bend in the curve and needs the two sides of it shown on one set of axes by one bar, so that before and after are the same material.',
    ],

    avoidWhen: [
      'Materials are being compared with each other, or the question is whether length or material decides how much a thing gives. There is one material and one bar here.',
      'The regions and landmarks of the curve are what the article names — yield strength, ultimate strength, fracture, necking. Nothing on the curve is labelled and the bar never breaks.',
      'The area under the curve, energy stored or work done in stretching is the subject. The trail is read for its shape, not for what lies beneath it.',
      'The article is about a spring bobbing, or about a stiffness with a number attached. Nothing oscillates and no value is written anywhere.',
    ],

    contrastWith: [
      {
        concept: 'youngs-modulus',
        note: 'One keeps a single specimen and varies how far it is pulled, asking whether it comes back; the other keeps the pull well inside the range where it does come back and varies the specimen, asking what decides how far it gives.',
      },
    ],
  },
};
