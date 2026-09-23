/**
 * scale-of-universe 개념 선언.
 *
 * 우주 규모 둘의 갈림 — **무엇을 주장하는가**. 이미 선언된 `expanding-universe` 는 공간
 * 자체가 늘어나 모두가 멀어진다를 주장한다(시간이 흐르고 자리가 바뀐다). 이쪽에서
 * 움직이는 것은 **배율 하나뿐**이다 — 아무것도 늘어나지 않고, 한 칸 물러날 때마다 틀 속이
 * 10분의 1로 줄어드는 것이 전부다.
 *
 * 이미 선언된 `magnitude-scale` 과도 갈랐다 — 그쪽은 **밝기**의 곱셈 눈금이고 이쪽은
 * **크기**의 곱셈 눈금이다. 밝기 · 나눔 · 몫이라는 말을 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const scaleOfUniverseConcept: Aperi21ConceptSource = {
  id: 'scale-of-universe',
  label: 'From the Atom to the Observable Universe, One Power of Ten at a Time',
  canonicalSim: 'aperi21:scale-of-universe',

  surface: {
    definition:
      'Sizes from the atom to the observable universe joined by powers of ten, each step back shrinking everything in view to a tenth until what filled it is a dot.',
    exemplarKeywords: [
      'powers of ten',
      'orders of magnitude',
      'how big is an atom next to a cell',
      'the scale of the universe',
      'from the atom to the observable universe',
      'ten to the minus ten metres',
      'stepping back by factors of ten',
      'scientific notation for very large and very small sizes',
      'how many steps from a person to a galaxy',
      'why big numbers are impossible to picture',
      'the Powers of Ten film',
    ],
  },

  briefing: {
    observable: [
      'A square frame sits on the left and never moves or changes size; everything drawn inside it belongs to whatever the frame is currently a certain number of metres across.',
      'A ladder stands on the right, divided into thirty-six even rungs, with seven of them named — atom, cell, person, Earth, solar system, Milky Way, observable universe — and a bar in the strike colour climbs it one rung at a time.',
      'Inside the frame are faint nested squares at a tenth and a hundredth of its side; every time the bar climbs a rung, each square shrinks inward to the next one and a fresh square appears at the frame’s edge, so one rung is visibly a factor of ten.',
      'It starts with a single atom filling the frame — a scattering of dots for the electrons, a shell, a nucleus — and a dimension line under the frame gives the frame’s side in metres as a power of ten.',
      'Stepping back, the atom shrinks until its shape can no longer be told and it stays on as a dot with its name beside it, and two or three rungs later the dot is gone too.',
      'The next subject is too big to draw until the frame has grown enough to hold it, and then its outline comes in from beyond the frame, shrinking as it arrives, and fills it.',
      'That sequence runs through a cell, a person’s outline, the disc of the Earth, the solar system drawn as five orbits round a point, the Milky Way with two spiral arms, and a spread of galaxy dots inside a circle for the observable universe.',
      'The rungs between the named ones are not evenly shared out — before the galaxy there is a long run of steps in which the frame holds nothing at all but the nested squares.',
      'While a subject is holding the frame, the dimension line names the frame’s side and that subject’s rung on the ladder darkens; while stepping back, neither is stated.',
      'Everything is drawn in the same ink; no subject gets a colour of its own, because this is a ladder of sizes and not a key of kinds.',
      'The run is never reversed. After the observable universe the picture fades and begins again at the atom.',
      'No size is worked out or added up on screen — the sizes appear only as the powers of ten written on the ladder and the dimension line.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The stepping back runs by itself from the atom to the observable universe and then starts over.',
        'It opens part way into the first step, with the atom already beginning to shrink, so the first thing seen is the shrinking rather than a still picture.',
        'Nothing is ever moved closer to or further from the viewer. The frame and the ladder hold their places and only the size of what is drawn changes, which is what keeps the frame usable as a ruler.',
        'Each step back takes the same length of time as every other, so a long empty run genuinely reads as further rather than as slower.',
        'Every subject is drawn centred in the frame. What the picture compares is size, not where things sit, and consecutive subjects differ by so much that they never appear together anyway.',
        'A subject is not drawn at all until it is small enough to fit inside the frame with room to spare, so that a huge one never arrives as a wash of colour filling the whole square.',
        'The nucleus and the Sun are drawn larger than their true share of the subject around them, since at their true share neither would be visible at all.',
        'The strike colour is used for one thing only, the bar marking where on the ladder the frame currently stands.',
      ],
    },

    useWhen: [
      'The article has quoted two sizes in powers of ten and the reader cannot feel the distance between them. Watching one shrink to a dot and disappear several steps before the other arrives is that distance.',
      'The point is that repeated multiplication outruns intuition — the long run of empty steps between the solar system and the galaxy is the claim made visible.',
      'The article is introducing scientific notation or orders of magnitude as a way of writing sizes, and the exponent needs to mean something before it is used.',
      'The reader wants to know where some familiar thing — a cell, a person, the Earth — sits between the smallest and largest things named in the article.',
    ],

    avoidWhen: [
      'The subject is the universe growing, galaxies moving apart, or the age of the universe. Nothing here moves and no time passes; only the scale of the drawing changes.',
      'The article is about what things are made of or how they are built — the parts of an atom, the inside of a cell, the structure of a galaxy. Each subject here is a sign for its size.',
      'The point is looking at something through an instrument, or how much an instrument enlarges what it is aimed at.',
      'The article needs distance rather than size — how far away something is, how long light takes to arrive, or how those distances are measured.',
      'The subject lies beyond the two ends drawn, such as what is inside a nucleus or what lies past the edge of what can be observed.',
      'A figure is wanted for some particular thing’s size beyond the round powers written on the ladder.',
    ],

    contrastWith: [
      {
        concept: 'expanding-universe',
        note: 'Both change how much of the universe is being looked at, but one has space itself stretching so that things genuinely move apart, while the other has nothing move and only the scale of the picture change.',
      },
      {
        concept: 'magnitude-scale',
        note: 'Both are ladders on which one even step means multiplying by a fixed factor; one numbers how bright a star looks, the other how big a thing is.',
      },
      {
        concept: 'telescope',
        note: 'Both deal with something too small in the view to make out, but one is about an instrument opening out the angle it subtends, and the other about changing which scale the whole picture is drawn at.',
      },
    ],
  },
};
