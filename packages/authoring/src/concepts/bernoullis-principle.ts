/**
 * bernoullis-principle 개념 선언.
 *
 * 「좁아지면 빨라진다」 셋 중 **압력** 쪽. 형제와 갈린 자리는 주어다.
 *   continuity-equation   지나가는 **양** — 어느 단면에서나 같다
 *   bernoullis-principle  **압력** — 빨라진 만큼 내려간다, 두 몫의 합이 일정하다
 *   venturi-effect        **장치** — 목이 통의 액체를 끌어올려 뿜는다
 * 이쪽만 「두 몫 · 합이 일정 · 물기둥이 내려간다 · 압력이 낮다」 어휘를 갖는다.
 * 「같은 양 · 칸 세기」 는 쓰지 않고, 날개는 `lift-force` 의 몫이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const bernoullisPrincipleConcept: Aperi21ConceptSource = {
  id: 'bernoullis-principle',
  label: 'Speed Bought With Pressure',
  canonicalSim: 'aperi21:bernoullis-principle',

  surface: {
    definition:
      'That the pressure of a moving fluid and its speed are two shares of one fixed total, so wherever a stream runs faster its pressure stands correspondingly lower.',
    exemplarKeywords: [
      'Bernoulli’s principle',
      'Bernoulli equation',
      'pressure falls where the flow runs fast',
      'speed and pressure traded against each other',
      'static pressure in a constriction',
      'blowing across a strip of paper lifts it',
      'two hanging sheets pulled together when you blow between them',
      'a shower curtain drawn inwards',
      'pressure head and velocity head add to a constant',
      'why should faster water press less',
    ],
  },

  briefing: {
    observable: [
      'A tube seen from the side, wide at each end and pinched in the middle, with water in it shaded by its pressure — darkest at the inlet and outlet, palest through the pinch.',
      'Nine glass columns stand up from the tube along its length, each filled to the pressure of the water below it. When the tube is even, all nine stand at one height.',
      'As the pinch tightens, the columns over it sink, and an amber block grows in exactly the height they gave up; the block is named as the speed share and the water below it as the pressure share.',
      'A dashed line runs across the tops of everything: at every station along the tube the two shares, amber and water, reach that same line together.',
      'Vertical dye stripes drift along with the water, and in the pinch their spacing opens out, so the water is plainly running faster just where the column is lowest.',
      'Left alone, the pinch works slowly between even and its tightest and back, and the caption follows the two cases.',
      'Taking hold of the slider stops that working and leaves the width wherever the reader puts it; letting go does not send it back.',
      'The only writing is three names — the level line and the two shares — and the slider’s own number.',
    ],

    screen: {
      affordances: [
        'A slider sets the width of the pinch, from an even tube down to a little over a third of the inlet.',
        'The automatic working stops the moment the slider is grabbed, not when the value first changes, so pressing and releasing without moving still hands control over.',
        'The claim is checked between two lengths read at the same station — how far the column has dropped, and how tall the amber block above it is — and both against the dashed line they have to reach together.',
        'One colour carries one meaning: amber is the speed share and is spent on nothing else.',
        'Pressure is given twice at once, as shade inside the tube and as height in the columns, so a reader who distrusts one can check it against the other.',
      ],
    },

    useWhen: [
      'The article has written the equation out with its half-rho-v-squared term and the reader cannot see what is being traded for what. Tightening the pinch and watching a column sink by exactly the height of the amber block that replaces it puts the trade in one picture.',
      'The reader grants that the fluid speeds up in a narrow place but does not see why that should lower a pressure. The dashed line the two shares must reach together is the part of the argument to point at.',
    ],

    avoidWhen: [
      'The claim is only that the same amount passes every cross-section, or that a narrow pipe therefore runs fast. The speeding up is taken for granted here and never argued.',
      'The article is about a working device — a sprayer, a carburettor, a flow meter — and what it draws up or measures. This tube carries water and nothing is attached to it.',
      'The fluid is viscous, or the point is the pressure lost along a length of pipe. Nothing is lost here: the two shares always add back to the same line.',
      'The subject is a wing, or why an aircraft holds itself up. There is no body in this flow to be pushed on.',
      'The article needs values in pascals or metres per second. Only the names of the two shares are written.',
    ],

    contrastWith: [
      {
        concept: 'continuity-equation',
        note: 'One takes the speeding up as given and asks what it costs in pressure; the other asks why the fluid must speed up at all, which is that the same amount has to get through.',
      },
      {
        concept: 'venturi-effect',
        note: 'One is the rule stated as a trade between two shares; the other is what a maker does with the low pressure that trade leaves at a throat.',
      },
      {
        concept: 'lift-force',
        note: 'One is the trade itself, argued on a fluid alone; the other is a body held in the stream, where the two sides come out unequal and the body is pushed.',
      },
      {
        concept: 'hydrostatic-pressure',
        note: 'One is about pressure in fluid that is going somewhere, where speed can be had in exchange for it; the other is about pressure in fluid at rest, where depth alone sets it.',
      },
      {
        concept: 'torricellis-law',
        note: 'One keeps the fluid inside and watches pressure and speed swap along the way; the other lets it out and asks only what speed it leaves with.',
      },
      {
        concept: 'viscosity',
        note: 'One has pressure and speed as two shares of a total that holds all along the stream; the other is the fluid’s own friction between layers, which is the thing that has to be left out for any such total to hold.',
      },
    ],
  },
};
