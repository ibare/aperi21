/**
 * telescope 개념 선언.
 *
 * 기구 넷 가운데 **각만 말하는** 쪽이다. 무엇을 주장하는지로 갈랐다.
 *   telescope         멀리서 나란히 온 빛 · 나갈 때 더 기운다 · θ 가 몇 번 들어가느냐
 *   microscope        가까운 시료 · 상이 둘 · 배율이 곱해진다
 *   magnifying-glass  렌즈 하나 · 초점 안 물체 · 맨눈과 견준 각
 *   lens-combination  맞닿은 렌즈 둘 · 굴절력이 더해진다
 * 이쪽만 공통 초점 · 나란히 들어와 나란히 나간다 · 초점 거리 비 어휘를 갖는다. 상 · 크기는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const telescopeConcept: Aperi21ConceptSource = {
  id: 'telescope',
  label: 'The Angle a Telescope Opens Out',
  canonicalSim: 'aperi21:telescope',

  surface: {
    definition:
      'What two lenses sharing one focus do to light arriving from far away: it comes in parallel at a small slant and leaves parallel at a steeper one, set by the ratio of their focal lengths.',
    exemplarKeywords: [
      'refracting telescope',
      'objective and eyepiece focal lengths',
      'magnification is f objective over f eyepiece',
      'why a telescope tube is as long as the two focal lengths',
      'parallel light in and parallel light out',
      'the two lenses share a focus',
      'a shorter eyepiece gives more magnification',
      'looking at a star through a telescope',
      'the angular size of a distant object',
      'the image through a telescope is upside down',
      'how much bigger does a telescope make things look',
    ],
  },

  briefing: {
    observable: [
      'A long lens stands at one end of an axis and a short one further along, with a dashed mark between them at the place where both of their focuses fall together.',
      'Five parallel beams arrive from the left, lying at a very shallow slant to the axis, and a narrow wedge at the first lens shows how small that slant is, named with the letter theta.',
      'The beams close at a single point at the shared focus and then open out again, leaving the second lens parallel once more — but now tilted downward, more steeply than they came in.',
      'A second wedge, of the same radius as the first, is drawn where the middle beam crosses the axis after the second lens. It is plainly wider, and it carries tick marks laid at one, two, three times the incoming slant.',
      'The ticks let the outgoing wedge be counted in units of the incoming one; at the first setting there are five such divisions, and a label reads five thetas.',
      'Measured lines below the axis read one hundred centimetres for the first lens, twenty for the second, and one hundred and twenty for the distance between them.',
      'The second lens then swells and moves in toward the first. The shared focus stays where it is, the outgoing beams tilt further and further, and the ticks in the outgoing wedge grow more numerous.',
      'When it settles, the measured lines read ten centimetres and one hundred and ten, the outgoing wedge holds ten divisions, and the label reads ten thetas — while the incoming wedge has not changed at all.',
      'The outgoing set of beams is also narrower than the one that arrived, and it slants to the other side of the axis from the incoming beams.',
      'The second lens then thins and moves back out, and the round begins again.',
    ],

    screen: {
      affordances: [
        'The eyepiece is exchanged for a shorter one and back again in a fixed round, holding at each, with nothing to press.',
        'The two lenses are kept sharing one focus throughout, including while the exchange is under way, so the separation follows the focal lengths rather than being set on its own.',
        'The incoming slant is fixed for the whole round, which leaves the eyepiece as the one thing that can account for the outgoing slant changing.',
        'Both wedges are drawn at the same radius and in the same colour, so the comparison of the two angles is a matter of arc length, and they are told apart by where they sit and by their labels.',
        'The ticks in the outgoing wedge are laid at whole multiples of the incoming slant, so the gain is counted rather than quoted, and the last tick falls on the outgoing beams themselves.',
        'The incoming slant is kept genuinely small, which is why its wedge is only a sliver — a distant thing subtending a small angle is the situation the instrument exists for.',
        'The figures for the eyepiece, the separation and the count fade out while the exchange is in progress and return once it has settled, since between the two settings they would not be true.',
        'The screen opens at the longer eyepiece with the beams, both wedges and all three measurements standing.',
      ],
    },

    useWhen: [
      'The article has given magnification as the ratio of the two focal lengths, and the reader can compute it without seeing it. Here the outgoing angle is divided into copies of the incoming one and counted, and the count changes from five to ten as the eyepiece is halved.',
      'The point being made is that a telescope does not make a distant thing bigger but makes it take up a wider angle. The light arrives parallel and leaves parallel here, so there is no size anywhere in the picture to mistake for the gain.',
      'The reader wants to know why the tube has the length it does, or why fitting a shorter eyepiece both raises the power and shortens the instrument. The shared focus is held while the separation is measured, and both readings change together.',
    ],

    avoidWhen: [
      'The thing being looked at is close enough for its light to arrive spreading. Every beam here comes in parallel, which is what standing in for a distant source means.',
      'The article follows the images an instrument makes — an intermediate one in the tube, its size, its way up. No image is drawn here at any stage; the picture has angles in it and nothing else.',
      'The subject is a telescope with a mirror rather than a lens at the front, or the light-gathering power of a large opening. Two lenses are drawn, and nothing concerns brightness.',
      'The article is about lenses laid against one another or about strengths adding. These two are held apart at exactly the sum of their focal lengths, and that separation is the whole arrangement.',
      'The figures wanted are the angles in degrees, the magnification computed from the focal lengths, or the field of view. What is written is the two focal lengths, the separation, and how many incoming angles fit into the outgoing one.',
      'The subject is a defect — colours parting, or the outer light missing the focus. Every beam here passes cleanly through the shared focus.',
    ],

    contrastWith: [
      {
        concept: 'microscope',
        note: 'Both hold two lenses apart in a line; one is for light from far away and speaks only of the angle it leaves at, the other for something small and close and follows the two images it makes.',
      },
      {
        concept: 'magnifying-glass',
        note: 'Both express their gain as an angle at the eye; one takes light arriving parallel from far off and compares the angle in with the angle out, the other takes a small nearby thing and compares the lens with the unaided view.',
      },
      {
        concept: 'lens-combination',
        note: 'One holds two lenses apart at the sum of their focal lengths so that what is gained is an angle; the other holds them in contact so that they act as one lens whose strength is the sum.',
      },
      {
        concept: 'stellar-parallax',
        note: 'Both turn on a small angle subtended by something far away; one opens that angle up with glass to make it visible, the other measures how it shifts over a year to get the distance.',
      },
    ],
  },
};
