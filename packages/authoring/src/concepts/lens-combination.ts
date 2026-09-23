/**
 * lens-combination 개념 선언.
 *
 * 기구 넷 가운데 **상을 하나도 만들지 않는** 하나다. 무엇을 주장하는지로 갈랐다.
 *   lens-combination  맞닿은 두 렌즈 = 렌즈 하나 — 모이는 자리가 다가오고 멀어진다. 상이 없다
 *   magnifying-glass  렌즈 하나 · 눈에 드는 각
 *   microscope        떨어진 두 렌즈 · 상이 둘 · 배율이 곱해진다
 *   telescope         떨어진 두 렌즈 · 각이 커진다
 * 이쪽만 「붙인다 · 떼어 낸다」 · 굴절력이 쌓이고 깎인다 · 나란한 빛이 모이는 거리 어휘를 갖는다.
 * 물체 · 상 · 배율 · 눈은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lensCombinationConcept: Aperi21ConceptSource = {
  id: 'lens-combination',
  label: 'Two Lenses Held Against Each Other',
  canonicalSim: 'aperi21:lens-combination',

  surface: {
    definition:
      'What happens to the distance at which parallel light gathers when a second lens is laid against the first: another converging lens brings it nearer, a diverging one pushes it further away.',
    exemplarKeywords: [
      'combination of lenses',
      'two lenses in contact',
      'combined focal length',
      'lens power adds up',
      'dioptres',
      'what happens if you stack two magnifying glasses',
      'adding a diverging lens to a converging one',
      'one over f equals one over f one plus one over f two',
      'the focus moves closer when you add a second lens',
      'a weaker lens in front of a stronger one',
      'compound lens made of two elements',
    ],
  },

  briefing: {
    observable: [
      'A single lens stands on an axis with five parallel beams arriving from the left; past the lens they slope inward and close at a point, and a measured line under the axis reads twenty centimetres.',
      'A tall bar stands at the side of the picture, divided into blocks. At the start it holds one block, labelled for the first lens, and reads five dioptres.',
      'A second lens of the same shape comes down from above and settles against the right face of the first, touching it. While it moves the beams past the lens are withdrawn, and a second block piles onto the bar.',
      'The beams then grow out again, now sloping inward more steeply, and close much nearer the glass; the measured line reads ten centimetres and the bar reads ten dioptres.',
      'An empty ring is left standing at the place where the light used to gather, so the new gathering point can be seen to have come in toward the lens rather than merely to have been redrawn.',
      'The second lens lifts away, its block shrinks off the bar, and a lens thin in the middle comes down in its place and settles against the first.',
      'Now the beams slope inward only gently and close beyond the empty ring; the measured line reads forty centimetres. On the bar the new block is hatched and eats down from the top of the first one, and the reading falls to two point five dioptres.',
      'A marker line across the bar sits at whatever the blocks currently come to, so piling on and cutting down are the same kind of change read on one scale.',
      'The thin lens lifts away and the picture returns to the single lens with its beams closing at twenty centimetres, and the round begins again.',
      'The numbers written are the three gathering distances and the three bar readings, and they appear only once the beams have settled.',
    ],

    screen: {
      affordances: [
        'The second lens comes and goes on its own in a fixed round, holding at each pairing, with nothing to press.',
        'The two lenses are always in contact, so nothing about the spacing between them is ever at stake in the picture.',
        'Whenever the pairing changes, the light beyond the glass is drawn back into the lens and then grows out again, so the moment of switching is never on screen as a half-bent beam.',
        'The slope of the beams is worked out from the pair taken as one piece of glass, so where they close is a consequence of the pairing rather than a drawn-in point.',
        'The block added for a converging lens piles upward and the one for a diverging lens is hatched and cuts down from the top, which is how adding and subtracting are told apart without a second colour.',
        'The empty ring holds the first gathering distance in place for the rest of the round, so nearer and further are compared against a mark rather than remembered.',
        'The beams are drawn in one colour throughout; which pairing is in force is told by the shape of the glass that has settled against the first lens.',
        'The screen opens with the single lens alone and its beams already closed at their point.',
      ],
    },

    useWhen: [
      'The article has given the rule that the strengths of touching lenses add and the reader can apply it but has never seen it. Here one bar grows or is eaten into as each lens arrives, next to the light whose gathering distance moves at the same moment.',
      'The point being made is that a lens thin in the middle does not simply undo a lens thick in the middle but weakens it by a definite amount. Both are laid against the same first lens here, one after the other, and the outcome is read off the same mark.',
      'The reader knows that opticians talk in dioptres rather than focal lengths and has not seen why that unit is the convenient one. Adding is what the bar does, and the gathering distance is what does not add.',
    ],

    avoidWhen: [
      'The two lenses in the article are held apart with a gap between them, as in any instrument with a tube. These two are always touching and the picture says nothing about a separation.',
      'The subject is an object and the image made of it — its size, its way up, or whether it could be caught. There is no object here at all; the light arrives already parallel and is followed no further than where it gathers.',
      'The article is about how much bigger something looks. No magnification is named, and nothing in the picture stands for a thing being viewed.',
      'The point turns on the shapes of the glass surfaces, their curvature or their thickness. The lenses here are told apart only by being thick or thin in the middle.',
      'The article is about light failing to gather at one place — by height across the lens or by colour. Every beam here closes at a single clean point.',
      'The subject is how spectacles correct a particular eye. Nothing here stands for an eye, and the lenses are laid against each other rather than in front of anything.',
    ],

    contrastWith: [
      {
        concept: 'telescope',
        note: 'Both pair a converging lens with a second piece of glass; one holds them in contact so that their strengths simply add, the other holds them apart at the sum of their focal lengths so that what is gained is an angle.',
      },
      {
        concept: 'microscope',
        note: 'One asks only where parallel light ends up when two lenses are made into one, the other keeps them separate so that each forms its own image and the enlargements multiply.',
      },
      {
        concept: 'magnifying-glass',
        note: 'One measures a single lens by the strength it adds to another, the other measures a single lens by the angle it opens up at the eye.',
      },
      {
        concept: 'chromatic-aberration',
        note: 'One shows that a diverging lens laid against a converging one takes strength away in a definite amount; the other shows the defect that such a pairing is chosen to undo, without correcting it.',
      },
      {
        concept: 'converging-diverging-lens',
        note: 'One asks where the gathering place of a single shape stands — behind the lens, or in front of it for the other shape; the other keeps a converging lens in hand and asks only how far that place shifts when a second is laid against it, so a diverging lens figures as something that subtracts rather than something that spreads.',
      },
    ],
  },
};
