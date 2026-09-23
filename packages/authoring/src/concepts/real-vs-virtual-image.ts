/**
 * real-vs-virtual-image 개념 선언.
 *
 * 상을 만드는 이 묶음의 여럿 가운데 **스크린을 판정 도구로 쓰는** 하나다. 무엇을 주장하는지로 갈랐다.
 *   real-vs-virtual-image  판에 맺히느냐 — 실제로 모인 빛 ↔ 연장선만 만난 자리
 *   magnifying-glass       눈에 드는 각 — 맨눈 25 cm 와 견준다
 *   microscope             두 번 키운 몫이 곱해진다
 *   telescope              먼 것이 벌어져 보이는 각이 초점 거리 비만큼 커진다
 * 이쪽만 스크린 · 번진 띠 · 「맺히지 않는다」 어휘를 갖는다. 배율의 수 · 눈 · 각은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const realVsVirtualImageConcept: Aperi21ConceptSource = {
  id: 'real-vs-virtual-image',
  label: 'The Screen Test for an Image',
  canonicalSim: 'aperi21:real-vs-virtual-image',

  surface: {
    definition:
      'The test a screen makes of an image: where light has really gathered a picture prints on the panel, and where only backward continuations meet the panel stays blank.',
    exemplarKeywords: [
      'real image and virtual image',
      'can you catch an image on a screen',
      'what is the difference between a real and a virtual image',
      'why a projector needs a screen but a magnifier does not',
      'an image that cannot be projected',
      'rays that actually converge against rays that only seem to',
      'an object inside the focal point of a converging lens',
      'dashed lines traced backwards to locate the image',
      'the screen shows only a blur',
      'upright and enlarged against inverted and caught on a card',
      'is the image really there',
    ],
  },

  briefing: {
    observable: [
      'An axis runs across the picture with an object arrow standing on it, a convex lens further along, and beyond that a dark panel that serves as the screen; a point marked F stands on the axis either side of the lens.',
      'From the tip of the arrow five beams reach the lens, pass through it, and close on a single point on the panel, where a bright inverted arrow lights up and is named as the real image.',
      'The beams then drain away into the panel and the bright arrow fades; the object slides along the axis, with no beams drawn, until it stands inside the near F.',
      'The same five beams go out again, and past the lens they open apart instead of closing, arriving at the panel at many different heights.',
      'Nothing sharp forms there. A faint band of light smears across the panel from the lowest beam to the highest, and no arrow appears anywhere on it.',
      'Dashed lines then grow backward from the lens toward the object’s side and draw together at one point, where an upright dashed arrow stands, taller than the object and named as the virtual image.',
      'No solid beam ever reaches that point — on that side of the lens there are only the dashed continuations.',
      'It is the same panel in the same place in both halves of the round, so the bright arrow and the faint band are two outcomes at one spot.',
      'The object then slides back out and the whole round begins again.',
    ],

    screen: {
      affordances: [
        'The object rests at two places on the axis and slides between them, over and over, with nothing to press.',
        'Where the image stands is worked out from the lens first and the beams are then drawn to that result, so the beams meeting on the panel is a consequence rather than a drawing choice.',
        'The panel stands where the first image forms and never moves afterwards, so the second half’s blank panel is a reading at the same place rather than a different setting.',
        'Solid lines are used for light that travels and dashed lines for the continuations drawn backward, which is how the two kinds of meeting are told apart.',
        'The image that light reaches is drawn as brightness on the dark panel, and the one it does not reach as an outlined arrow, so brightness against outline carries the distinction rather than colour.',
        'While the object is travelling the beams are cleared away, since between the two resting places there is no settled answer to draw.',
        'No figures are written anywhere; the only words on screen name the panel, the two images and the mark F.',
        'The screen opens with the beams already gathered and the bright image standing on the panel.',
      ],
    },

    useWhen: [
      'The article has defined the two kinds of image by whether the light really meets or only seems to, and the reader has no way to check which they are looking at. Putting a panel at the place and seeing it print or stay blank is that check, carried out twice in one round.',
      'The point being made is that some images can be thrown onto a wall and others can only be looked at, and the article wants the reason rather than the rule. Both cases here use the same lens and the same panel, minutes apart.',
      'The reader has been taught to extend rays backward with dashed lines and takes it as a drawing convention. Here the solid beams stop at the panel and the dashed ones run to a place nothing solid reaches, which is what the convention was standing in for.',
    ],

    avoidWhen: [
      'The article wants object and image distances, the lens formula, or a magnification worked out. Nothing numeric is written on screen at all.',
      'The surface in the article is a mirror. Every beam here goes through a lens and carries on to the far side.',
      'The subject is how large something looks to the eye, or the benefit of holding a lens up to look through. There is no eye anywhere in this picture, and no comparison of apparent size.',
      'The point is that the image moves smoothly as the object is brought in, or what happens with the object exactly at the focus. The object rests at two places only and the beams are cleared while it travels.',
      'The article is about light changing direction at a surface, or about what the shape of the glass does. The lens acts in one step and its shape is never in question.',
      'The subject is a blur caused by a lens that cannot gather light to one place. The faint band here comes from an image that has formed somewhere else entirely, not from an imperfect gathering.',
    ],

    contrastWith: [
      {
        concept: 'magnifying-glass',
        note: 'Both end with an upright enlarged image on the object’s side that light never reaches; one asks only whether a screen would catch it, the other asks what that image buys the eye looking through.',
      },
      {
        concept: 'concave-mirror',
        note: 'One keeps the surface fixed and asks which kind of image is standing there; the other keeps the kind of question and asks where along the axis the answer changes over.',
      },
      {
        concept: 'pinhole-camera',
        note: 'Both put a picture on a panel behind an opening, but one is testing whether a picture lands there at all, and the other takes the landing for granted and trades its sharpness against its brightness.',
      },
      {
        concept: 'plane-mirror-image',
        note: 'One shows that an image behind the glass would leave a screen blank; the other measures where behind the glass that untouchable image stands.',
      },
    ],
  },
};
