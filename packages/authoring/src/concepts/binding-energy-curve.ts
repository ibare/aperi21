/**
 * binding-energy-curve 개념 선언.
 *
 * 핵 둘 가운데 **에너지 쪽**이다.
 *   nuclear-structure     알갱이 수가 이름을 정한다 — 동위원소와 원소
 *   binding-energy-curve  같은 핵들을 한 곡선에 올려 **핵자당 얼마나 단단한가**를 견준다 —
 *                         철이 꼭대기라 가벼운 쪽은 합쳐서, 무거운 쪽은 쪼개서 그리로 오른다
 * 이쪽만 곡선 · 꼭짓점 · 오른 높이 = 나온 에너지 어휘를 갖는다. 한 번의 분열 사건(흔들림 ·
 * 아령 · 중성자)은 `nuclear-fission` 의 몫이라 점 하나가 둘로 갈리는 것으로만 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const bindingEnergyCurveConcept: Aperi21ConceptSource = {
  id: 'binding-energy-curve',
  label: 'Binding Energy per Nucleon and the Peak at Iron',
  canonicalSim: 'aperi21:binding-energy-curve',

  surface: {
    definition:
      'Why energy comes out both of joining light nuclei and of splitting heavy ones: binding energy per nucleon climbs steeply to a peak near iron-56 and falls away slowly beyond it.',
    exemplarKeywords: [
      'binding energy per nucleon',
      'the curve peaking at iron-56',
      'why does fusion work for light elements and fission for heavy ones',
      'why is iron the end of the line',
      'where nuclear energy comes from',
      'the most tightly bound nucleus',
      'climbing toward the peak from both sides',
      'why you cannot get energy from fusing iron',
      'mass number on the horizontal axis',
      'the steep rise from hydrogen to helium',
      'energy released as the height gained on the curve',
    ],
  },

  briefing: {
    observable: [
      'A curve is drawn across the panel from the start and stays. It rises almost vertically at the far left, runs through a highest point marked by a hollow circle, and then falls away slowly and at length toward the right-hand end.',
      'The horizontal direction is mass number and the vertical starts from nothing, so the whole climb from the lightest nucleus is inside the picture.',
      'Four dots scattered about the leftmost end gather together, and the merged dot then climbs up the curve to the helium position. As it climbs, a highlighted arrow grows beneath it from the bottom of the panel up to where it lands, with the word for energy beside it.',
      'An arrow then grows underneath the curve on the left, pointing toward the peak, and is named.',
      'Over at the right-hand end the heaviest dot parts into two, and a faint dashed line is laid across at the height it started from.',
      'The two new dots travel up and to the left to their own places on the curve, and short highlighted arrows grow from the dashed line up to each of them, again with the word for energy.',
      'A second arrow then grows beneath the curve from the right, also pointing toward the peak, and is named.',
      'A dotted vertical rises at the peak and a figure for its height appears. Both named arrows are pointing at it.',
      'The arrow on the light side is far longer than the two on the heavy side.',
      'The two pieces from the right-hand end come to rest a little below the curve rather than on it.',
      'The curve itself is not smooth: there are small steps at a few of the light positions.',
      'Nothing is ruled and no scale figures are written on either direction; the only number on screen is the height of the peak.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The gathering, the climbing, the parting and the naming run on their own and the round repeats.',
        'Mass number is used as it stands rather than compressed, so the near-vertical wall at the light end and the long gentle slope past the peak both keep their true shapes and the peak sits well over to the left.',
        'The vertical direction starts from nothing, because the whole height gained from the lightest nucleus is half of what is being claimed.',
        'What the energy released is read from is the length of an arrow, each measured from its own starting height: the bottom for the joining, the dashed line for the splitting.',
        'The two routes are told apart by which side they start on, which way their arrows point and what they are called, not by colour.',
        'The highlight belongs to the energy released and to nothing else.',
        'The curve runs through real nuclei rather than being smoothed, so the small steps at a few light positions are left in.',
        'The two pieces are put at their own heights rather than on the curve, since they are not among the nuclei the curve runs through.',
        'The named arrows are set in the open space below the curve rather than against it, where they would run into the pieces and their labels.',
        'The pieces get their names only once they have arrived, so a name is never sitting alone at a place nothing has reached.',
        'It opens with the light nuclei already gathering.',
      ],
    },

    useWhen: [
      'The article has said that energy comes both from joining and from splitting, and the reader needs one picture in which those are the same move made from opposite sides.',
      'The point is that the peak is where it stops. Both named arrows end up pointing at the same place and the figure for its height is the only number given.',
      'The article needs the energy released to be something read off rather than quoted. It is the height gained, and the far greater length of the arrow on the light side is there to be seen.',
      'The reader wants to know why heavy nuclei are the ones worth splitting and light ones the ones worth joining, and needs the shape of the curve to be the answer.',
    ],

    avoidWhen: [
      'The subject is what a single splitting event looks like, what it produces, or the particles it throws off.',
      'The article is about where in a star each element is built and in what order.',
      'The point is why the curve has the shape it does — the competing contributions that go into it.',
      'The figures wanted are the energy of a particular reaction, a mass defect, or a conversion of mass into energy.',
      'The subject is what a nucleus is called, how isotopes are written, or how many of each particle it holds.',
      'The article is about how quickly an unstable nucleus comes apart. Nothing here is about time.',
    ],

    contrastWith: [
      {
        concept: 'nuclear-fission',
        note: 'One asks how much a single rearrangement of nucleons is worth and reads it as a height gained; the other follows one such rearrangement through, from the trigger to the pieces flying apart.',
      },
      {
        concept: 'nuclear-structure',
        note: 'One takes the counts of protons and neutrons as given and asks how tightly they are held; the other asks what those counts make the nucleus called.',
      },
      {
        concept: 'stellar-nucleosynthesis',
        note: 'Both read the same curve, but one walks up it from the light side only, inside a star, and halts at the peak; the other puts both directions on it and measures what each direction gains.',
      },
      {
        concept: 'chain-reaction',
        note: 'One asks what a single event is worth; the other asks how many further events one event brings about.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One is a stored-energy shape that a single body moves along and turns back on; the other a comparison across many different nuclei, read as a height each one could still climb.',
      },
    ],
  },
};
