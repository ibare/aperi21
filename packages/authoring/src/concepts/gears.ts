/**
 * gears 개념 선언.
 *
 * 이 묶음에서 **진동이 아닌** 유일한 개념이다. 회전 쪽 이웃과의 갈림은 원인을 어디에
 * 두느냐로 선다.
 *   gears                원인은 **지나간 톱니 수가 같다는 것** — 그래서 덜 돌고, 그만큼 세다
 *   mechanical-advantage 원인은 **거리와 힘의 맞바꿈** (지레 · 도르래 쪽 어휘)
 *   newtons-third-law    맞물린 자리의 두 힘이 **같은 크기로 서로에게** 걸린다는 것만
 *
 * 이쪽만 「톱니 · 맞물린다 · 같은 개수가 지나간다 · 기어비」 어휘를 갖는다.
 * 각가속도 · 관성 모멘트 어휘는 쓰지 않는다 — 화면은 각을 재지 않고 톱니를 센다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gearsConcept: Aperi21ConceptSource = {
  id: 'gears',
  label: 'Gears',
  canonicalSim: 'aperi21:gears',

  surface: {
    definition:
      'Two toothed wheels meshed so that teeth pass the joining place one for one, which leaves the wheel with more teeth turning correspondingly less far while carrying correspondingly more turning force.',
    exemplarKeywords: [
      'gears',
      'gear ratio',
      'meshed toothed wheels',
      'a small gear driving a big one',
      'tooth count decides the speed',
      'trading speed for turning force',
      'why low gear is stronger but slower',
      'gearing down a motor',
      'how many turns of the small one per turn of the big one',
      'teeth passing the mesh one for one',
      'driver and driven gear',
      'bicycle sprockets',
    ],
  },

  briefing: {
    observable: [
      'Two toothed wheels are drawn side on and meshed together, a small one and a larger one, each with a few lightened cut-outs in its body so that its turning can be followed. Under each, a line of text says how many teeth it has.',
      'They turn steadily together and their teeth go past the meshing place in step, one for one.',
      'Each tooth that goes past the meshing place is left filled in the accent colour, on both wheels alike, and under each wheel a second line counts how many have been marked so far. The two counts stay equal throughout.',
      'By the time the small wheel has come the whole way round, its rim is completely filled — every one of its teeth has been past. The large wheel has the same number of teeth filled, and they take up only a fraction of its rim.',
      'So the comparison is not read as a number but as how much of a rim has been used up: a full turn against a part of a turn, for the same count of teeth.',
      'The wheels keep turning, the filled teeth fade back to a faint record, and a second set of marks comes up over the same two wheels.',
      'At the meshing place two arrows of equal length appear pointing opposite ways, one belonging to each wheel, both labelled with the same letter — the push each tooth gives the other.',
      'From the centre of each wheel a measured line runs out to the meshing place, labelled as an arm, and the large wheel’s arm is labelled as a multiple of the small one’s.',
      'Outside each wheel a curved arrow sweeps round, and the large wheel’s curved arrow sweeps through a correspondingly larger angle than the small one’s, with labels naming them in the same multiple.',
      'How much the large wheel is behind in turning and how much it is ahead in turning force come out as the same multiple, which is the point the two sets of labels are placed to be read together.',
    ],

    screen: {
      affordances: [
        'The counting round and the force round follow one another and then start over, so both halves come by without being asked for.',
        'A row of choices at the top sets how many teeth the large wheel has, out of three settings; choosing one starts the counting again from the first tooth.',
        'Changing that setting changes both readings at once — how much of the large rim gets filled in one turn of the small wheel, and the multiples written on the arm and the curved arrow — so that the two can be checked against each other.',
        'The accent colour is kept for one meaning only, the teeth that have gone past the meshing place in this round, and it fades rather than vanishing when the force arrows come up.',
        'Both wheels are drawn in the same ink with the same kind of body, so that the only difference between them is size, and size here is tooth count.',
        'The only figures anywhere are the two tooth counts and the running count of teeth passed; how fast and how forcefully are shown as portions of a rim and lengths of arrows.',
      ],
    },

    useWhen: [
      'The article has stated the gear ratio as a rule to apply and the reader has no picture of where it comes from. Watching the same count of teeth fill a whole small rim and a fraction of a large one puts the cause in view before the result.',
      'The point to be made is that what is lost in turning is exactly what is gained in force, and a case is wanted where both multiples are written on the same picture at the same moment.',
      'The reader is to be shown that the push at the mesh is one and the same for both wheels and that the difference lies in the arm it acts on.',
    ],

    avoidWhen: [
      'The subject is how quickly a wheel gets up to speed, or what resists that. These two turn at a steady rate throughout and nothing is being sped up.',
      'The article is about ropes, levers or pulleys, where what is traded is distance moved rather than teeth gone past. Nothing flexible appears here.',
      'The gearing in question is of a kind not drawn here — belts, chains, a gear train of three or more, a worm drive, or wheels on non-parallel axles. Two meshed wheels on fixed parallel axles is all there is.',
      'What is wanted is values — speeds, turning forces, or the ratio worked out. Only tooth counts are written; everything else is a length or a portion.',
      'Friction, wear or the shape of the tooth profile is the point. The teeth are drawn as a simple approximation and they never slip.',
    ],

    contrastWith: [
      {
        concept: 'mechanical-advantage',
        note: 'Both trade motion for force by a fixed factor, but one gets that factor from counting teeth past a mesh, while the other gets it from the distances two ends of an arrangement move.',
      },
      {
        concept: 'newtons-third-law',
        note: 'One takes the equal and opposite push at the mesh as given and asks what the differing arms make of it; the other is about that equality itself and why the two pushes belong to different bodies.',
      },
      {
        concept: 'pulley-system',
        note: 'Both multiply force by an arrangement of wheels, but one has teeth that mesh so the two rims are locked to each other, while the other has a rope that runs and is shared out among several strands.',
      },
      {
        concept: 'angular-acceleration',
        note: 'One is about a steady ratio between two turning rates set by tooth count; the other is about a turning rate changing and what a turning force does to it.',
      },
    ],
  },
};
