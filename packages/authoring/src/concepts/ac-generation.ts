/**
 * ac-generation 개념 선언.
 *
 * 교류 넷 가운데 이쪽만 **「사인파가 어디서 오는가」** 를 맡는다 — 회로의 응답이 아니라 파형의 출처다.
 *   ac-generation          도는 **자세**와 파형의 짝, 빨리 돌리면 **높고 촘촘**
 *   reactance 같은 전압에서 **얼마나 흐르는가** (진동수에 따라)
 *   phase-in-ac-circuit     전압과 전류의 마루가 **언제** 오는가
 *   series-rlc-resonance    두 막음이 **지워지는** 진동수에서 전류가 솟는다
 * 이쪽만 「돌린다 · 코일 자세 · 마루와 0 의 짝」 어휘를 갖는다. 소자 · 임피던스 · 위상차는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const acGenerationConcept: Aperi21ConceptSource = {
  id: 'ac-generation',
  label: 'Alternating Voltage from a Turning Coil',
  canonicalSim: 'aperi21:ac-generation',

  surface: {
    definition:
      'Turning a coil steadily in a magnetic field gives an output that traces a sine wave, peaking when the coil lies along the field and passing through zero when it stands across it, and turning faster makes the peaks both taller and closer together.',
    exemplarKeywords: [
      'how alternating current is generated',
      'a coil rotating in a magnetic field',
      'why mains electricity is a sine wave',
      'where does AC come from',
      'output voltage against the angle of the coil',
      'the output reverses twice every turn',
      'turning the coil faster raises the output',
      'sinusoidal output of a rotating loop',
      'which coil position gives the largest output',
      'alternating voltage waveform',
      'rotation turned into an oscillating output',
    ],
  },

  briefing: {
    observable: [
      'Seen end-on down its axle, the coil is a single line spinning between two pole pieces lettered on either side, with one of its ends carrying a small dot so that a half turn can be told from a whole one.',
      'To the right a pen lays down a curve on a recording strip as the coil turns, and the curve comes out as a smooth rise and fall rather than anything with corners.',
      'Every quarter turn a small pictogram of the coil at that instant is stamped into a row beneath the strip and joined up to the curve by a dotted line to the point at the same moment.',
      'Every upright pictogram — the coil standing across the field — lands where the curve crosses its axis, and every flat one lands on a peak or a trough, over and over down the row rather than once.',
      'The marked end of the flat pictograms is on one side at the peaks and the other side at the troughs, which is how the two extremes are told apart at all.',
      'The coil is then spun faster: the first run stays behind as a fainter dotted curve, and the new one rises to about twice the height while fitting about twice as many rises and falls into the same width of strip.',
      'The row of pictograms is restamped twice as tightly under the faster run, so the pairing of coil position with peak and with zero survives the change of speed unaltered.',
      'At the end the pen lifts and the two curves are left side by side for comparison while the coil keeps turning, each curve carrying a small mark naming its rate rather than any measured value.',
      'The strip carries no gradations and the screen no volts, amps or seconds — only the letters on the poles, the names of the two axes and the two rate marks.',
    ],

    screen: {
      affordances: [
        'Nothing is offered to spin or adjust; the slow run, the fast run and the side-by-side comparison follow one another and begin again, and the reader arrives a second or so into the slow run with the first peak already laid down.',
        'The two runs are told apart by line style and by their rate marks rather than by colour, and the accent colour is reserved for whichever curve is being written at that moment.',
        'The faster run is given the same width of strip and the same stretch of time as the slower one, which is what allows closer-together to be read off as a count within one width.',
        'No lines are drawn from the spinning coil to the pen; the pairing is left standing in the stamped row instead, so it can be seen repeating rather than caught once and lost.',
        'The field is shown only as quiet background lines giving its direction, with no flux shading and no line drawn along the coil’s face, so nothing competes with the pairing of position and waveform.',
      ],
    },

    useWhen: [
      'The article has asserted that a rotating coil produces a sine wave and the reader would accept it only as an assertion. The stamped row makes the pairing of coil position with peak and zero repeat across the strip, so the shape is read off the rotation rather than taken on trust.',
      'The prose needs the reader to see that both the height and the spacing of the output follow from one thing, the rate of turning, and a side-by-side of two rates on one strip is what settles it.',
      'A piece is explaining why the supply reverses direction at all, and a picture is wanted in which the reversal is visibly the coil coming round the other way rather than a switch somewhere.',
    ],

    avoidWhen: [
      'The subject is what the output then does in a circuit — how much current flows, what opposes it, or how voltage and current sit relative to one another. Nothing is connected to this coil.',
      'The article is about flux, about how much of the field the coil catches, or about the law relating the output to the rate of change of that catch. No flux is drawn and no area is shaded.',
      'The point is the work the hand must do, the lamp that lights, or the conversion of motion into useful power. There is no handle, no load and no circuit here.',
      'What is wanted is a number of volts, a frequency in hertz, or the relation between peak and average. The strip has no gradations and the two runs are named only as one rate and its multiple.',
      'The article turns on how the output is carried away — rings, brushes, or the difference between an alternating and a one-way output. Nothing at the axle is drawn.',
    ],

    contrastWith: [
      {
        concept: 'reactance',
        note: 'One is about where an alternating output comes from and what its shape answers to; the other takes such a supply as given and asks how much current it drives through different parts.',
      },
      {
        concept: 'phase-in-ac-circuit',
        note: 'One pairs a peak with a position of the coil that makes it; the other pairs a peak with another peak in the same circuit and asks only which of the two arrives first.',
      },
      {
        concept: 'transformer',
        note: 'Both hang on a flux that keeps changing, but one makes the changing flux by turning a coil in a fixed field, while the other starts from an already alternating supply and only changes the size of the swing.',
      },
      {
        concept: 'motor',
        note: 'The same coil between the same poles, run the two ways round: here turning it is what produces the output, there feeding it is what produces the turning.',
      },
    ],
  },
};
