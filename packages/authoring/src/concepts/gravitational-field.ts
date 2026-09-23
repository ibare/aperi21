/**
 * gravitational-field 개념 선언.
 *
 * 위험한 형제는 `newtons-law-of-gravitation` 이다 — 둘 다 역제곱을 말한다. **주어를 갈랐다.**
 *   gravitational-field         한 원천이 **자리마다 미리 깔아 둔 값** — 놓인 질량이 그 화살표를 따른다
 *   newtons-law-of-gravitation  **두 물체 사이**의 한 쌍 — 거리를 벌리면 함께 제곱으로 준다
 * 이쪽은 「자리 · 놓기 전부터 · 어디에 놓든」 어휘만 갖고, 역제곱 검색어와 「한 쌍 · 되당김」 은
 * 저쪽에 둔다. 화면에도 시험 질량이 원천을 되당기는 화살표가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gravitationalFieldConcept: Aperi21ConceptSource = {
  id: 'gravitational-field',
  label: 'Gravity as a Value Already Present at Every Place',
  canonicalSim: 'aperi21:gravitational-field',

  surface: {
    definition:
      'The arrow a single mass assigns to every place around it, long near the body and short far out, which any small body set down at a place then travels along.',
    exemplarKeywords: [
      'gravitational field',
      'field strength at a point',
      'what is gravity at a place where nothing is yet',
      'test mass dropped into a field',
      'field arrows around a planet',
      'gravity as a property of space rather than of a pair',
      'how strong is gravity here',
      'action at a distance versus a field',
      'mapping out the gravity around a body',
      'the field is there before anything comes',
    ],
  },

  briefing: {
    observable: [
      'A planet stands in the middle of a grid, and at each of thirty-six places around it an arrow is already drawn pointing back at the planet.',
      'The arrows near the planet are long and those out toward the corners are short, so the sheet of arrows thins as it goes out.',
      'Three small dark bodies then appear at three of those grid places — one far, one middling, one close — each holding still.',
      'Each of them wears an arrow in the accent colour that lies exactly on top of the arrow that was already at that place, matching it in direction and in length.',
      'Released from rest, all three travel straight along the arrow that was at their place, and each one keeps an accent arrow that lengthens as it nears the planet.',
      'The near one reaches the surface first and the far one last, without anything announcing the order.',
      'The places the three set out from still hold their original arrows after the bodies have gone, and a dotted trail runs from each of those places to the planet along the direction the arrow had.',
      'Nothing pulls back on the planet — no arrow is ever drawn on it.',
      'The whole sequence runs and repeats by itself.',
    ],

    screen: {
      affordances: [
        'The laying out of the arrows, the placing of the three bodies and their travel happen in order and then begin again; nothing has to be pressed.',
        'The arrows a body receives and the arrows already lying on the grid come from the same rule, so the overlap is an identity rather than a drawing convention.',
        'The accent colour is kept for one meaning only — the arrow the body at that place is receiving right now — so which arrows belong to the place and which to the body needs no legend.',
        'The bodies are set down on grid places rather than between them, which is what lets the received arrow and the waiting arrow coincide.',
        'Nothing is numbered and no units appear; near and far are told by arrow length alone.',
        'The grid is left empty close around the planet, so nothing is claimed about the inside of the body.',
      ],
    },

    useWhen: [
      'The article is making the step from a force that needs two bodies to a field that one body sets up alone, and the reader is still hearing "field" as a word for the same thing. Arrows lying at empty places, then a body arriving and taking the one that was waiting, is what separates the two.',
      'The prose has said that field strength falls off with distance and needs a picture where that is a property of the place rather than of a particular pairing.',
    ],

    avoidWhen: [
      'The article is about two bodies attracting each other, or about the pull being equally felt by both. The planet here receives nothing; only the small bodies are drawn with arrows.',
      'The point is the arithmetic of the falloff — a quarter at twice the distance, a ninth at three times. There are no distance marks, no ghost lengths to compare against, and nothing to measure a ratio with.',
      'Two or more sources are involved and the question is how their fields add. Exactly one planet lays the arrows here.',
      'The subject is inside a body — the field in a cavity or at depth. The grid stops short of the planet and says nothing about its interior.',
      'The article uses field lines, tubes of flux or line density as its picture. What is drawn is a grid of separate arrows, each answering for its own place.',
      'A value of field strength is wanted in newtons per kilogram, or a comparison of two planets. Nothing is labelled with a quantity.',
    ],

    contrastWith: [
      {
        concept: 'newtons-law-of-gravitation',
        note: 'One belongs to a place and exists whether or not anything is there to feel it; the other exists only when two bodies are named and is shared equally between them.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One is the value gravity has at each place, read where the body has not yet moved; the other is what that value does to a velocity once the body is under way.',
      },
      {
        concept: 'gravity-inside-earth',
        note: 'One maps the values outside a body, where the whole mass lies on the far side of the traveller; the other follows the value inward, where part of the mass has been left behind.',
      },
      {
        concept: 'free-fall',
        note: 'One says that the place decides what arrow a body gets; the other says that the body brings nothing of its own to it, so that two unequal bodies at the same place fall alike.',
      },
    ],
  },
};
