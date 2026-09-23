/**
 * magnet-attraction 개념 선언.
 *
 * 자석 넷을 **무엇과 무엇 사이인가**로 갈랐다.
 *   magnet-attraction   자석 ↔ **물건** — 붙는 것과 그대로인 것 둘로 갈린다(금속이라고 다 붙지 않는다)
 *   magnetic-poles      자석 ↔ **자석** — 마주 보는 극이 당김과 밀림을 뒤바꾼다
 *   magnetic-materials  자석 ↔ **물질의 정도** — 세게 · 살짝 · 밀어냄, 그리고 속의 기작
 *   magnetic-dipole     고리 ↔ 자석 — 먼 곳 장 모양이 같다
 * 이쪽만 「붙는다 / 그대로다」 라는 두 갈래와 일상 물건 이름을 갖는다. 정도 · 속의 작은
 * 자석 어휘는 쓰지 않고 avoidWhen 으로 `magnetic-materials` 에 넘긴다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magnetAttractionConcept: Aperi21ConceptSource = {
  id: 'magnet-attraction',
  label: 'What a Magnet Will Pick Up',
  canonicalSim: 'aperi21:magnet-attraction',

  surface: {
    definition:
      'That a magnet passed over a row of everyday things lifts the nail and the paperclip onto itself and leaves the wood, the copper wire, the plastic lid and the aluminium exactly where they lay.',
    exemplarKeywords: [
      'what sticks to a magnet',
      'sorting objects by whether a magnet picks them up',
      'a magnet will not pick up every metal',
      'nails and paperclips jump to a magnet',
      'testing wood plastic and metal with a magnet',
      'copper wire is a metal but the magnet goes straight over it',
      'magnetic and non-magnetic objects',
      'a magnet swept along a row of things on a table',
      'which things are attracted to a magnet',
      'classroom magnet investigation',
    ],
  },

  briefing: {
    observable: [
      'Six things lie in a row on a table — a piece of wood, an iron nail, a coil of copper wire, a plastic lid, a paperclip and a piece of aluminium — with their names written along the front of the table.',
      'A bar magnet lettered S and N waits at the upper left.',
      'The magnet travels straight from left to right, passing over every one of them at the same height.',
      'Over the wood nothing happens; as the magnet nears the nail, the nail leaves the table, rises under the leading end, and hangs there, carried along with it.',
      'With the nail hanging beneath it, the magnet passes over the copper and the plastic and neither of them stirs.',
      'The paperclip is drawn up to the leading face, and the magnet comes to a halt over the aluminium, which does not move.',
      'At the end, the nail and the paperclip hang from the magnet while the other four sit where they started, so two of the written names have nothing above them any more.',
      'Every object is drawn in the same ink, some of them filled and some outlined, and both the ones that go and the ones that stay are found among the filled and among the outlined.',
      'No number, no arrow, no tick and no cross appears anywhere.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the row is laid out, the magnet sweeps across, the result is held, and it starts again.',
        'What parts the two kinds is movement and nothing else — no colour, no mark and no label says in advance which will go.',
        'The magnet keeps one height over the whole row, so nothing can be put down to one thing having been nearer than another.',
        'Three of the six are metal and two of those three stay, so “metal” cannot be read off as the answer.',
        'The first thing passed over is one that stays, so “nothing happens” is seen before anything jumps.',
        'The names stay written on the table while the objects leave it, so the gaps above two of the names say what went.',
        'The two ends of the magnet are told apart by their letters alone, with no red and blue.',
      ],
    },

    useWhen: [
      'The article has told a young reader that magnets attract metals, and the point now being made is that this is too generous. Watching the magnet go straight over copper and aluminium while the nail leaps up is what contradicts it.',
      'The prose wants an ordinary sorting activity beside it, made of things a reader could lay out on their own table and try in the same order.',
    ],

    avoidWhen: [
      'The article is about degrees of the effect — a material drawn in only weakly, or one pushed away — or about what inside a material accounts for the difference. Here each thing either goes or stays.',
      'The subject is two magnets acting on each other, or ends that push and pull.',
      'The article is about the shape of the field around a magnet, or about what lies in the space between the magnet and the object.',
      'How strong the pull is, how it grows as the magnet nears, or the distance at which it takes hold is at issue. One height is kept throughout and no force is drawn.',
      'The point is making something into a magnet, or a magnet losing its strength.',
      'The reader is meant to bring objects of their own and try them. The row is fixed and the sweep goes by on its own.',
    ],

    contrastWith: [
      {
        concept: 'magnetic-materials',
        note: 'One sorts everyday things into those that go and those that stay; the other keeps the answer “yes” for several materials, grades it, and asks what inside each one accounts for the grade.',
      },
      {
        concept: 'magnetic-poles',
        note: 'One sets a magnet against ordinary things, which have no ends of their own; the other sets two magnets together, where which end faces which decides everything.',
      },
      {
        concept: 'magnetic-field',
        note: 'One is about what a magnet does to particular objects; the other is about the pattern a magnet lays on the space around it, with no object picked up at all.',
      },
    ],
  },
};
