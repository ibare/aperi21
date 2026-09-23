/**
 * laplace-pressure 개념 선언.
 *
 * 표면 넷 중 하나. 이쪽의 주장은 **곡률이 안쪽 압력을 정한다** 하나이고, 그 차이가
 * 무엇을 하는지(작은 거품이 큰 거품에게 진다)까지가 화면이다.
 *   laplace-pressure          곡률 → **압력**
 *   surface-tension           같은 당김이 돌아 **받친다**
 *   capillary-action          그 부족을 기둥 **무게**가 메울 때까지 오른다
 *   wetting-and-contact-angle 그 곡률을 정하는 **각**
 * 이쪽만 거품 둘 · 마주 보는 화살표 · 쪼그라듦 · 빨려 듦 어휘를 갖는다. 막의 당김 T 는 화면에 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const laplacePressureConcept: Aperi21ConceptSource = {
  id: 'laplace-pressure',
  label: 'Laplace Pressure — Curvature Settles the Pressure Within',
  canonicalSim: 'aperi21:laplace-pressure',

  surface: {
    definition:
      'The excess pressure held inside a curved liquid surface, settled by how sharply it curves, so that a smaller bubble squeezes its contents harder than a larger one does.',
    exemplarKeywords: [
      'Laplace pressure',
      'why is the pressure higher inside a small bubble',
      'two soap bubbles joined by a tube',
      'pressure difference across a curved surface',
      'the small bubble empties into the big one',
      'delta p equals two gamma over r',
      'it is hardest to blow a bubble at the start',
      'curvature and the pressure it holds',
      'connected bubbles refuse to end up the same size',
      'the tighter the curve, the greater the squeeze',
    ],
  },

  briefing: {
    observable: [
      'Two soap bubbles of different size sit on the two open mouths of a tube bent into a U, and a plate across the middle of the tube keeps the two sides apart.',
      'On either side of that plate an arrow faces the other across it, standing for how hard the air inside each bubble pushes. Both are drawn to one scale in one colour, and the arrow from the smaller bubble is plainly the longer — close to twice the other.',
      'The plate then lifts clear of the tube, and strokes of air begin to run along the tube from the small bubble’s mouth towards the large one’s.',
      'The small bubble’s film actually shrinks as this happens, and the large one swells slightly; nothing is announced, the shapes themselves change.',
      'The smaller it gets the more sharply it curves, so its arrow grows longer still and the strokes of air quicken — the run speeds up rather than easing off.',
      'Once the shrinking film has passed a hemisphere it flattens out and the whole thing finishes in a moment.',
      'At the end only a shallow, almost flat film is left stretched over the small mouth, the strokes have stopped, and the two arrows are the same length.',
      'That ending is held on screen so the two equal arrows can be read against one another.',
      'The large bubble grows only a little even though it has taken all the other’s air, and this is not exaggerated — the strokes in the tube are what say where the air went.',
      'No radius, no pressure value and no formula is written anywhere; the films are pinned at the tube mouths and no angle is marked where they meet the glass.',
    ],

    screen: {
      affordances: [
        'One round runs by itself: the two bubbles are already being compared when the picture opens, then the plate lifts and the rest follows.',
        'The two arrows are drawn to one scale and in one colour, so the only thing being compared is their lengths, and the longer one is the one that gets its way.',
        'No accent colour is used at all. What divides the two sides is a difference of length, and giving one side its own hue would settle by paint what the picture settles by shape.',
        'The picture is drawn through its layers — air, then the tube walls, then the moving strokes, then the films, then the plate, then the arrows — so the arrows stay readable over the flow and the films stay drawn over the air.',
        'The strokes in the tube run fastest just as the shrinking film nears a hemisphere, which is where the difference between the two arrows is at its greatest.',
      ],
    },

    useWhen: [
      'The article has given the pressure as inversely proportional to the radius, and the reader’s intuition insists the small bubble should be filled from the large one. Watching the small one lose is what unseats that.',
      'The claim to carry is that the difference grows as the smaller side shrinks, so nothing here settles into a middle. The run accelerating to its end, rather than easing towards a balance, is that claim in motion.',
      'The reader has been told that blowing a bubble is hardest at the very start and wants to see why a tighter curve costs more.',
    ],

    avoidWhen: [
      'The point is the pull along the surface, or what a surface can hold up. No pull is drawn here; the films are shown only by their shape.',
      'The subject is the angle a liquid makes where it touches a solid, or how far it spreads on one. The films here are pinned at the tube mouths and treated as fixed there.',
      'The article is about a liquid rising in a narrow tube, or about where a raised column comes to rest. Nothing rises here and weight plays no part in the picture.',
      'The subject is pressure that grows with depth, or a pressure applied to an enclosed fluid being handed on unchanged through it. The pressure here is settled by a shape at the boundary, and the air inside each bubble is treated as all at one pressure.',
      'The article is about a gas being squeezed into a smaller volume and rising in pressure by that. The air’s compressibility is deliberately left out, the excess being tiny beside the atmosphere.',
      'Values are wanted — a pressure in pascals, a radius, a surface tension. Nothing on the screen carries a number.',
    ],

    contrastWith: [
      {
        concept: 'surface-tension',
        note: 'One takes the surface as a thing that pulls and asks what it can carry; the other takes it as a boundary with a shape and asks what pressure that shape holds behind it.',
      },
      {
        concept: 'capillary-action',
        note: 'Both begin from the pressure a curved surface sets. One lets that difference drive air out of one film into another; the other lets it lift a liquid until the weight raised makes the difference up.',
      },
      {
        concept: 'wetting-and-contact-angle',
        note: 'One takes the curvature as given and asks what pressure follows from it; the other asks what settles that curvature in the first place, where the liquid meets a solid.',
      },
      {
        concept: 'hydrostatic-pressure',
        note: 'One has the pressure settled by the shape of a boundary and uniform behind it; the other has it settled by nothing but how far down one has gone.',
      },
    ],
  },
};
