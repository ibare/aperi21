/**
 * displacement-current 개념 선언.
 *
 * 이미 선언된 `amperes-law` 와, 같은 묶음의 `maxwells-equations` 와 갈랐다.
 *   displacement-current  **틈** — 전하가 하나도 건너가지 않는 자리를 두른 고리에도 같은 크기의 B
 *   amperes-law           **경로** — 실제 전류를 두른 어떤 모양의 경로든 합이 같다
 *   maxwells-equations    **빈 공간** — 두 짝이 서로를 낳으며 사슬로 번진다
 * 이쪽만 「축전기 · 판 사이 · 전하가 건너가지 않는데도」 어휘를 갖는다. 축전기가 얼마나
 * 담는가는 `parallel-plate-capacitor` 의 몫이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const displacementCurrentConcept: Aperi21ConceptSource = {
  id: 'displacement-current',
  label: 'The Term That Bridges a Capacitor Gap',
  canonicalSim: 'aperi21:displacement-current',

  surface: {
    definition:
      'That while a capacitor charges, a loop drawn round the empty gap carries just as much magnetic field as one drawn round the wire, although no charge whatever crosses between the plates.',
    exemplarKeywords: [
      'displacement current',
      'Maxwell’s extra term in Ampère’s law',
      'magnetic field between the plates of a charging capacitor',
      'no charge crosses the gap yet a magnetic field is there',
      'a changing electric field acts as a current',
      'Ampère-Maxwell law',
      'why Ampère’s law alone fails at a charging capacitor',
      'a loop round the gap against a loop round the wire',
      'rate of change of electric flux',
      'what the fourth Maxwell equation needed fixing for',
    ],
  },

  briefing: {
    observable: [
      'A wire runs left to right into a pair of round plates seen at a slant, and three loops of one and the same size are drawn round it — one about the left wire, one about the gap, one about the right wire.',
      'While the capacitor charges, marked electrons in the wire are pushed along and slow as they go, plus and minus marks gather on the plates, and field lines stand up between them, quickly at first and then more slowly.',
      'All three loops are equally dark and the three arrows riding on them are of equal length, shortening together as the charging runs down.',
      'Not one particle appears anywhere in the gap, and yet the gap’s loop never falls behind the other two.',
      'When the charging finishes, the lines between the plates stay standing at full height while all three loops disappear together.',
      'During discharge the current runs the other way, the lines between the plates come down, the three loops return, and all three arrows flip over at once.',
      'A bare stage follows with nothing on it but the empty plates, the wire and the electrons at rest.',
      'Nothing on the screen carries an equation, a scale or a number, and no graph is drawn.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; charging, full, discharging and empty come round in order and repeat.',
        'The three loops are given one radius on purpose, so that their strengths may be laid against one another at a glance.',
        'How strong the field is at a loop shows twice over — in how dark the loop is and in how long its arrow is.',
        'The loops and their arrows are the only things picked out in colour; the lines between the plates are in a second ink and the wire, plates, charges and current arrow in plain ink.',
        'The electrons carry a label of their own and travel against the current arrow.',
        'The plates and the loops are drawn as flattened circles, so that a loop reads as going round the wire rather than lying across it.',
        'Nothing is drawn inside the gap that could be mistaken for something crossing it, so the pairing of wire and gap rests on the loops alone.',
      ],
    },

    useWhen: [
      'The article has said that Ampère’s law needs an extra term and the reader has no picture of what goes wrong without it. Three loops of one size, one of them about a gap that nothing crosses, put the trouble and its repair in a single image.',
      'The prose needs it to be the changing of the electric field rather than its presence that counts. The stretch where the lines stand at full height and every loop has gone says so without a formula being written.',
    ],

    avoidWhen: [
      'The article is about how much charge a pair of plates will take, about moving them closer, or about a filling between them. The geometry here never changes.',
      'The subject is how the current or the voltage of a charging capacitor runs down over time, or a time constant. There is no graph and nothing is numbered.',
      'The field is to be compared at different distances from the axis, or the result that it grows with radius inside the plates is wanted. All three loops deliberately share one radius.',
      'The point is the energy held between the plates, or what is stored there.',
      'Something is meant to be seen crossing the gap — a spark, a leak, a carrier. The gap stays empty throughout, and that is the argument.',
      'The reader is to pick a loop of their own, or set how fast the charging goes. The run is fixed.',
    ],

    contrastWith: [
      {
        concept: 'amperes-law',
        note: 'One tries the rule on a path with no current passing through it at all and finds a field there anyway; the other tries it on paths of every shape around a real current and finds one total.',
      },
      {
        concept: 'maxwells-equations',
        note: 'One pins the coupling down inside a circuit, where the gap can be held against the wire; the other lets it loose in empty space where there is no wire to hold anything against.',
      },
      {
        concept: 'parallel-plate-capacitor',
        note: 'One watches the gap while the charge is changing and asks about magnetism there; the other asks how much charge the pair will hold and never mentions magnetism.',
      },
      {
        concept: 'field-of-straight-wire',
        note: 'One asks whether a loop around nothing can carry a field; the other asks what shape the field of a plain current takes and how it answers when the current is reversed.',
      },
      {
        concept: 'lc-oscillation',
        note: 'Both have a capacitor whose charge is changing and magnetism in the same account, but one claims the changing field in the gap is attended by a magnetic field exactly as a current would be, while the other takes both fields as given and follows the store passing from one to the other.',
      },
    ],
  },
};
