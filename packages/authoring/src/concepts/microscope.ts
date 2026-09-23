/**
 * microscope 개념 선언.
 *
 * 기구 넷 가운데 **두 번 키운 몫이 곱해지는** 쪽이다. 무엇을 주장하는지로 갈랐다.
 *   microscope        렌즈 둘 · 경통 안 **중간 실상** · 막대가 이어 붙어 4 × 3 = 12
 *   magnifying-glass  렌즈 하나 · 중간 상이 없다 · 맨눈과 견준 각
 *   telescope         렌즈 둘 · 상을 그리지 않는다 · 각이 초점 거리 비만큼
 *   lens-combination  맞닿은 렌즈 둘 · 상이 없다 · 굴절력이 더해진다
 * 이쪽만 시료 · 대물 ↔ 접안 · 중간 실상 · 배율이 곱해짐 어휘를 갖는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const microscopeConcept: Aperi21ConceptSource = {
  id: 'microscope',
  label: 'Two Enlargements Multiplied',
  canonicalSim: 'aperi21:microscope',

  surface: {
    definition:
      'How a compound microscope gains its power: the first lens makes an enlarged inverted image inside the tube, the second enlarges that image again, and the two gains multiply.',
    exemplarKeywords: [
      'compound microscope',
      'objective and eyepiece',
      'total magnification is the product of the two',
      'why a microscope has two lenses',
      'the intermediate image inside the tube',
      'ten times objective with a ten times eyepiece',
      'the first image becomes the object for the second lens',
      'looking down a microscope at a specimen',
      'four hundred times magnification',
      'the objective does the first enlargement',
      'an inverted image partway up the barrel',
    ],
  },

  briefing: {
    observable: [
      'A short arrow stands for the specimen at one end of an axis, followed by a small lens, then a pair of thin walls marking the tube, then a larger lens at the far end. A point marked F stands in front of each lens.',
      'The specimen sits just beyond the first lens’s F, and beside the picture a bar stands, divided into squares one specimen-height tall.',
      'Two beams leave the tip of the specimen, pass through the first lens and close at a point inside the tube, where an arrow four squares tall appears pointing the other way up.',
      'As that arrow grows, the bar belonging to the first lens grows from one square to four, and the figure four is written against it.',
      'That inverted arrow stands inside the second lens’s F. Two fresh beams now leave its tip, pass through the second lens, and open apart on the far side instead of closing.',
      'Dashed lines continue those spreading beams backward, far down past the axis, and meet at a point where a dashed arrow stands, much longer than the one in the tube. The bar for the second lens grows from one square to three, and the figure three is written against it.',
      'A third bar then appears and a block of four squares — a copy of the first bar — is laid into it. The bar keeps growing, with a heavy rule drawn every four squares, until three such blocks stand end to end.',
      'That third bar is twelve squares long and carries the figure twelve, and its length is the same as the height of the dashed arrow.',
      'The beams are then drawn back in, the arrows and the third bar fade, the two remaining bars shrink to a single square, and the round begins again with the specimen and the two lenses alone.',
      'The squares are the specimen’s own height, so each bar’s length is the height of the image that lens produced, and "four, then three more times over" is something to be counted on the screen.',
    ],

    screen: {
      affordances: [
        'The two enlargements happen one after the other in a fixed round, with nothing to press.',
        'The first lens’s beams stop where they meet, and the second lens’s beams set out from that same tip, so the intermediate image being the second lens’s object is visible in where the light starts.',
        'Each image’s place and size are worked out from the lens and the beams are then drawn to that result, so the beams meeting where the arrow stands is a consequence.',
        'The image the light really reaches is drawn as a solid arrow and the one it only appears to come from as a dashed one, with the continuations dashed as well; the two are not told apart by colour.',
        'The multiplication is carried by the bars — the third one is built by laying down copies of the first, as many as the second bar has squares — rather than by a formula written on screen.',
        'Two beams are drawn per lens, which is the fewest that fix where an image stands, so the tube is not crowded.',
        'The marks F in front of each lens are what place the specimen just outside the first and the intermediate image just inside the second.',
        'The screen opens with the first enlargement complete: the beams gathered, the inverted arrow standing in the tube and its bar four squares long.',
      ],
    },

    useWhen: [
      'The article has given the rule that total magnification is the objective times the eyepiece, and the reader takes it on trust. Here the third bar is physically built out of copies of the first, as many as the second has squares.',
      'The point being made is that a microscope is not one strong lens but two stages, and the reader has no picture of the intermediate image. It stands inside the tube here, inverted, and the second lens’s light sets out from it.',
      'The reader has been told that the eyepiece works as a magnifier on the first image and would like to see why that image has to fall where it does. The mark F in front of the second lens, with the inverted arrow just inside it, is that condition on screen.',
    ],

    avoidWhen: [
      'The instrument in the article is aimed at something far away. The specimen here sits a hair beyond the first lens’s focus and the light from it arrives spreading.',
      'The subject is a single lens held up to the eye. Two lenses act here in turn and the intermediate image between them is the whole point.',
      'The article wants focal lengths, tube length, numerical aperture, or the resolution limit. The only figures on screen are the three magnifications, and no distance is written anywhere.',
      'The point is how much light an instrument gathers, how bright the view is, or how a specimen is lit. Nothing here concerns brightness.',
      'The subject is what an eye does with the light after the instrument, or the angle a thing takes up at the pupil. No eye is drawn, and nothing is compared with an unaided view.',
      'The article is about two lenses laid against one another, or about strengths that add. The two lenses here are held apart at a fixed separation, and what combines is not their strengths but their enlargements.',
    ],

    contrastWith: [
      {
        concept: 'magnifying-glass',
        note: 'One enlarges twice and measures the gain as the two enlargements multiplied; the other enlarges once and measures it as the angle offered to the eye against the unaided view.',
      },
      {
        concept: 'telescope',
        note: 'Both hold two lenses apart in a tube; one is for something small and close, and follows the images it makes, the other for something far away whose light arrives parallel, where what is gained is an angle rather than a size.',
      },
      {
        concept: 'lens-combination',
        note: 'One keeps the lenses apart so that each forms its own image and the enlargements multiply; the other holds them in contact so that they act as a single lens whose strength is the sum.',
      },
      {
        concept: 'real-vs-virtual-image',
        note: 'Both put an image light truly reaches and one only its continuations reach in the same picture; one uses the pair as the two stages of an instrument, the other asks which of them a screen would catch.',
      },
    ],
  },
};
