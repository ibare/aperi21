/**
 * uniform-field 개념 선언.
 *
 * 장 다섯 가운데 이쪽은 **어디에 놓아도 같다**가 주장이다 — 가장자리 밖에서만 달라진다.
 *   uniform-field             자리를 옮겨도 **같은 길이 · 같은 방향** (판 끝 밖만 예외)
 *   electric-field            자리 값이 **단위 전하가 받을 힘** (놓는 것을 바꿔 본다)
 *   field-of-dipole           한 쌍의 **모양과 빠른 떨어짐**
 *   charge-in-uniform-field   그 장 속 전하가 **어떤 길**을 가는가 — 놓아준 뒤의 이야기
 * 이쪽만 「평행판 · 어디서나 같다 · 가장자리 밖의 휨」 어휘를 갖고, 전하를 놓아주지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const uniformFieldConcept: Aperi21ConceptSource = {
  id: 'uniform-field',
  label: 'Field Between Parallel Plates, Same at Every Place',
  canonicalSim: 'aperi21:uniform-field',

  surface: {
    definition:
      'The field held between two parallel charged plates: a charge put anywhere between them feels a force of the same size and direction however near a plate it sits, and only out past the ends does it tilt and weaken.',
    exemplarKeywords: [
      'uniform electric field',
      'field between two parallel plates',
      'is the field stronger close to the plate',
      'the same force everywhere between the plates',
      'evenly spaced field lines',
      'fringing at the edges of the plates',
      'a region where the field does not vary',
      'parallel plate arrangement',
      'field strength equals voltage over separation',
      'charged plates facing each other',
    ],
  },

  briefing: {
    observable: [
      'Two flat plates face each other across a gap, the upper marked plus and the lower minus, drawn from the side.',
      'Faint field lines run between them straight and evenly spaced, and only beyond the ends of the plates do they swell outward and curve round to the lower plate.',
      'Four test charges appear at four places between the plates — at different heights and different places along, one of them tucked right up under the top plate — and all four carry arrows in the accent colour of the same length, pointing straight down.',
      'The four then travel to different places between the plates, and while they are moving their arrows keep the same length and the same direction.',
      'They come to rest at the new places with arrows exactly as they were, so nothing about the new places has made any difference.',
      'One charge afterwards goes out past the end of the plates into the region where the lines bulge; crossing the end, its arrow tilts outward by something like forty degrees and shortens to under half.',
      'A dotted copy of the between-the-plates arrow is left beside that charge so the shortening is measured against something rather than remembered.',
      'The three charges still between the plates keep their unchanged arrows while this happens.',
      'Nothing is written in volts, metres or any other unit, and no charge is ever let go.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the charges are placed, moved, and one is taken outside, and the run begins again.',
        'The field is worked out by treating the plates as conductors, so the charge gathering toward their edges is included and the equal arrow lengths are a result rather than something assumed.',
        'The charges between the plates serve as each other’s comparison, so only the one that leaves needs a dotted reference beside it.',
        'The accent colour is kept for the force a charge is feeling now; the dotted reference and the field lines are drawn back in quieter tones.',
        'One of the four is deliberately placed hard against the upper plate, since that is where a reader most expects the field to be stronger.',
      ],
    },

    useWhen: [
      'The article has asserted that the field between parallel plates is uniform and the reader silently doubts it, expecting more near a plate or less near an edge. Four arrows of one length, one of them right under a plate, and then the same four unchanged in new places, is what removes the doubt.',
      'The prose needs the limit of the claim as well as the claim: the arrangement is uniform inside and visibly stops being so past the ends.',
    ],

    avoidWhen: [
      'The article is about what makes the field — the voltage across the plates, their separation, or working a strength out from those. No quantity is written on screen.',
      'A charge is released and the path it then takes is the subject. Every charge here is placed and moved by hand and never let go.',
      'The subject is how much charge the plates hold, or the store of charge in such an arrangement. The plates carry one sign mark each and nothing else.',
      'The reader is meant to place a charge themselves. The four places and the move outside are fixed.',
      'The point is that field strength varies with distance from its source. Between these plates it does not vary at all, which is the whole claim.',
      'A negative charge in the gap, or the direction the field points as a separate question, is wanted. All four charges are positive and every arrow inside points the same way.',
    ],

    contrastWith: [
      {
        concept: 'electric-field',
        note: 'One holds what is put down fixed and varies the place, finding no difference; the other holds the place fixed and varies what is put down, finding the force change while the place does not.',
      },
      {
        concept: 'charge-in-uniform-field',
        note: 'One shows that the force is the same wherever a charge is put, with the charge always held; the other takes that sameness as given and follows a charge that has been let go.',
      },
      {
        concept: 'field-of-dipole',
        note: 'One is an arrangement contrived so the field neither varies nor fades across a region; the other is a pattern that does both sharply.',
      },
      {
        concept: 'field-lines',
        note: 'One draws lines only as background, because with equal spacing they say nothing more than the arrows do; the other makes spacing itself the claim and has to earn it.',
      },
    ],
  },
};
