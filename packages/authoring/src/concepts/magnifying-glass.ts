/**
 * magnifying-glass 개념 선언.
 *
 * 기구 넷 가운데 **렌즈 하나로 눈에 드는 각을 넓히는** 쪽이다. 무엇을 주장하는지로 갈랐다.
 *   magnifying-glass  렌즈 하나 · 초점 안 물체 · **맨눈 25 cm 와 견준 각**
 *   microscope        렌즈 둘 · 중간 실상 · 배율이 곱해진다
 *   telescope         렌즈 둘 · 멀리 있는 것 · 들어온 각 ↔ 나간 각
 *   lens-combination  맞닿은 렌즈 둘 · 상이 없다 · 굴절력이 더해진다
 * 이쪽만 맨눈 줄 · 시야각 쐐기 · 눈에 드는 빛만 긋는다 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magnifyingGlassConcept: Aperi21ConceptSource = {
  id: 'magnifying-glass',
  label: 'The Wider Angle a Hand Lens Gives the Eye',
  canonicalSim: 'aperi21:magnifying-glass',

  surface: {
    definition:
      'What a single converging lens does for an eye when the thing looked at is nearer than its focus: the light enters the eye spreading, and takes up a wider angle than it would unaided.',
    exemplarKeywords: [
      'magnifying glass',
      'hand lens',
      'why does a magnifier make things look bigger',
      'holding a lens close to a small object',
      'an object inside the focal length of a converging lens',
      'an upright enlarged virtual image',
      'angular magnification',
      'comparing with the naked eye at twenty five centimetres',
      'reading small print with a lens',
      'looking at an insect through a lens',
      'the image looks bigger but it is also further away',
    ],
  },

  briefing: {
    observable: [
      'The picture is in two rows. The upper row has a small ant standing on an axis, a convex lens, and an eye drawn as a circle with a bar for the pupil; a point marked F stands on the axis in front of the lens.',
      'The lower row has the same eye and the same ant with no lens between them, held at a measured distance that reads twenty-five centimetres. The two pupils are at the same place across the picture, so the two rows can be read against each other.',
      'In the upper row the ant stands nearer the lens than F. Three beams from the top of its head pass through the lens and reach the pupil — and they are still spreading apart when they get there, not closing.',
      'Dashed lines then grow backward from the lens and draw together at a place on the ant’s own side, further away than the ant is.',
      'Where they meet, a much larger ant stands the same way up as the small one, drawn as an outline with nothing inside it, and named as the image, with the figure two and a half beside it.',
      'At the same moment a wedge opens at the pupil, running from the foot to the head of that large outline, with a small arc drawn across it. The lower row carries a wedge and arc of exactly the same kind, drawn to the ant seen without a lens.',
      'The upper wedge is plainly the wider of the two, and the arcs, drawn at the same radius, make the comparison a matter of length rather than of trust.',
      'The ant then slides a little nearer F. The image that forms this time stands further away and is larger still, marked with the figure five, while the upper wedge is a little narrower than before — yet still wider than the naked-eye wedge below.',
      'The figures written on screen are the two magnifications and the twenty-five centimetres of the lower row; no distance of the image and no focal length is written anywhere.',
    ],

    screen: {
      affordances: [
        'The ant rests at two places inside F and slides between them in a fixed round, with nothing to press.',
        'The naked-eye row is on screen the whole time, which is what makes "larger" a comparison rather than an assertion.',
        'Only the light that actually enters the pupil is drawn, so the beams stand for what the eye receives rather than for everything the lens does.',
        'How large the thing looks is carried by the wedge at the pupil and its arc, not by the height of the outline, which is why the further of the two settings can give a bigger image and a slightly narrower wedge at once.',
        'The image is drawn as an unfilled outline because no light reaches the place where it stands, and it is drawn in the same ink as the ant rather than in a colour of its own.',
        'Where the image stands is worked out from the lens and the beams are then drawn to that result, so the dashed lines meeting at its head is a consequence.',
        'The screen opens at the nearer of the two settings with the beams, the dashed lines, the outline and both wedges already standing.',
      ],
    },

    useWhen: [
      'The article has said that a magnifier works by giving a larger angle at the eye rather than by making the thing itself bigger, and the reader has no picture of what that means. Two wedges at two pupils, drawn at the same place, are that picture.',
      'The point being made is that the enlarged thing seen through a hand lens is not somewhere a screen could be put — that it is a place the eye works back to. The dashed lines run to the ant’s own side and no beam goes there.',
      'The reader has been told to hold the object closer than the focus and wants to see what that condition buys them. Both resting places here are inside F, and the article can quote the two magnifications written beside the outlines.',
    ],

    avoidWhen: [
      'The instrument in the article has more than one lens, or a tube. There is one lens here and one act of enlargement.',
      'The thing being looked at is far away — a star, a hill, a bird. The whole picture depends on the ant being nearer the lens than its focus.',
      'The article wants the image distance, the focal length, the angles in degrees, or a formula for angular magnification. The only figures on screen are the two magnifications and the naked-eye distance.',
      'The subject is how the eye itself focuses, or what the lens inside the eye does. The eye here is a circle and a pupil, and nothing inside it changes.',
      'The point is that a lens can also throw a picture onto a wall or a screen, or the comparison between images that can and cannot be caught. Nothing is projected in this picture and there is no screen.',
      'The article is about the light bending at the glass surfaces, the shape of the lens, or why some colours or some heights miss. One lens acts in one step here and every beam behaves.',
    ],

    contrastWith: [
      {
        concept: 'microscope',
        note: 'One enlarges once and measures the gain as the angle offered to the eye against the unaided view; the other enlarges twice and measures the gain as the two enlargements multiplied together.',
      },
      {
        concept: 'telescope',
        note: 'Both end with the gain expressed as an angle at the eye, but one is for something small held nearer than the focus, and the other for something so distant that its light arrives parallel.',
      },
      {
        concept: 'real-vs-virtual-image',
        note: 'Both end with an upright enlarged image on the object’s side that light never reaches; one asks what that image does for the eye looking through, the other asks only whether a screen would catch it.',
      },
      {
        concept: 'concave-mirror',
        note: 'Both give an upright enlarged image when the object is brought inside the focus; one goes on to ask what that is worth to an eye, the other what happens on either side of that threshold.',
      },
    ],
  },
};
