/**
 * michelson-morley 개념 선언.
 *
 * 이 묶음에서 혼자 **실험**이다. 나머지 아홉이 상대론의 결과를 보이는 데 견주어, 이쪽은
 * 상대론 앞에 놓인 **관측 하나**를 주장한다 — 예측된 신호가 나타나지 않았다.
 *   michelson-morley  가설이 예측한 밀림이 **없다** (부정 결과)
 *   light-clock       빛의 빠르기가 같다는 것을 **전제로 삼아** 늘어난 째깍을 작도한다
 * 이쪽만 에테르 · 간섭계 · 무늬 · 1887 · 영(null) 결과 어휘를 갖는다. 간섭 무늬는 재는
 * 자일 뿐 주장이 아니라서 간섭 개념들과도 갈린다.
 *
 * 조각에 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const michelsonMorleyConcept: Aperi21ConceptSource = {
  id: 'michelson-morley',
  label: 'The Interferometer That Found No Ether Wind',
  canonicalSim: 'aperi21:michelson-morley',

  surface: {
    definition:
      'The measurement in which an instrument turned through a quarter turn should have shown a predicted shift in its fringes if a wind of ether existed, and showed none.',
    exemplarKeywords: [
      'Michelson-Morley experiment',
      'the ether wind that was never found',
      'turning an interferometer through ninety degrees',
      'a null result',
      'fringes that refuse to move',
      'was there a luminiferous ether',
      'the 1887 experiment in Cleveland',
      'the predicted shift of about four tenths of a fringe',
      'two arms at right angles, one along the motion of the Earth',
      'the experiment that cleared the ground for relativity',
    ],
  },

  briefing: {
    observable: [
      'On the left an instrument is drawn from above — a square slab carrying a lamp, a half-silvered plate where the light divides, a mirror at the end of each of two arms set at right angles, and a viewer looking in at the far side.',
      'Faint grey streaks drift steadily across the slab from one side, labelled as the wind that would blow past if it were there at all.',
      'A written length marks one arm at eleven metres, and the drifting wind carries the figure thirty kilometres a second.',
      'On the right, two horizontal bands of light and dark stripes sit one above the other, both painted in the same brightness, telling apart only by the words written beside them — one is what the ether picture predicts, the other is what was actually seen.',
      'A single dark vertical line runs down through both bands at the same place, giving the two something common to be measured against.',
      'The slab turns smoothly through a quarter turn, and a dotted line left behind at the starting direction, together with a wedge of angle, shows how far it has gone; the two mirror names turn with it, so the arm that lay along the wind now lies across it.',
      'As the turn proceeds, the bright stripe of the upper band slides steadily away from the vertical line, while the bright stripe of the lower band stays exactly where it was.',
      'Once the turn is complete, a measured span runs between the vertical line and the shifted stripe of the upper band, reading about four tenths of a fringe.',
      'The slab then turns back, the upper band slides home again, and the lower band has still not moved — so standing still is shown at two different orientations rather than at one.',
    ],

    screen: {
      affordances: [
        'The turn, the return and the whole round run by themselves and then start over; nothing has to be pressed.',
        'Both bands are on screen at once, so the comparison is made by looking across from one to the other rather than by switching between two pictures.',
        'The bands share one vertical reference line and one brightness, so what tells them apart is the wording beside each and whether the stripe moves.',
        'The arms are drawn shorter than they really are and their length is stated in writing instead, while the sliding of the stripe is drawn at true size in fringes — the effect being looked for is not made bigger than it was.',
      ],
    },

    useWhen: [
      'The article is about to say that the speed of light comes out the same however the measuring apparatus moves, and the reader needs to know that this was forced by a measurement rather than chosen. The band that ought to have moved, drawn beside the band that did not, is what makes a null result something to look at.',
      'The reader has met the phrase "no ether wind was detected" and cannot picture how one would detect a wind at all. Seeing the instrument physically turn while the observed stripe stays pinned is what makes the procedure concrete.',
    ],

    avoidWhen: [
      'The subject is how interference fringes arise, or what makes bright and dark bands from two paths. The bands here are already made and are used only as a ruler.',
      'The article is about a moving clock, a moving rod, or the ordering of events. Nothing on screen is timed, measured for length, or ordered.',
      'What is wanted is the round-trip time along each arm, or the algebra by which the predicted shift is worked out. The prediction appears only as a drawn band and a stated fraction of a fringe.',
      'The point is the orbital motion of the Earth or the seasons of the measurement. One steady drift is drawn and no orbit appears.',
      'The colour of the light matters to the article. Only brightness is painted, and no wavelength is written anywhere.',
    ],

    contrastWith: [
      {
        concept: 'light-clock',
        note: 'One is the measurement that took away the medium light was supposed to move through; the other begins by granting that the speed of light is the same for everyone and works out what that costs a moving clock.',
      },
      {
        concept: 'interference',
        note: 'One asks how two paths of light combine into bands at all; the other takes the bands as already understood and asks whether turning the instrument moves them.',
      },
      {
        concept: 'youngs-double-slit',
        note: 'One uses fringes to establish that light behaves as a wave; the other uses them as a fine ruler for a shift that never arrived.',
      },
      {
        concept: 'relativity-of-simultaneity',
        note: 'One is an experimental finding about a medium that is not there; the other is a consequence drawn afterwards about what the word "at the same time" can mean.',
      },
    ],
  },
};
