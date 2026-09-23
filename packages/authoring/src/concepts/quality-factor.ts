/**
 * quality-factor 개념 선언.
 *
 * 흔들어 주는 진동 셋 중 **「한 성질을 두 곳에서 잰다」** 를 맡는다.
 *   quality-factor      좁은 봉우리와 긴 울림이 **같은 하나**다 — 한쪽이 크면 다른 쪽도 크다
 *   resonance           **여럿 중 맞는 하나만** 쌓인다
 *   driven-oscillation  한 진동자의 **박자와 방향**
 *
 * 이쪽만 「좁다 · 날카롭다 · 멈춘 뒤에도 울린다 · 같은 성질의 두 얼굴」 어휘를 갖는다.
 * 「쌓인다 · 고른다 · 치솟는다」(resonance)와 위상 어휘(driven-oscillation)는 쓰지 않는다.
 * 화면이 두 진동자의 봉우리 **높이**를 맞춰 두었으므로 definition 도 높이를 주장하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const qualityFactorConcept: Aperi21ConceptSource = {
  id: 'quality-factor',
  label: 'Quality Factor',
  canonicalSim: 'aperi21:quality-factor',

  surface: {
    definition:
      'The one property of an oscillator that shows up twice over: as how narrow the band of driving frequencies it answers to is, and as how many swings it keeps going for once the driving is taken away.',
    exemplarKeywords: [
      'quality factor',
      'Q factor',
      'sharpness of a resonance',
      'how long does it ring after you stop driving it',
      'bandwidth of a resonant response',
      'half-power width of a resonance curve',
      'a tuning fork that rings for ages',
      'lightly damped versus heavily damped response curve',
      'narrow response and slow decay are the same thing',
      'ringdown time',
      'how selective a tuned system is',
      'damping and sharpness traded against each other',
    ],
  },

  briefing: {
    observable: [
      'Two lanes, one above the other, hold the same arrangement: a response curve on the left, a spring with a mass hanging from it in the middle, and a chart on the right that writes down where that mass is as time goes by. A label on each lane names its quality factor, one small and one four times larger.',
      'A marker travels across the response curves from low frequency to high, drawing both curves as it goes and swinging both masses by the amount the curve is at. The upper curve is a broad hill; the lower one lifts only close to one frequency, where a tick on the axis is drawn.',
      'When the marker crosses the points where a curve has fallen to a set fraction of its top, a bar in the accent colour appears across the curve at that height, measuring the width of the hill. The upper bar is about four times the lower one.',
      'The marker then settles at the marked frequency and both masses swing by the same amount — the two curves have been drawn to the same height on purpose, so what is left to compare is width and not height.',
      'While that lasts, both charts on the right write identical waves.',
      'The driving is then taken away: the marker disappears from the curves and an upright dotted line with a label goes up in both charts at the moment it stopped.',
      'After that line the upper chart flattens out within two or three waves while the lower chart goes on rippling across almost the whole width.',
      'As each lane’s ripple drops to a small fraction of what it was, a second bar in the accent colour appears under that chart measuring how long it lasted. The lower bar is about four times the upper one.',
      'Four bars are left standing at the end: for the wide hill the short ringing, and for the narrow hill the long ringing — the two comparisons run opposite ways.',
    ],

    screen: {
      affordances: [
        'The sweep, the driving, the cutting off and the two measurements run in order on their own and then begin again, already partway through the sweep when the reader arrives.',
        'Nothing is offered to set — both lanes are fixed, so the picture is always this one comparison and never a value the reader has chosen badly.',
        'The accent colour is used for one thing only, the bars that measure, which is what makes the four of them read as one set of measurements rather than four decorations.',
        'The masses, curves and charts of both lanes are drawn in the same ink and the same size, so the only difference on show is how the two respond.',
        'The only text in the picture is the two lane names, the axis names and the mark on the frequency axis — no widths, no times and no ratios are written out.',
      ],
    },

    useWhen: [
      'The article has given the reader two separate facts — that a good resonator answers only a narrow band, and that it rings on for a long time — and the job is to show they are one fact. Two pairs of measuring bars running opposite ways is what joins them.',
      'The reader is to be shown what damping costs and buys, and a case is wanted where the two oscillators differ in nothing except that.',
    ],

    avoidWhen: [
      'The article is about how large a response gets when it is tuned in. The two response curves have been drawn to the same height here, so heights carry no comparison.',
      'The subject is which of many bodies answers a shared shaking. There are only two oscillators here and each gets its own driving.',
      'What matters is whether the body moves with or against what drives it. Nothing about the timing between them is drawn.',
      'Values are needed — a quality factor worked out from a width, a number of cycles, a decay time. Only the two lane names carry a figure.',
      'The point is a mass set going once and left alone. Here the motion is built up by driving first and only then let go.',
    ],

    contrastWith: [
      {
        concept: 'resonance',
        note: 'One says the agreement between driving and a body’s own rhythm is what picks that body out; the other says how close that agreement has to be, and that the answer is also how long the body carries on once the driving ends.',
      },
      {
        concept: 'driven-oscillation',
        note: 'One is about how choosy and how persistent a driven body is; the other is about the tempo and the direction of its motion while the driving lasts.',
      },
      {
        concept: 'drag-force',
        note: 'Both turn on resistance, but one treats it as a number attached to an oscillator that fixes how narrow and how long-lived its response is, while the other is about the force itself and how it grows with speed.',
      },
    ],
  },
};
