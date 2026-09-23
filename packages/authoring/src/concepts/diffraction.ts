/**
 * diffraction 개념 선언.
 *
 * 이 묶음에서 가장 위험한 짝 — `slit-width-and-diffraction` 과 둘 다 틈과 퍼짐이다.
 * **묻는 것이 존재냐 정도냐**로 갈랐다.
 *   diffraction                 주어 = 그늘이어야 할 **자리**. 주장 = 거기에도 물결이 **있다**
 *   slit-width-and-diffraction  주어 = 퍼짐의 **정도**. 주장 = 틈 폭 ÷ 파장이 그것을 **정한다**
 * 이쪽만 「그늘 · 돌아 들어간다 · 날카로운 그림자가 아니다」 어휘를 갖고, 폭 · 비 · 견줌 어휘를
 * 쓰지 않는다. 틈은 하나이고 폭이 바뀌지 않는다는 사실은 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const diffractionConcept: Aperi21ConceptSource = {
  id: 'diffraction',
  label: 'Waves Reaching into the Geometric Shadow',
  canonicalSim: 'aperi21:diffraction',

  surface: {
    definition:
      'What a straight wave does after passing a narrow gap in a wall: rather than continuing as a beam, it curls into the region that should have been left in shadow.',
    exemplarKeywords: [
      'diffraction',
      'why can you hear someone round a corner',
      'waves bending around an obstacle',
      'waves spreading out after an opening',
      'sound comes through the doorway and fills the room',
      'waves do not cast sharp shadows',
      'ripple tank with a gap in the barrier',
      'behind the wall it should be quiet but it is not',
      'bending round an edge',
      'the shadow is not empty',
    ],
  },

  briefing: {
    observable: [
      'A ripple tank seen from above: straight bands come in from the left toward a solid wall that runs top to bottom with one narrow gap in the middle of it.',
      'Two dashed lines carry straight on from the two edges of the gap, marking out the band a beam the width of the gap would have kept to.',
      'The region outside those lines, right behind the wall, carries the words Shadow, if waves went straight.',
      'As soon as the front of the wave leaves the gap, curved crests appear behind it, centred on the gap and growing outward as half-circles.',
      'Those arcs reach past the dashed lines and keep going until crests and troughs are running through the named shadow region, up against the back of the wall itself.',
      'The pattern behind the gap is fainter than the straight bands in front of the wall, and it is fainter the further from the gap it gets.',
      'The wall shows nothing coming back off it — in front of it the bands stay straight and evenly spaced the whole time.',
      'A line under the tank says in turn that straight waves are heading for the gap, that past it they spread in arcs rather than going straight, and that they have bent into what should have been shadow.',
      'The water settles and the round starts again; there are no numbers, no angles and no arrows.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about fifteen seconds and repeats.',
        'The screen opens partway through, with the arcs already curling out past the dashed lines, so the spreading is caught in progress rather than waited for.',
        'The pattern behind the gap is worked out as the sum of many small sources sitting in the gap, so how far the wave reaches into the shadow is a result rather than a drawn shape.',
        'Judging it takes one look: is there anything moving outside the dashed lines.',
      ],
    },

    useWhen: [
      'The article has said that waves bend around obstacles and the reader has no picture of what that would even look like. The dashed lines put the expected sharp shadow on the same screen as the real thing, so the claim becomes a comparison the eye makes in one glance rather than a statement to be trusted.',
      'The reader’s everyday evidence is sound coming round a doorway, and the article needs that turned into something watched: the arcs curling back against the wall are that experience drawn.',
    ],

    avoidWhen: [
      'The point is what decides how much a wave spreads, or the article compares openings of different size. One gap is shown and its width never changes, so nothing here answers how much.',
      'The article is about two gaps and the pattern of bright and dark their waves make together. There is one gap and no fringes.',
      'The subject is building the spreading out of small secondary sources one circle at a time. The small sources are only how the picture is computed and none of them is drawn.',
      'The article turns on the wall sending waves back the way they came. In front of the wall the incoming bands are left undisturbed.',
      'Positions of dark bands, spreading angles, or anything needing a number are wanted. Nothing on this screen is measured.',
    ],

    contrastWith: [
      {
        concept: 'slit-width-and-diffraction',
        note: 'One settles whether a wave gets into the shadow at all; the other takes that for granted and asks what fixes how much of the shadow it fills.',
      },
      {
        concept: 'refraction-of-waves',
        note: 'Both leave a wave travelling in a direction it did not start in. One gets there by part of the wave being blocked, the other by part of it being slowed while the rest carries on.',
      },
    ],
  },
};
