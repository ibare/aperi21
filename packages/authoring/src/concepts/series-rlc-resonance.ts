/**
 * series-rlc-resonance 개념 선언.
 *
 * 교류 넷의 마지막이자, 이미 선언된 `resonance` 와 가장 위험하게 겹치는 자리다.
 * 갈랐다 — 이쪽의 주장은 **「두 막음이 서로를 지운다」** 이지 「여럿 중 누가 커지나」 가 아니다.
 *   series-rlc-resonance 한 고리 · 구동 진동수를 **쓸며** 두 막음이 같아지는 곳에서 **지워진다**
 *   resonance            같은 흔들림을 받는 **여럿 가운데 맞는 하나**가 쌓인다
 *   quality-factor       그 맞음이 **얼마나 좁아야** 하는가, 그리고 울림의 길이
 *   reactance 코일 · 축전기 **하나씩**의 진동수 반응 (섞지 않는다)
 *   phase-in-ac-circuit  같은 소자들의 **때**
 * 이쪽만 「상쇄 · 남은 몫 · 저항이 봉우리의 높이와 폭을 정한다」 어휘를 갖는다.
 * 화면에 Z 는 없다(전류 곡선이 1/Z 모양) — 간극 장부에 올렸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const seriesRlcResonanceConcept: Aperi21ConceptSource = {
  id: 'series-rlc-resonance',
  label: 'Reactances Cancelling in a Series Loop',
  canonicalSim: 'aperi21:series-rlc-resonance',

  surface: {
    definition:
      'Sweep the driving frequency of a loop holding a resistor, a coil and a capacitor and at the one frequency where the coil’s opposition and the capacitor’s come out equal they wipe each other out, leaving only the resistor and letting the current run highest.',
    exemplarKeywords: [
      'series RLC resonance',
      'resonant frequency of a circuit',
      'inductive and capacitive reactance cancelling each other',
      'the current is greatest when X L equals X C',
      'impedance falls to just the resistance at resonance',
      'one over two pi root LC',
      'tuning a radio to a station',
      'a lower resistance gives a taller narrower peak',
      'frequency response of a series circuit',
      'sweeping the supply frequency and watching the current',
      'why a circuit draws most current at one particular frequency',
    ],
  },

  briefing: {
    observable: [
      'A single loop on the left holds an alternating supply, a resistor, a coil and a capacitor, each with its rating written beside it.',
      'In the middle, two arms grow from one point on a baseline — the coil’s opposition upward, the capacitor’s downward, both to the same scale — and beside them in its own column stands a dashed arrow for whatever is left over when the two are set against each other.',
      'As the frequency climbs, the upward arm lengthens while the downward one shortens, and at one particular frequency the two arms are exactly equal and the dashed arrow is gone, leaving only its letter sitting on the baseline.',
      'Past that frequency the dashed arrow reappears, now pointing the other way, so the leftover changes sides rather than simply growing back.',
      'On the right a curve of current against frequency is being drawn only as far as the sweep has reached, with an accent-coloured point riding its leading end, and the curve rears up as the point passes the frequency where the arms matched.',
      'That frequency is the one marked on the horizontal axis, and the summit of the curve sits directly over the mark.',
      'The resistance is then reduced and the whole sweep repeated from the bottom: the first curve stays behind as a faint dotted outline and the new one climbs to more than twice the height over the very same mark, and is visibly narrower about it.',
      'At the end the two curves stand together — one low and broad, one tall and narrow, both peaking at the same place — each with its resistance written beside its own summit.',
      'The axis begins at zero rather than at the start of the sweep, so the narrowness of the peaks can be judged against the whole width; neither axis carries gradations and no ohms or amps are written.',
    ],

    screen: {
      affordances: [
        'Nothing is offered to sweep or to set; the two sweeps, the changeover of resistance and the final comparison follow one another and start again, and the reader arrives part way up the first climb with a little of the curve already drawn.',
        'Both curves are the same quantity and so share one colour, the earlier one stepping back by becoming a thinner dotted line rather than by changing hue, and they are told apart by the resistance written at each summit.',
        'The accent colour is kept for the present frequency alone, as the point at the end of the curve being drawn.',
        'The chain in the middle shows only the two oppositions and their leftover; the resistance is left as a figure on the circuit, because drawn to the same scale it would be a few specks beside the arms.',
        'The resistance written on the circuit changes at the boundary between the sweeps rather than drifting through intermediate values, so only the two chosen settings are ever shown.',
        'Neither the coil nor the capacitor changes anywhere in the run, so the peak stays over the same mark throughout and the only thing altering its shape is the resistance.',
      ],
    },

    useWhen: [
      'The article has stated that the current is largest at the resonant frequency and the reader has nothing to explain why. The two arms coming out equal and the leftover disappearing gives the cancellation an event on the screen instead of a line of algebra.',
      'The prose needs the resistance to be seen setting how sharp the response is without altering where it sits. Two sweeps over the same mark, one tall and narrow and one low and broad, is exactly that comparison.',
      'A piece is about selecting one frequency out of many with a circuit — tuning — and needs the mechanism of the selection, not merely the fact of it.',
    ],

    avoidWhen: [
      'The subject is many separate bodies given the same shaking, with only the matching one responding. There is a single loop here and the thing that changes is the driving frequency, not which object is listening.',
      'The article is about how long something rings on after the driving stops, or about a response dying away. The sweeping never stops and nothing here decays.',
      'The point is that current and voltage peak at different moments, or that the offset vanishes at resonance. No waveforms are drawn and no timing is shown.',
      'What is wanted is the behaviour of a coil or a capacitor on its own across frequency. Here they are in the same loop and are only ever seen set against one another.',
      'The article needs values — a frequency in hertz, a current in amps, an impedance in ohms, or a bandwidth. The resonant frequency carries a symbol and no number, and neither axis has gradations.',
      'The subject is an oscillation that was set going and then left alone. This loop is driven from outside throughout.',
    ],

    contrastWith: [
      {
        concept: 'reactance',
        note: 'One keeps a coil and a capacitor in separate circuits so that their opposite responses to frequency can be seen plainly; the other puts them in one loop, where being opposite is what allows them to cancel at a single frequency.',
      },
      {
        concept: 'phase-in-ac-circuit',
        note: 'The same three parts, but one reports the fixed interval between a voltage peak and a current peak in each of them separately, while the other sets their oppositions against each other and asks where the sum comes to nothing.',
      },
      {
        concept: 'resonance',
        note: 'Both name the frequency at which a response is greatest, but one is about many bodies under one shaking and which of them is picked out, while the other is one circuit swept across frequencies and the cancellation that makes a particular one special.',
      },
      {
        concept: 'quality-factor',
        note: 'One says why there is a peak and where it sits; the other takes the peak as given and treats how narrow it is as a property in its own right, tied to how long the thing keeps going once the driving stops.',
      },
      {
        concept: 'lc-oscillation',
        note: 'The same coil and capacitor exchanging the same quantity, but one has no resistance and nothing driving it, while the other is driven from outside and has a resistor that decides how sharply it answers.',
      },
    ],
  },
};
