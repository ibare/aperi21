/**
 * object-color 개념 선언.
 *
 * 색 셋 가운데 **겉면이 고르는** 하나다. 주어가 물체이고, 색은 비추는 빛 가운데
 * 되쏜 몫이다 — 그래서 되쏠 것이 없으면 검게 보인다.
 *   color-addition           빛끼리 더해진다 — 물체가 없다
 *   object-color             겉면이 되쏠 것을 고른다 — 셋 들어가 하나 나온다
 *   light-through-materials  재료를 **지나간** 빛 — 색이 아니라 또렷 · 흐림 · 막힘
 *
 * `seeing-requires-light` 와는 등이 **켜져 있느냐**로 갈랐다 — 저쪽은 빛이 아예
 * 없어 보이지 않고, 이쪽은 빛이 있는데도 되쏠 것이 없어 **검게 보인다.** 이쪽 화면에는
 * 눈이 없고 등이 꺼지는 일도 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const objectColorConcept: Aperi21ConceptSource = {
  id: 'object-color',
  label: 'The Colour a Surface Sends Back',
  canonicalSim: 'aperi21:object-color',

  surface: {
    definition:
      'A surface shows the colour it returns out of the light falling on it: a red apple sends back only red, so under blue light alone it returns nothing and looks black.',
    exemplarKeywords: [
      'why is an apple red',
      'what colour a surface reflects',
      'a red object under blue light looks black',
      'the colour of an object depends on the light shining on it',
      'absorbed and reflected colours',
      'a green leaf looks black in red light',
      'stage lighting changes the colour of a costume',
      'clothes look different under shop lighting',
      'selective reflection by a surface',
      'white light contains the colours a surface can send back',
    ],
  },

  briefing: {
    observable: [
      'A lightless room holds a table, a lamp and an apple with a leaf, and the lamp is lit throughout.',
      'Under white light three beams run from the lamp into the apple — one blue, one green, one red — and one beam comes away from it, red, leaving up and to the right across the leaf.',
      'The blue and green beams stop at the apple’s face: three arrive and one returns, which is the whole count on screen.',
      'With white light the apple looks red and the leaf green, and chevrons drift along each beam marking which way it runs.',
      'The lamp is then switched to red light. The blue and green beams fade out, the lamp itself reddens, and the leaf darkens as it happens.',
      'Under red light one beam arrives and one leaves: the apple looks exactly as red as before, while the leaf has gone black and is held in place by a grey outline.',
      'The lamp is switched again, to blue. One blue beam arrives at the apple and stops there; nothing comes away, and both the apple and the leaf are black with only their grey outlines standing.',
      'The lamp returns to white and the round begins again with the apple red and the leaf green.',
      'The face of the apple, the leaf, the lamp and the beams all come out of one calculation of what each surface returns from what it is given, so the colour of the face and the colour of the beam leaving it always agree.',
      'The exposure is set once under white light and not reset, so the apple under blue light stays dark rather than being brought back up.',
    ],

    screen: {
      affordances: [
        'The lamp runs through white, red and blue light by itself, over and over, with nothing to press.',
        'White light is drawn as three beams rather than one, which is what lets "only red comes back" be counted off the picture rather than taken on the word of a colour name.',
        'The beams that are not returned simply end at the surface, with no further mark for what became of them.',
        'One direction is used for the returned beam instead of the many a real surface would send, so that "one comes back" is not lost in a fan of lines.',
        'The leaf is coloured by the same rule as the apple but given no beams of its own, so it carries a second surface without crowding the first.',
        'The room is laid down as lightless so that "looks black" reads the same way whether the page is light or dark.',
        'Grey outlines are kept on the apple and the leaf at all times, which is what separates "looks black" from "is no longer there".',
        'The lamp, the apple and the leaf are left unlabelled and told apart by their shapes, with the running text naming them; no wavelengths or percentages are written anywhere.',
      ],
    },

    useWhen: [
      'The article has said that an object’s colour is the light it reflects, and the reader has taken it as a form of words. The count — three beams in, one out — turns it into something on the screen.',
      'The point being made is the test case: the same object under different lights. A red apple staying red under red light and going black under blue is the pair of results the argument needs.',
      'The article wants absorption and reflection in the same picture, with the reader able to see which parts of the arriving light were kept and which were sent on.',
    ],

    avoidWhen: [
      'The subject is whether anything can be seen at all, or a room with no light in it. The lamp here is lit in every part of the round, and the apple going black happens under light.',
      'The article is about lights being added together — several beams meeting on a screen and their colours combining. Only one lamp shines here and it shines on an object.',
      'The point turns on mixing pigments or dyes, or on what happens when paints are stirred together. Nothing is mixed; one surface is put under one light after another.',
      'The subject is light passing through something — a filter, glass, a coloured sheet — and what comes out the far side. Every beam here either comes back off the face or stops at it.',
      'The article needs reflectance curves, wavelengths or a share in per cent. What is on screen is the number of beams and the colour of the surfaces.',
      'The point is why the sky or a sunset has its colour. There is no sky in the picture and the light never changes on the way.',
    ],

    contrastWith: [
      {
        concept: 'color-addition',
        note: 'One has lights land together and their colours add up; the other has a single light land on a surface that returns only part of it.',
      },
      {
        concept: 'seeing-requires-light',
        note: 'Both end with an object that cannot be made out, for opposite reasons: one because no light is reaching it at all, the other because the light reaching it holds nothing the surface can send back.',
      },
      {
        concept: 'light-through-materials',
        note: 'Both put light against a material and watch what survives; one follows what comes back toward the viewer and calls it colour, the other follows what carries on through.',
      },
      {
        concept: 'albedo',
        note: 'One asks how large a share of the arriving light is turned back, colour aside; the other asks which part of it is turned back, and reads the answer as a colour.',
      },
      {
        concept: 'rayleigh-scattering',
        note: 'Both leave the eye with only part of the original light, but one has a surface make the choice at a single place, and the other has the air make it all along the path.',
      },
    ],
  },
};
