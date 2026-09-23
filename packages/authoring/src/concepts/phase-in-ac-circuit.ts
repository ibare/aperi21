/**
 * phase-in-ac-circuit 개념 선언.
 *
 * 교류 넷 가운데 이쪽은 **「때」** 하나만 맡는다 — 크기는 일절 말하지 않는다.
 *   phase-in-ac-circuit     저항 같이 · 축전기 1/4 주기 먼저 · 코일 1/4 주기 늦게
 *   reactance 같은 두 소자의 **크기**(진동수에 따라 얼마나 흐르나)
 *   series-rlc-resonance    셋을 한 고리에 이어 두 막음이 **지워지는** 진동수
 *   ac-generation           그 사인파 자체의 출처
 * 이쪽만 「마루가 먼저 · 같이 · 늦게」 어휘를 갖는다. 진동수는 고정이고 진폭 비교가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const phaseInAcCircuitConcept: Aperi21ConceptSource = {
  id: 'phase-in-ac-circuit',
  label: 'Which Peak Comes First — Voltage or Current',
  canonicalSim: 'aperi21:phase-in-ac-circuit',

  surface: {
    definition:
      'Across a resistor the current reaches its peak at the same instant as the voltage; across a capacitor it gets there a quarter of a cycle earlier, and across a coil a quarter of a cycle later.',
    exemplarKeywords: [
      'phase difference between voltage and current',
      'current leads the voltage in a capacitor',
      'current lags the voltage in an inductor',
      'ELI the ICE man',
      'ninety degrees out of step',
      'a quarter of a cycle apart',
      'in phase across a resistor',
      'why the two peaks do not line up in an alternating circuit',
      'leading and lagging current',
      'phasor arrows for a single component',
      'which one peaks first, the voltage or the current',
    ],
  },

  briefing: {
    observable: [
      'Three rows are stacked up, one for a resistor, one for a capacitor and one for a coil, each with its part drawn at the left, its own recording strip in the middle and a pair of arrows turning inside a circle at the right.',
      'On every strip the voltage is a solid wave and the current a dashed one, and all three strips are arranged so that the single voltage peak falls at the same place across the picture, joined by one upright dotted line running down through all three.',
      'In the resistor’s row the dashed peak sits on that line; in the capacitor’s row it sits to the left of it, earlier; in the coil’s row it sits to the right of it, later.',
      'An accent-coloured span with a marking for a quarter of a cycle is drawn from the dashed peak to the dotted line in the two rows where they differ, and is absent from the resistor’s row because there is nothing there to span.',
      'An upright cursor sweeps each strip from left to right, carrying two dots that ride the two waves — a filled one on the voltage and a hollow one on the current.',
      'In the capacitor’s row the hollow dot reaches the top of its wave first and the filled one follows; in the coil’s row the order is the other way about; in the resistor’s row the two arrive together.',
      'The pair of arrows in each circle turns in step with the same clock, with its upright extent standing for the height of the wave at that moment, and the two arrows in the resistor’s circle turn together while the other two circles hold a quarter turn between them in opposite senses.',
      'Each row is brought forward in turn while the other two sit faded, and at the end all three stand at full strength for one more sweep so that earlier, together and later are seen in one glance.',
      'The two waves are drawn in the same ink and separated by solid against dashed, matching the solid and dashed arrows, and the current is drawn shorter than the voltage only so the two can be told apart where they coincide.',
      'No frequency, no voltage and no component values are written; the only mark on the difference is the quarter-cycle symbol.',
    ],

    screen: {
      affordances: [
        'There is nothing to adjust; the three rows are visited in turn and then shown together, over and again, and the reader arrives with the cursor part way across the resistor’s row.',
        'Because the two heights stand for quantities in different units, their relative size is deliberately meaningless and no values are put on either, which keeps the reader reading across rather than up.',
        'The accent colour marks only the discrepancy itself, so its absence from the resistor’s row is as informative as its presence in the other two.',
        'The frequency is fixed throughout, so nothing on screen suggests that the quarter-cycle offset is something that grows or shrinks.',
        'One width of strip holds a little more than one cycle, so there is exactly one voltage peak to refer to and no ambiguity about whether a current peak is a quarter after this one or three-quarters before the next.',
        'The direction the arrows turn is left to the turning itself rather than marked with a curved arrow, so a still frame shows the offset while the movement shows which of the two is in front.',
      ],
    },

    useWhen: [
      'The article has introduced leading and lagging and the reader has no way to tell which is which beyond a mnemonic. Three rows sharing one reference peak turn the distinction into left of the line against right of it.',
      'The prose needs the offset to be a quarter of a cycle in particular rather than some unspecified shift, and wants that quantity marked on the picture rather than asserted in the text.',
      'A piece is heading toward power in alternating circuits, or toward the arrows of a phasor diagram, and needs the reader to first accept that two quantities in one component can peak at different moments at all.',
    ],

    avoidWhen: [
      'The subject is how much current flows, or how the opposition of a coil or a capacitor changes with frequency. The frequency never changes here and the heights are drawn for legibility rather than measured.',
      'The article puts the three parts into one loop, or asks what the combination does. Each row stands on its own and no circuit is drawn around any of them.',
      'The point is a frequency at which something is largest, or a response peaking and falling away. Nothing is swept and nothing peaks.',
      'What is wanted is a phase angle in degrees at some intermediate value, or a power factor calculated from it. The only marking is a quarter of a cycle and the three cases are the extreme ones.',
      'The article is about an oscillator following or opposing something shaking it. Nothing here is being driven into motion and nothing has a rhythm of its own.',
    ],

    contrastWith: [
      {
        concept: 'reactance',
        note: 'The same two parts asked about differently: one asks how much current the supply drives through them at each frequency, the other says nothing about size and only which of the two peaks arrives first.',
      },
      {
        concept: 'series-rlc-resonance',
        note: 'One keeps the parts separate and reports the fixed offset each one imposes; the other joins them in a loop, where those offsets being opposite is what lets the two oppositions wipe each other out.',
      },
      {
        concept: 'ac-generation',
        note: 'One asks where a sine-shaped supply comes from at all; the other takes two such waves in a circuit and asks only about the interval between their peaks.',
      },
      {
        concept: 'driven-oscillation',
        note: 'Both are about an answer that does not keep step with what produces it, but one is a body taking up a driver’s tempo and moving with or against it, while this is a fixed quarter-cycle offset set by which component the voltage sits across.',
      },
    ],
  },
};
