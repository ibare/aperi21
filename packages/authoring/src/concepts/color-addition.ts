/**
 * color-addition 개념 선언.
 *
 * 색 셋 가운데 **물체가 없는** 하나다. 주어가 빛 자체이고, 색은 겹친 자리에서
 * **더해져** 생긴다.
 *   color-addition           빛 + 빛 = 색 (빨강 + 초록 = 노랑, 셋 = 흰색)
 *   object-color             비추는 빛 중 겉면이 되쏜 몫이 색
 *   light-through-materials  색이 아니라 통과 방식(또렷 · 흐림 · 막힘)
 * 그래서 이쪽만 원색 · 이차색 · 더하기 어휘를 갖고, 물감 · 인쇄(빼기 쪽)는
 * avoidWhen 으로 되돌린다.
 *
 * 이 묶음에서 유일하게 독자가 손으로 옮길 수 있는 조각이다 — 자동 진행에 없는
 * 조합(빨강 + 파랑 = 자홍)이 손에 남겨져 있어 affordances 가 그것을 말한다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const colorAdditionConcept: Aperi21ConceptSource = {
  id: 'color-addition',
  label: 'The Colour Where Coloured Lights Overlap',
  canonicalSim: 'aperi21:color-addition',

  surface: {
    definition:
      'What colour appears where beams of red, green and blue light fall on the same dark screen: two together give yellow, cyan or magenta, and all three together give white.',
    exemplarKeywords: [
      'additive colour mixing',
      'red green and blue light',
      'why do red and green light together look yellow',
      'three stage spotlights overlapping on a white wall',
      'primary colours of light',
      'cyan magenta and yellow from two lights',
      'all three lights together make white',
      'mixing light is not the same as mixing paint',
      'RGB',
      'what a screen does to make a colour',
    ],
  },

  briefing: {
    observable: [
      'A black screen fills the left of the picture, and on it lie three discs of light — one pure red, one pure green, one pure blue — each with a hard edge.',
      'Where two discs lie over one another the colour is the sum of the two, and where all three lie together the patch is white; the sums appear because the lights are laid on one another rather than being painted in.',
      'A small ring sits near the middle of the screen and marks one place to read.',
      'To the right stand four squares in a row: three small ones named red, green and blue, joined by a plus and then an equals to a larger one named as the ring’s place.',
      'Each small square is lit in its own colour when that disc covers the ring and is black when it does not; the large square carries the sum of whichever are lit.',
      'Over one round the discs slide in and out of the ring one at a time, so the reading passes through red alone, red with green, all three, green with blue, blue alone and none at all, and the running text names each colour as it arrives.',
      'Because the disc edges are hard, the squares and the naming change in one step at the instant an edge crosses the ring rather than fading across.',
      'Black on this screen is what lies outside every disc — the sum of nothing.',
    ],

    screen: {
      affordances: [
        'Each of the three discs can be taken hold of and moved anywhere on the screen, and the ring can be moved too; once moved by hand they stay where they are put and the round no longer carries them.',
        'The combination of red and blue is left out of the round that plays by itself, so magenta is there for the reader to make by hand.',
        'The colour where discs overlap is worked out by laying the lights on top of one another, so any shape of overlap the reader makes is coloured the same way as the ones in the round.',
        'The screen opens with a disc already sliding in, so the first thing seen is a colour changing.',
        'The reading squares follow whatever the reader has done, so moving the ring into a new patch renames the colour at once.',
        'The screen is laid down as lightless, so white where the three meet is the brightest thing in the picture whichever theme the page is in.',
        'What is written is the three colour names, the plus and equals signs, and the name of the ring’s place; brightness is carried by colour alone.',
      ],
    },

    useWhen: [
      'The article has listed the primaries of light and the article’s reader wants to see the pairs come out — that red and green give yellow, not something muddier. The overlaps and the reading squares give the answer for each pair in turn.',
      'The point being made is that light adds where paint takes away, and the article needs the adding shown before the comparison can be drawn.',
      'The reader is to be given a combination to try. The round leaves red with blue unvisited, so the article can send the reader to make magenta and check the naming.',
    ],

    avoidWhen: [
      'The subject is mixing paints, inks or dyes, where each added colour takes more away. Everything here grows brighter as more is added and the three together are the brightest of all.',
      'The question is what colour an object looks under a given light, or what a surface returns. There is no object on the screen — only light on a black background.',
      'The article is about wavelength, spectra or splitting white light into colours. There are three lights here and no wavelengths at all; white is built up rather than taken apart.',
      'The point turns on how the eye takes in colour — cones, sensitivity, why three primaries in the first place. Nothing of the eye is in the picture.',
      'The article needs brightness in numbers, or colours in between the six the round visits, or a colour with one light dimmer than another. The three lights are at full strength and either cover a place or do not.',
    ],

    contrastWith: [
      {
        concept: 'object-color',
        note: 'One has several lights land in one place and their colours add; the other has one light land on a surface that keeps part of it and sends the rest on.',
      },
      {
        concept: 'seeing-requires-light',
        note: 'Both end in a colour being seen; one asks what that colour is when lights meet, the other asks whether any light reaches the eye at all.',
      },
      {
        concept: 'rayleigh-scattering',
        note: 'One builds a colour by putting lights together, the other arrives at one by having part of a light taken away along the path.',
      },
    ],
  },
};
