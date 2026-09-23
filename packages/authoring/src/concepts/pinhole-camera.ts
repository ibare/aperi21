/**
 * pinhole-camera 개념 선언.
 *
 * 빛의 직진 셋 가운데 하나. **주장이 갈린 자리** —
 *   rectilinear-propagation  막힌 빛 → 그림자의 끝이 어디인가
 *   shadow-umbra-penumbra    크기 있는 광원 → 그림자가 몇 겹인가
 *   pinhole-camera           통과한 빛 → **상**. 구멍을 키우면 밝아지는 대신 번진다 — **맞바꿈**이 주장이다
 * 이쪽만 상 · 거꾸로 섬 · 밝기 ↔ 또렷함 · 구멍 크기 어휘를 갖는다. 그림자의 크기 · 가장자리는 쓰지 않는다.
 *
 * 렌즈 조각(`ray-tracing` · `magnification` 등)은 아직 선언되지 않아 contrastWith 로 잇지 못한다.
 * 상 쪽 이웃은 이 묶음의 `concave-mirror` 로 이었다 — 둘 다 빛이 실제로 모이는 상이다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pinholeCameraConcept: Aperi21ConceptSource = {
  id: 'pinhole-camera',
  label: 'Brightness Traded Against Sharpness in a Pinhole Image',
  canonicalSim: 'aperi21:pinhole-camera',

  surface: {
    definition:
      'The upside-down picture a single hole throws onto the wall behind it, and the bargain in the hole’s width: widening it lets more light in while spreading every point of the picture into a patch.',
    exemplarKeywords: [
      'pinhole camera',
      'camera obscura',
      'an image made without a lens',
      'why the picture through a small hole is upside down',
      'a hole poked in a shoebox',
      'a bigger opening is brighter but blurrier',
      'sharpness against brightness',
      'how small should the hole be',
      'watching an eclipse projected through a hole',
      'the image on the back of the box',
      'each point of the subject spreads into a circle',
    ],
  },

  briefing: {
    observable: [
      'On the left, in a dark room, a candle faces a box whose near wall carries one hole; the far wall of the box is where the light ends up.',
      'Strands leave two points of the candle — the middle of its flame and the foot of its body — and fan toward the near wall. Only those aimed within the hole cross it and reach the far wall; the rest stop at the wall they meet.',
      'The strands that do get through cross over at the hole, so the flame’s light arrives low on the far wall and the foot’s light arrives high.',
      'Two bright lines graze the top and bottom edge of the hole, and between where they land lies the stretch of wall that one point of the candle has been spread across. A bracket outside the room spans that stretch.',
      'On the right a panel shows the far wall face on: the whole candle stands there upside down, flame at the bottom.',
      'A narrow upright gauge at the far right fills with light as the hole widens, showing how much is getting in.',
      'With the smallest hole one strand from each point squeezes through, the landing places are near enough to points, the bracket is short, and the panel holds a dim but crisply outlined candle.',
      'As the hole widens more strands cross, the landing stretches lengthen, the bracket opens, the gauge climbs, and the candle in the panel brightens while its outline softens.',
      'At the widest hole five strands from each point get through, the picture is at its brightest and the edges of flame and body have run together.',
      'The hole narrows again and the picture darkens and firms up, and the round begins over.',
    ],

    screen: {
      affordances: [
        'The hole widens in two steps, holds at each, and narrows back, over and over, with nothing to press.',
        'The candle, the hole and the far wall all keep their places — across a whole round the one thing that changes is how wide the hole is.',
        'The strands, the landing stretch, the bracket, the picture in the panel and the gauge are all set by that one width, so the panel cannot go brighter without the bracket going wider.',
        'The side view and the face-on panel are ruled to the same heights, so the flame’s landing place in one lines up with the flame in the other.',
        'Nothing on screen carries a figure; the candle, the hole and the wall are named and everything else is shown by length, brightness and blur.',
        'The screen opens with the smallest hole and its picture already formed.',
      ],
    },

    useWhen: [
      'The article has stated that a pinhole makes an image and that a smaller hole is sharper, and the reader would take the two as unrelated rules. Here they are one thing: the strands that make the picture brighter are the same strands that scatter each point of it across a stretch of wall.',
      'The point is that the picture comes out upside down, and the reader would accept it as a fact to be memorised. Watching the strands from the flame and from the foot cross at the hole is what turns it into an obvious consequence.',
    ],

    avoidWhen: [
      'The article involves a lens, a focal length, or focusing. There is nothing in the hole and nothing bends here — every strand runs dead straight from the candle to the wall.',
      'The subject is the shadow an object casts, or how big that shadow is. Light here goes through rather than being stopped, and what lands is a picture of the candle.',
      'The claim turns on the hole being made so small that the picture blurs again for a reason straight lines cannot give. Only the geometry of straight strands is shown, and in it a narrower hole is always sharper.',
      'The article turns on left and right being swapped as well as top and bottom. The candle is the same on both sides, so only the turning over shows.',
      'Numbers are wanted — how wide the hole is, how far the wall stands, how much the picture is enlarged. Nothing of the sort is written.',
    ],

    contrastWith: [
      {
        concept: 'rectilinear-propagation',
        note: 'Both live on strictly straight light, but one follows the light that is stopped and asks the size of what is missing, while the other follows the light that gets through and asks what it builds.',
      },
      {
        concept: 'shadow-umbra-penumbra',
        note: 'One has an object of some size seen through an opening, so the opening blurs the picture; the other has a source of some size blocked by an object, so the source blurs the edge.',
      },
      {
        concept: 'concave-mirror',
        note: 'Both end with a real inverted picture where light genuinely crosses; one gets there by throwing away all but a narrow pencil of light, the other by bending a wide cone of it back onto itself.',
      },
    ],
  },
};
