/**
 * manometer 개념 선언.
 *
 * 압력 여섯 중 하나. 이쪽도 장치지만 `barometer` 와 **재는 대상**이 다르다 — 저쪽은
 * 막힌 관으로 바깥 공기 자체를, 이쪽은 열린 관으로 **두 압력의 차**를 잰다. 그리고
 * 이 조각만 한 화면에 관을 둘 두어 **액체가 가벼울수록 잘 읽힌다** 를 함께 주장한다.
 * 이쪽만 U자관 · 액면 차 · 물과 수은의 견줌 · 감도 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const manometerConcept: Aperi21ConceptSource = {
  id: 'manometer',
  label: 'Manometer — Pressure Difference as a Gap Between Two Levels',
  canonicalSim: 'aperi21:manometer',

  surface: {
    definition:
      'A gauge in which the gap between the two liquid surfaces of a U-tube measures how far a gas’s pressure lies from the surrounding air, a lighter filling liquid opening a wider gap.',
    exemplarKeywords: [
      'manometer',
      'U-tube pressure gauge',
      'gauge pressure of a gas',
      'difference between two liquid levels',
      'why use water rather than mercury in a gauge',
      'measuring a small pressure difference',
      'how far above the surrounding pressure',
      'sensitivity of a liquid column gauge',
      'the gas pushes one level down and the other up',
      'reading a pressure off a pair of levels',
    ],
  },

  briefing: {
    observable: [
      'A gas vessel in the middle sends a pipe out on each side into the inner arm of a U-tube; the outer arm of each is open to the air and is named so.',
      'The left U-tube holds water and the right one mercury, and both are fed from that one vessel, so they are under the same difference at the same instant.',
      'As the gas pressure rises, an arrow of the same length grows on the inner surface of each tube and presses it down, and the outer surface climbs by as much as the inner one falls.',
      'A bracket outside each open arm measures the gap between that tube’s two surfaces, with a faint guide line carried across from the inner surface.',
      'The water tube opens a tall gap; the mercury tube’s two surfaces barely part, and its bracket comes out only a few pixels long.',
      'The two brackets stand side by side through the whole of the held stretch, with the two pressure arrows still equal in length beside them.',
      'When the difference drains away both tubes come back to level surfaces, and the round begins again.',
      'Nothing is numbered anywhere: the two liquids are named, the outside air is named, and the reading is the length of a bracket.',
    ],

    screen: {
      affordances: [
        'The rise, the hold and the release run in one round with nothing pressed, and the hold is the longest stretch because that is where the two brackets are meant to be read against each other.',
        'Both tubes hang off one vessel, so "the same pressure difference" is guaranteed by the plumbing rather than asked for on trust.',
        'Only the excess above the outside air is drawn as an arrow; the share both arms carry equally is deliberately left out, which is what lets the two arrows be identical.',
        'The mercury gap is drawn at its true size against the water one, so the claim that a lighter liquid reads better is never helped along.',
      ],
    },

    useWhen: [
      'The article gives a gauge reading as a height and the reader cannot see why two surfaces have to be involved. One surface pushed down while the other climbs, both taken in by one bracket, is the reason.',
      'The choice of filling liquid is at stake — water for small differences, mercury for large ones. Two tubes on one vessel, one opening a tall gap and one barely parting, settles it without an argument.',
    ],

    avoidWhen: [
      'The pressure to be measured is that of the surrounding air itself. Both open arms stand in that air here, and what is reported is the excess over it.',
      'The article needs an absolute pressure. The share both arms carry alike is deliberately not drawn.',
      'The point is why the pressure difference arose — a pump, a piston, a compression. The gas simply becomes more pressed and nothing shows how.',
      'The subject is a liquid running through a narrowing, or a pressure dropping where a fluid speeds up. Nothing flows here.',
      'Figures are wanted — pascals, centimetres, the ratio of the two densities. Only the names of the liquids are written.',
      'The claim is that pressure grows with depth. That growth is what makes the gauge work, but nothing in the picture is read against a depth.',
    ],

    contrastWith: [
      {
        concept: 'barometer',
        note: 'Both turn a pressure into a height of liquid, but one is sealed above and reports a pressure against nothing, while the other is open at one end and can report only how two pressures differ.',
      },
      {
        concept: 'atmospheric-pressure',
        note: 'One takes the surrounding air as the settled zero it measures against; the other asks what that air’s own pressure is and why it has one.',
      },
      {
        concept: 'hydrostatic-pressure',
        note: 'One is where the tie between a height of liquid and a pressure is the claim under test; the other takes it as settled and makes an instrument of it.',
      },
    ],
  },
};
