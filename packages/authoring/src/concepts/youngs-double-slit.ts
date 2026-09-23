/**
 * youngs-double-slit 개념 선언.
 *
 * 이 묶음에서 유일하게 **빛을 물결로 그리는** 조각이고, 유일하게 독자가 누를 것이 있다.
 * 이미 선언된 간섭 이웃들과는 무엇을 주장하는지로 갈랐다.
 *   youngs-double-slit       빛을 **보탰는데 줄이 꺼진다** — 둘째 틈이 열리는 순간과 꺼지는 순간이 맞물린다
 *   interference             두 원천이 세운 무늬가 **제자리에 머문다**
 *   constructive-destructive 엇갈린 몫이 합의 크기를 정한다
 *   diffraction              틈 하나를 지난 물결이 그늘로 **휘어 든다**
 * 이쪽만 빛 · 스크린 밝기 · 「하나일 때보다 어둡다」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const youngsDoubleSlitConcept: Aperi21ConceptSource = {
  id: 'youngs-double-slit',
  label: 'Adding Light That Makes a Place Darker',
  canonicalSim: 'aperi21:youngs-double-slit',

  surface: {
    definition:
      'What opening a second slit does to the light already falling on a screen: instead of brightening it everywhere, it leaves a set of places darker than they were with one slit alone.',
    exemplarKeywords: [
      'Young’s double slit experiment',
      'interference fringes of light',
      'two slits make bright and dark bands',
      'evidence that light is a wave',
      'why does adding light make a dark line',
      'light plus light equals darkness',
      'path difference between two slits',
      'bright and dark stripes on a screen',
      'the classic double slit demonstration',
      'what happens when you cover one of the slits',
      'a wall with two narrow openings',
    ],
  },

  briefing: {
    observable: [
      'A wall with openings in it stands between a field of ripples on the left and a screen on the right. At the start only the upper opening is clear, and ripples stream out of it in arcs.',
      'The strip along the screen is evenly lit from top to bottom, with no banding in it, and a curve drawn beside the screen holds the same even shape.',
      'A shutter over the lower opening then slides away, and a second set of arcs begins to spread from it at the same pace as the first — the front of the new ripples travels outward and can be followed.',
      'Where the two sets of arcs overlap, quiet radial lanes appear, along which the field barely stirs.',
      'The moment the front of the second set reaches the screen, the strip begins to break into bands at those places, starting where the new ripples arrive first and spreading as they arrive everywhere.',
      'A dashed curve, marked as the reading with one slit alone, stays beside the live curve, so the live curve can be seen dipping below it rather than merely varying.',
      'Where the dips go deepest the strip is darker than it was with one opening, and short ticks are drawn across those places.',
      'The quiet lanes in the ripples run straight out to the very places the ticks are drawn, so the dark bands are continuous with something visible in the field.',
      'When the lower opening is shut again, the second set of ripples runs out, the bands fade, and the strip returns to being evenly lit.',
      'A line of writing below reports what state the picture is in, and changes as the second set of ripples arrives and again as it clears.',
    ],

    screen: {
      affordances: [
        'A button beside the writing opens and closes the lower opening. Pressing it takes over from the round that has been running on its own and opens or shuts from that instant, and its wording changes to whichever of the two is now available.',
        'Left alone, the lower opening is uncovered and covered again on a fixed round, so the same comparison happens over and over without anyone pressing.',
        'The second set of ripples spreads at the same pace as the first rather than appearing all at once, which is what ties the moment a band darkens to the moment the ripples reach that place.',
        'The dashed curve is kept from the one-slit state as a standing comparison, so "darker than before" is read off the picture rather than remembered.',
        'The ripples are drawn as a field of crests and troughs rather than as lines of travel, which is what lets the quiet lanes between the two sets be seen running out to the screen.',
        'The crests and troughs are told apart by lightness alone rather than by two colours, and the emphasis colour is kept for one meaning only — the places that have gone dark.',
        'The ticks marking the dark places appear only once the second set of ripples has reached the whole screen, on the same reading that the writing below uses, so the writing never points at marks that are not there.',
        'The openings are narrow enough that one alone lights the screen evenly, which is what makes any banding afterwards attributable to the second one.',
        'No wavelength, spacing or path difference is written anywhere; the strip and the two curves carry the whole comparison.',
      ],
    },

    useWhen: [
      'The article has stated that light interferes and that this is why it must be a wave, and the reader has no reason to find that surprising. The surprise is here: light is added and specific places go darker than they were, and the reader can do the adding themselves with the button.',
      'The point being made is that the dark bands are not shadows but cancellations. The quiet lanes in the field run out to exactly the places the screen goes dark, so the bands are continuous with something the reader can see in the ripples.',
      'The article wants the comparison "darker than with one slit" rather than merely "bright and dark bands". The one-slit reading is left on screen as a dashed curve for the live one to fall below.',
    ],

    avoidWhen: [
      'The subject is a single opening and how far the wave spreads past it, or how the width of the opening governs that spreading. The openings here are fixed and narrow and one of them alone lights the screen evenly.',
      'The article is about the pattern that two sources set up in the medium itself and the fact that it holds still. The field here is a step on the way; what is being watched is the screen.',
      'The point turns on how far out of step two waves are, on phase difference as a quantity, or on adding two waves of different amplitude. Nothing on screen is expressed in those terms.',
      'The figures wanted are the fringe spacing, the wavelength, the slit separation, or the path difference to a given band. None of these is written anywhere.',
      'The subject is a diffraction grating with many openings, or a thin film, or any other way of producing colours. Two openings are drawn and the light has no colour.',
      'The article treats light as particles, or is about what happens when the light is made faint enough to arrive one piece at a time. What is drawn is a continuous field of ripples.',
    ],

    contrastWith: [
      {
        concept: 'interference',
        note: 'Both come from two sources of the same waves; one is about the pattern staying put in the medium, the other about what appears on a screen the instant the second source is added.',
      },
      {
        concept: 'constructive-destructive',
        note: 'One takes two waves and asks how their being out of step decides the size of the sum; the other takes that for granted and shows the consequence — that opening a second slit makes certain places darker.',
      },
      {
        concept: 'diffraction',
        note: 'One needs the wave to spread past each opening before anything can overlap; the other is about that spreading itself, with a single opening and nothing to add to it.',
      },
      {
        concept: 'slit-width-and-diffraction',
        note: 'One keeps the openings narrow so that one alone gives an even wash and any banding must come from the second; the other varies the width of one opening and asks how far the wave spreads.',
      },
    ],
  },
};
