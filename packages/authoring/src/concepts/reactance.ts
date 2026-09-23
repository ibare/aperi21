/**
 * reactance 개념 선언.
 *
 * 교류 넷 가운데 이쪽은 **「얼마나 흐르는가 — 진동수를 올리면 둘이 반대로 간다」** 다.
 *   reactance 코일은 **더 막고** 축전기는 **덜 막는다** (따로 놓인 두 회로)
 *   phase-in-ac-circuit     같은 두 소자의 **때**(마루의 앞뒤) — 크기가 아니다
 *   series-rlc-resonance    **한 고리에 섞어** 둘이 지워지는 진동수
 *   ac-generation           그 교류 자체가 어디서 오는가
 * 이쪽만 「진동수를 올린다 · 반대로 간다 · 같은 전압에 흐르는 양」 어휘를 갖는다.
 * 합성 임피던스(Z)는 화면에 없다 — 간극 장부에 올렸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const reactanceConcept: Aperi21ConceptSource = {
  id: 'reactance',
  label: 'Frequency-Dependent Opposition of a Coil and a Capacitor',
  canonicalSim: 'aperi21:reactance',

  surface: {
    definition:
      'Raise the frequency of an alternating supply and a coil opposes the current more while a capacitor opposes it less, so from the same voltage the one current shrinks away as the other grows.',
    exemplarKeywords: [
      'reactance',
      'inductive reactance and capacitive reactance',
      'how frequency changes what a coil lets through',
      'a capacitor passes high frequencies and blocks low ones',
      'a coil blocks high frequencies and passes low ones',
      'X L equals two pi f L',
      'X C equals one over two pi f C',
      'why a capacitor blocks a steady supply',
      'opposition to current that depends on frequency',
      'choke and bypass',
      'ohms that change with frequency',
      'filtering by frequency with a single component',
    ],
  },

  briefing: {
    observable: [
      'Two separate loops are stacked one above the other on the left, each fed from its own identical alternating supply drawn as a circle with a wave inside it — the upper loop has a coil in it, the lower a capacitor, each with its rating written alongside.',
      'Beside each loop is its own recording strip carrying that loop’s current as a wave, and the two strips are drawn to the same upright scale so their heights can be compared straight up and down.',
      'The two strips cover the same stretch of time, so when the frequency rises both waves fit more rises and falls into the same width — the rise in frequency is seen as the waves closing up.',
      'As the frequency is stepped up, the upper wave flattens out while the lower one grows, and at the topmost step the coil’s wave is nearly a straight line while the capacitor’s almost fills its strip.',
      'At each resting point the wave from the step before is left behind as a faint dotted outline, so the upper wave sits inside its own earlier outline and the lower wave sits outside it.',
      'On the right a plane carries two curves against frequency: a straight one climbing from the corner for the coil, and a falling one for the capacitor, each named by a letter at its end.',
      'An accent marker slides rightward across that plane as the frequency rises, carrying a point on each curve, and the two points move oppositely — one up, one down.',
      'At one of the resting points the two points meet where the curves cross, and at that same moment the two waves are very nearly the same height, so the crossing and the match of heights are seen together.',
      'The frequency axis carries a few marked values but the upright axes carry none, and no ohms and no amps are written anywhere.',
    ],

    screen: {
      affordances: [
        'Nothing is offered to set; the frequency climbs by steps, rests at each one and then returns to the lowest, over and over, and the reader arrives at the end of the first rest just as the climb begins.',
        'The waves are frozen rather than scrolling, each starting from the left edge of its strip, so the same moment always gives the same picture and the only movement is the change of frequency itself.',
        'Both current waves are the same quantity and so share one colour; the coil and the capacitor are told apart by which row they are in and by the letters beside them, and on the plane by solid against dotted line.',
        'The accent colour is kept for the present frequency alone — the upright marker and the two points riding the curves — so nothing else competes for it.',
        'The faint outline left from the previous step appears only where there is a previous step to leave, which puts the comparison on the screen instead of in the reader’s memory.',
      ],
    },

    useWhen: [
      'The article has given the two formulas for reactance and the reader cannot see why one has the frequency on top and the other underneath. Two waves moving in opposite directions as the same frequency is raised makes the opposite dependence an observation rather than an algebraic detail.',
      'The prose needs opposition itself made visible without putting a figure in ohms on the page. The height of a current wave at a fixed supply voltage stands in for it throughout.',
      'A piece is about picking out frequencies — letting some through and holding others back — and needs the reader to accept first that a single component can treat frequencies differently at all.',
    ],

    avoidWhen: [
      'The point is that the current and the voltage do not peak together. Both waves here start from the left edge alike and no voltage wave is drawn against them.',
      'The article puts a coil and a capacitor in the same loop, or asks what the two oppositions come to when combined with a resistance. The two parts are kept in separate circuits here and never meet.',
      'The subject is the frequency at which a circuit answers best, or a peak in the response. Both curves here run smoothly across the whole sweep with no peak anywhere.',
      'What is wanted is a value in ohms, a current in amps, or a calculation at a stated frequency. Only the supply, the two ratings and a few marks on the frequency axis carry figures.',
      'The article is about resistance that does not care about frequency, or about heat dissipated. Neither loop has a resistor and nothing is accounted for as energy.',
    ],

    contrastWith: [
      {
        concept: 'phase-in-ac-circuit',
        note: 'The same two parts, asked two different questions: one asks how much current gets through at each frequency, the other asks nothing about size and only when the current is at its largest relative to the voltage.',
      },
      {
        concept: 'series-rlc-resonance',
        note: 'One keeps the coil and the capacitor apart so their opposite trends can be seen cleanly; the other puts them in one loop, where those same opposite trends are what allows them to cancel at a particular frequency.',
      },
      {
        concept: 'ac-generation',
        note: 'One starts from an alternating supply already given and asks what the circuit does with it; the other asks where such a supply comes from in the first place.',
      },
      {
        concept: 'impedance-mismatch',
        note: 'Both use one word for how strongly something resists being driven, but one is about a single part’s answer changing with frequency, and the other about two media disagreeing at a boundary so that a wave is sent back.',
      },
    ],
  },
};
