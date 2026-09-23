/**
 * barometer 개념 선언.
 *
 * 압력 여섯 중 하나. 이쪽은 현상이 아니라 **장치** — 막힌 관 속 수은 기둥이 바깥 공기가
 * 미는 만큼 서고, 기압이 바뀌면 그 높이가 따라 움직인다. 「공기가 왜 누르는가」 는
 * `atmospheric-pressure`, 「두 압력의 차를 잰다」 는 `manometer` 의 몫이다.
 * 이쪽만 수은 · 관 · 진공 · 눈금 · 76 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const barometerConcept: Aperi21ConceptSource = {
  id: 'barometer',
  label: 'Barometer — Air Pressure Read as a Mercury Height',
  canonicalSim: 'aperi21:barometer',

  surface: {
    definition:
      'An instrument that reports the pressure of the outside air as the height of a mercury column standing in a sealed tube, the column sinking and climbing as that pressure changes.',
    exemplarKeywords: [
      'barometer',
      'Torricelli tube',
      'height of a mercury column',
      '760 millimetres of mercury',
      'how is air pressure measured',
      'why does the mercury not run out of the tube',
      'the vacuum above the mercury',
      'a falling barometer means a storm',
      'millimetres of mercury as a unit of pressure',
      'what holds the mercury up in the tube',
    ],
  },

  briefing: {
    observable: [
      'A glass tube closed at its top stands upside down in a dish of mercury, and the mercury in the dish is open to the air.',
      'Four arrows press down on that open surface, two on each side of the tube, standing for the outside air; they are marked p.',
      'Inside the tube the mercury stands as a column with nothing above it, and that empty space is named as a vacuum.',
      'A ruler beside the tube begins at the dish surface and measures the column’s vertical height, with a pointer tracking its top.',
      'At the start the arrows are at their longest and the top of the column stands at 76 on the ruler.',
      'As the air’s push weakens the arrows shorten, and the length they have given up shows above them as a faint copy marked p₀; the column sinks and the empty space above it lengthens.',
      'At the low pressure the arrows are three quarters of the faint copy, and the column’s top rests at 57.',
      'When the push returns the arrows grow again and the column climbs back to 76, and the round begins over.',
      'The mercury in the dish does not move while the column changes, so the ruler’s zero stays put.',
    ],

    screen: {
      affordances: [
        'The fall and the recovery both happen in one round with nothing pressed, so the column is seen at two settled heights and on the way between them.',
        'The height is read on a numbered ruler while the pressure is read as an arrow length, so the instrument’s whole job — turning one into the other — is drawn as two things moving together.',
        'The empty space above the mercury is drawn and named, so nothing in the picture is in a position to be pulling from above.',
        'The arrows press on the open dish rather than on the column, so whatever holds the column up arrives from outside the tube.',
        'The faint copy is shown only while the pressure is away from its highest, so a shortened arrow always has its full length beside it to be read against.',
      ],
    },

    useWhen: [
      'The reader takes the tube to be sucking the mercury upward, and the article needs the push to come from outside. Arrows on the open dish with a named emptiness above the column puts the cause where it belongs.',
      'The article uses a length of mercury as a unit of pressure and the reader cannot see why a length is a pressure. A ruler reading 76 and then 57 while the arrows shorten in the same proportion is that reason.',
    ],

    avoidWhen: [
      'The subject is why the air presses at all, or what becomes of that pressure as one goes up a mountain. The instrument stays where it is and nothing here accounts for where the push comes from.',
      'The point is that a tilted tube gives the same vertical height. The tube stands upright throughout and is never tipped.',
      'The article measures the pressure of a gas in a vessel against the surrounding air rather than measuring that air itself.',
      'Units have to be converted — hectopascals, atmospheres, pounds per square inch. The only figures written are 76 and 57 on the ruler.',
      'The subject is mercury as a substance, its density or its hazards, or how tall a tube some other liquid would need.',
      'The claim is about pressure varying with depth in a liquid. The column’s height is read as one number from its top to the dish surface, and nothing is sampled at different depths.',
    ],

    contrastWith: [
      {
        concept: 'atmospheric-pressure',
        note: 'One keeps the observer in place and lets the pressure change, reporting it as a height; the other keeps the pressure as it is and moves the observer up through it.',
      },
      {
        concept: 'manometer',
        note: 'Both read a pressure as a height of liquid, but one is sealed above and so reports the air against nothing at all, while the other is open at one end and can only report a difference.',
      },
      {
        concept: 'hydrostatic-pressure',
        note: 'One takes the tie between a height of liquid and a pressure as settled and builds an instrument on it; the other is where that tie is itself the claim being made.',
      },
    ],
  },
};
