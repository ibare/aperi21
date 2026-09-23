/**
 * pn-junction 개념 선언.
 *
 * 반도체 여섯 가운데 이쪽은 **경계에 무엇이 남는가** 하나만 주장한다.
 *   pn-junction           맞붙인 자리의 운반자가 짝지어 사라지고 **드러난 이온**과
 *                         내부 전기장이 남는다 — 그 층이 얇아지고 넓어진다
 *   semiconductor-doping  그 두 쪽을 만드는 일(불순물이 운반자를 만든다)
 *   diode-and-led         같은 사실을 **바깥에서 잰 곡선**과 빛으로 본다
 *   transistor-principle  접합 **둘**을 이어 작은 전류가 큰 전류를 여닫는다
 * 이쪽만 공핍층 · 드러난 이온 · 내부 전기장 · 순방향/역방향에서 층의 폭 어휘를 갖는다.
 * 전류-전압 곡선 · 문턱 · 빛 · 교류를 한 방향으로 바꾸는 일은 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pnJunctionConcept: Aperi21ConceptSource = {
  id: 'pn-junction',
  label: 'The Bare-Ion Layer Where Two Kinds Meet',
  canonicalSim: 'aperi21:pn-junction',

  surface: {
    definition:
      'What forms where two oppositely doped pieces are joined: the carriers near the boundary pair off and vanish, leaving a layer of uncovered fixed charge and a field across it that an applied voltage thins or widens.',
    exemplarKeywords: [
      'pn junction',
      'depletion layer',
      'the field built in at a junction',
      'forward and reverse bias',
      'space charge region',
      'uncovered donor and acceptor ions',
      'carriers recombining where the two pieces meet',
      'why the layer gets thinner one way and thicker the other',
      'what happens the moment p and n are joined',
      'the width of the layer and the voltage applied',
      'nothing can cross the widened layer',
      'fixed charge left behind when the carriers go',
    ],
  },

  briefing: {
    observable: [
      'A long bar lies across the picture, one kind of material on each side, with a plate at either end. Fixed charges stand at even spacing all the way along, of one sign on the left and the other on the right, and beside each one a carrier jitters in place — a hollow ring on one side, a filled dot on the other.',
      'The two halves arrive apart and are brought together.',
      'The carriers within a couple of columns of the boundary then cross it, meet their opposite numbers, and vanish in pairs with a small ring spreading at each meeting.',
      'Where they have gone, the fixed charges are left standing with nothing beside them, and they turn the accent colour.',
      'That stretch is then washed with a tint, measured by a dimension line and named, and an arrow appears above it pointing from one side to the other.',
      'Nothing crosses while it stands like that; the carriers outside it only jitter.',
      'Signs then appear on the two plates and a voltage is named. The carriers press in towards the boundary, the tinted stretch narrows to about half, and the carriers begin to run — one kind one way, the other the opposite way, each with a tail behind it — fading as they cross the thinned layer and meeting in the middle, while fresh ones come in at the plates.',
      'Switching that off leaves the carriers standing beside fixed charges again and the layer back at its first width.',
      'The signs on the plates then swap and a larger voltage is named. The carriers withdraw towards both ends, the outermost rows leaving into the plates, the tinted stretch grows to nearly twice its first width, more fixed charges stand uncovered, and the arrow above it lengthens.',
      'Nothing crosses at all in that state, and none of the carriers carries a tail.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The joining, the equilibrium, the one voltage and then the other run in a fixed order and the round repeats.',
        'Every fixed charge has one carrier beside it, so a neutral stretch reads as "all of them paired" and the layer reads as "charges with no partner" — no count has to be given.',
        'The width follows a square-root law from the voltages rather than being drawn to taste, so the thinning and the widening stand in the right proportion to each other.',
        'The internal voltage of the junction is deliberately not written, since putting it beside the applied one would turn a comparison of numbers into the claim.',
        'Only carriers that are actually flowing are given tails, so a still frame says which of the two cases is the conducting one.',
        'Carriers jitter and fixed charges do not, which is the whole difference between the two on screen.',
        'Under the reversing voltage the carriers retreat at unchanged spacing instead of bunching up, because being drawn away is not the same as being compressed.',
        'Carriers are drawn in one ink and told apart by a filled dot against a hollow ring; the accent colour is kept for uncovered fixed charge alone, since that is what the layer is made of.',
        'Each pair that meets is marked by one spreading ring, so the vanishing has a moment rather than being a fade.',
        'The applied voltages are named on screen, and no current, no meter and no circuit is drawn anywhere.',
      ],
    },

    useWhen: [
      'The reader has been told that a junction passes one way and wants to know what is actually there. A strip of fixed charge with no carriers beside it, measured and named, is the thing itself.',
      'The article needs the layer to widen and narrow rather than merely exist. One voltage halves it and the other nearly doubles it inside a single round.',
      'The prose has to explain why current stops rather than merely slows in one direction. Carriers retreating from both ends and leaving a wider empty strip is that explanation.',
      'The point is that the field at the junction is made by charge that cannot move. Carriers vanishing in pairs and their fixed partners lighting up is where that comes from.',
    ],

    avoidWhen: [
      'The article is about the trace of current against voltage for a device, about a turn-on voltage, or about light being given out. No curve, no threshold and no light appear here.',
      'The subject is where the carriers came from — impurities, the two kinds of material, or how either is made. They are already in place when the screen begins.',
      'The article works in energy bands, a barrier drawn as a step in energy, or levels bending at the boundary. Nothing here is drawn in energy at all.',
      'The point is turning an alternating supply into a one-way one, or a circuit built around the device. Two steady voltages are applied in turn, and nothing on screen alternates or is wired to anything.',
      'The subject is leakage in the blocking direction, or breakdown at a large reverse voltage. The blocking case here is simply empty.',
      'A current, a layer width or a voltage at the junction is to be read as a figure. Only the two applied voltages are named.',
      'The article is about a device with three regions and a controlling terminal. One boundary is shown.',
    ],

    contrastWith: [
      {
        concept: 'semiconductor-doping',
        note: 'One makes the carriers in a single piece of material and shows what each kind does; the other brings two such pieces together and is about the strip where the carriers have destroyed one another.',
      },
      {
        concept: 'diode-and-led',
        note: 'One accounts for the one-way behaviour from inside, in carriers and fixed charge; the other never opens the device and reads the same fact off a trace measured at its terminals.',
      },
      {
        concept: 'photovoltaic-effect',
        note: 'One is about how the layer and its field come to be, and what a voltage does to them; the other takes the layer as given and has light making pairs inside it that the field then drives apart.',
      },
      {
        concept: 'transistor-principle',
        note: 'One boundary makes a device that either passes or blocks; putting two of them back to back makes one whose passing is itself commanded by a small current.',
      },
      {
        concept: 'iv-characteristic',
        note: 'One is the mechanism that makes a device behave differently in the two directions; the other is a comparison of measured traces in which such a device is one case among several.',
      },
    ],
  },
};
