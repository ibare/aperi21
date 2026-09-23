/**
 * fermi-level 개념 선언.
 *
 * 반도체 여섯 가운데 이쪽만 **채움의 경계**를 말한다.
 *   fermi-level  전자가 **어디까지** 찼는가, 그리고 데우면 그 경계가 kT 폭만큼
 *                **무뎌진다** — 깊은 곳은 꼼짝하지 않는다
 *   band-theory  **틈의 너비**가 도체 · 부도체 · 반도체를 가른다
 * 틈 · 도체/부도체 구분 · 불순물 · 접합은 여기 쓰지 않는다. 이쪽만 절대 0도 · 채워질
 * 확률 · 계단이 S 자가 됨 · kT · 「위쪽 전자만 움직인다」 어휘를 갖는다.
 * 도핑이 페르미 준위를 옮기는 것은 화면에 없다 — avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const fermiLevelConcept: Aperi21ConceptSource = {
  id: 'fermi-level',
  label: 'How Far Up the Electrons Fill, and How Blurred That Edge Is',
  canonicalSim: 'aperi21:fermi-level',

  surface: {
    definition:
      'How far up the levels of a metal the electrons reach and what warming does to that boundary: perfectly sharp at absolute zero, blurred over a width of kT once heated, with the deeper electrons untouched.',
    exemplarKeywords: [
      'Fermi level',
      'Fermi energy of a metal',
      'the occupation probability curve',
      'a step function at absolute zero',
      'the edge smeared by kT',
      'only the electrons near the top can be excited',
      'why the electron contribution to heat capacity is small',
      'the filled sea of levels in a metal',
      'how far up do the electrons go',
      'what does the occupation function mean',
      'the boundary between filled and empty levels',
      'one level at a time being emptied and refilled',
    ],
  },

  briefing: {
    observable: [
      'Three panels stand on one baseline. The left one is a whole band with a filled sea below and empty space above; the middle is a narrow slice of that sea opened out large; the right is a curve of occupancy against the same vertical scale, running from none to all across.',
      'A dashed accent line at the level in question runs across all three, so the same height means the same thing in each.',
      'A framed strip on the whole band, tied to the middle panel by two lines, says which sliver of it the enlargement is showing.',
      'At absolute zero the lower half of the enlarged levels is full to every place and the upper half holds nothing at all, and the curve is a step that drops at the dashed line.',
      'Warmed to room temperature, a handful of electrons from the two levels just below the line move up into the two just above; the corner of the curve rounds off; a short dimension line appears beside it carrying a width in electronvolts.',
      'Warmed further, more electrons rise, the emptiness reaches deeper, the curve opens into a wide S and the dimension line grows several times longer with a larger figure.',
      'The whole band on the left does not change through any of it — at its scale the blurring is smaller than the spacing of its own rows.',
      'Cooled back, the risen electrons return to the very places they left and the curve closes back into a step, and the round begins again.',
      'The lowest levels in the enlarged panel stay full throughout.',
      'A temperature is written and changes to its new value as each warming or cooling begins.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. Three temperatures are visited in turn and the round repeats.',
        'An enlargement is used because the blurring is a few hundredths of an electronvolt against a filling height of several, and would otherwise be thinner than a line.',
        'The whole band is kept beside it rather than replaced, because the smallness of the blurring against the depth of the sea is half of what is being claimed.',
        'The enlargement factor is never written as a number; the frame and its two tie lines say what the window is, and the width dimension provides the measure inside it.',
        'How many electrons sit on each level comes from the distribution, so the number of empty places below the line always matches the number of electrons above it — none are created, they move.',
        'The places emptied at the lower temperature stay empty at the higher one, so warming never sends an electron back down.',
        'The dots and the curve say the same thing twice on purpose: the dots say which electrons moved, the curve says what shape the boundary has taken.',
        'The temperature written on screen is the value being moved to, not an interpolated reading, and the width figure appears only once its step has been reached.',
        'The accent colour is kept for the boundary level alone; an electron that has risen is not coloured differently, since it is the same electron.',
        'No scale is drawn on either axis of the curve beyond its two ends, and no value is offered for anything except the two widths and the filling height.',
      ],
    },

    useWhen: [
      'The reader has met the phrase "filled up to" and needs the boundary to be a place in a picture rather than a term. A full lower half against an empty upper half, with a line drawn between them, is that place.',
      'The point is that warming a metal disturbs only a sliver of its electrons. The untouched sea on the left, beside an enlargement in which a few places change hands, is the comparison that carries it.',
      'The article wants the occupancy curve to mean something concrete. The step rounding into an S at the same moment that particular electrons change level is what ties the curve to the electrons.',
    ],

    avoidWhen: [
      'The subject is the forbidden gap, or telling conductors from insulators. One material is shown here and nothing about it is compared with anything else.',
      'The article is about impurities shifting the boundary, about n-type and p-type material, or about a junction. Nothing is added to the metal and nothing is joined to it.',
      'The point is how many states there are at each energy, or a band whose levels crowd together with height. The levels here are drawn evenly spaced as a convention.',
      'The article needs a value for the boundary energy of some named metal, or a number read off the curve. Only the filling height and the two widths carry figures.',
      'The subject is a distribution of speeds among free particles, or a gas whose particles may share the same state. Every place here holds a fixed number and no more.',
      'The point is a current, a drift, or a conduction mechanism. Nothing flows on this screen; electrons change levels and stay where they are.',
    ],

    contrastWith: [
      {
        concept: 'band-theory',
        note: 'One takes the levels as given and asks how far up they are filled and how sharp that edge stays; the other asks how wide the forbidden stretch above the filled ones is, and sorts materials by it.',
      },
      {
        concept: 'maxwell-boltzmann-distribution',
        note: 'Both describe how energy is shared out among many particles, but one counts places that admit a fixed number each, so a cold system is packed solid up to a boundary, and the other has no such limit and piles its particles towards the bottom.',
      },
      {
        concept: 'semiconductor-doping',
        note: 'One is about where the filling boundary lies in a pure metal and how warmth blurs it; the other is about adding a foreign atom so that a carrier exists at all.',
      },
      {
        concept: 'particle-in-a-box',
        note: 'One fills a ladder of levels with countless electrons and looks at the top of the filling; the other has one particle on such a ladder and asks which rungs confinement allows.',
      },
      {
        concept: 'temperature-and-resistance',
        note: 'One shows what heating does to the occupancy of levels and nothing else; the other shows what heating does to a current, and gets opposite answers for two kinds of material.',
      },
    ],
  },
};
