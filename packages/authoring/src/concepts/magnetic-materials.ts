/**
 * magnetic-materials 개념 선언.
 *
 * 짝인 `magnetic-dipole` 과는 **주어**로 갈랐다.
 *   magnetic-materials  같은 자석 앞에서 **재료마다 응답이 다르다** (세게 끌림 · 조금 끌림 · 밀림)
 *   magnetic-dipole     고리 전류 하나와 막대자석 하나가 **같은 것**이다
 * 이쪽만 「강자성 · 상자성 · 반자성 · 구역 · 정렬 · 밀려남」 어휘를 갖는다. 고리와 자석의
 * 같음은 저쪽, 붙지 않는 금속이 움직임을 **막는** 쪽은 `eddy-current` 에 둔다 — 구리가
 * 자석에 붙지 않는다는 같은 사실을 두 조각이 다른 주장으로 쓴다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magneticMaterialsConcept: Aperi21ConceptSource = {
  id: 'magnetic-materials',
  label: 'Ferromagnetic, Paramagnetic and Diamagnetic Response',
  canonicalSim: 'aperi21:magnetic-materials',

  surface: {
    definition:
      'That one and the same magnet pulls iron hard, draws aluminium in only slightly and pushes bismuth slightly away, the difference lying in what the tiny magnets inside each material do.',
    exemplarKeywords: [
      'ferromagnetic paramagnetic diamagnetic',
      'why is aluminium not attracted to a magnet',
      'magnetic domains lining up',
      'a material pushed away by a magnet',
      'sign of the magnetic susceptibility',
      'metals that a magnet will not stick to',
      'bismuth repelled by a strong magnet',
      'why only some materials are magnetic',
      'tiny atomic magnets inside a solid',
      'weakly magnetic materials',
    ],
  },

  briefing: {
    observable: [
      'Three bars hang on threads from a rail, each with a dotted plumb line marking where it hangs when undisturbed, and each with its own magnet standing to its right with the north end facing it.',
      'The three bars carry names beneath them — iron, aluminium, bismuth — together with the class each belongs to.',
      'Inside the iron bar the little arrows are grouped into three regions divided by dotted boundaries, each region pointing a different way, so the bar as a whole adds up to nothing.',
      'Inside the aluminium bar the little arrows point every which way and keep jiggling, never settling.',
      'Inside the bismuth bar there are no arrows at all to begin with, only dots marking where the atoms sit.',
      'The three magnets then advance the same distance at the same moment, so all three bars are tried under the same conditions.',
      'The iron bar swings hard towards its magnet until its lower corner rests against the magnet face, its region boundaries fading as all the arrows turn to one direction.',
      'The aluminium bar leans a little towards its magnet, and the bismuth bar leans a little the other way, each measurably off its plumb line in opposite directions.',
      'As the magnet comes in, short arrows grow inside the bismuth bar pointing the opposite way to those in the other two.',
      'The caption at the moment of comparison says out loud that the two weak tilts have been drawn several times larger than they are.',
      'A closing view holds the same tilts while the insides are read: nine arrows all one way in the iron with the boundaries gone, the aluminium arrows still jiggling and only half turned, the bismuth arrows all pointing away.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the bars hang, the magnets advance together, the tilts are held, the insides are read, and it begins again.',
        'Each bar is given its own magnet rather than sharing one, so all three are the same distance from the same pole and nothing but the material differs.',
        'The dotted plumb line is drawn only outside the bar, above it and below it, so it serves as the reference for the tilt without lying across the arrows inside.',
        'The two weak tilts are magnified by a factor that the caption itself names, and since no angle or susceptibility appears anywhere, nothing invites the sizes to be read off as real.',
        'Iron is allowed to go all the way to contact without magnification, because once it touches there is nothing further to exaggerate.',
        'Materials are told apart by their names and by which way and how far they lean, never by colour, and the whole picture is drawn in one set of tones.',
        'The paramagnetic arrows keep jiggling even at the end, which is how the alignment is shown to be permanently unfinished rather than merely partial.',
      ],
    },

    useWhen: [
      'The article has divided materials into three magnetic classes and the reader treats the last two as varieties of not-magnetic. Three bars tried at once, one slamming across, one leaning in and one leaning away, puts the weak ones back on the map with a direction each.',
      'The prose needs the inside story and the outside result held together — why iron can be a magnet at all and why aluminium cannot, told by what its little arrows do when the magnet arrives.',
    ],

    avoidWhen: [
      'The article is about what happens after the magnet is taken away — what stays magnetised, soft iron against hard, magnetisation curves that do not retrace. Nothing here is left behind.',
      'Susceptibilities, permeabilities or forces are wanted as numbers, or the two weak materials are to be compared quantitatively. The only number on view is the factor by which the weak tilts were enlarged.',
      'The subject is simply that magnets stick to some things and not others, with no interest in the inside or in the weak cases.',
      'The article is about a conductor resisting a moving magnet, or about metals that are not attracted yet still push back while there is motion. Every magnet here approaches slowly and the bars end at rest.',
      'Temperature is the subject — a magnet losing its magnetism when heated, or alignment being destroyed above some point. Nothing is heated and the jiggling is a fixed background.',
      'The reader is meant to choose a material or move the magnet themselves. The three are fixed and tried together.',
      'The point is how a material concentrates a field inside itself, or what an iron core does to a coil. No field lines are drawn at all.',
    ],

    contrastWith: [
      {
        concept: 'magnetic-dipole',
        note: 'One takes a magnet for granted and sorts materials by how they answer it; the other asks what a magnet is, and answers that it is a circulating current.',
      },
      {
        concept: 'eddy-current',
        note: 'Both concern metals a magnet will not stick to, but one is about a steady lean that persists while nothing moves, and the other about a resistance that exists only while something is moving.',
      },
      {
        concept: 'lenzs-law',
        note: "Both have a material answering a magnet in the opposing direction, but one's opposition is a standing property of the substance, and the other's is called into being by a change and vanishes with it.",
      },
    ],
  },
};
