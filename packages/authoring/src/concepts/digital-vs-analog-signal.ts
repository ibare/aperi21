/**
 * digital-vs-analog-signal 개념 선언.
 *
 * 「소음을 어떻게 없애는가」 둘 가운데 하나. **없애는 방식**으로 갈랐다.
 *   noise-cancellation        **더해서** 지운다 — 뒤집은 복사본을 함께 내보낸다
 *   digital-vs-analog-signal  **버려서** 지운다 — 문턱으로 다시 판정해 잡음을 떨군다
 * 이쪽만 「중계 · 문턱 · 다시 판정 · 되살아난다 · 칸을 지날수록 쌓인다」 어휘를 갖는다.
 * 뒤집기 · 역위상 · 귀는 저쪽 몫이라 쓰지 않는다.
 *
 * 화면의 디지털 판정은 결코 틀리지 않는다(잡음을 문턱 여유보다 작게 선언했다) — 그 한계는
 * avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const digitalVsAnalogSignalConcept: Aperi21ConceptSource = {
  id: 'digital-vs-analog-signal',
  label: 'Amplifying a Signal Against Re-deciding It',
  canonicalSim: 'aperi21:digital-vs-analog-signal',

  surface: {
    definition:
      'The difference between amplifying a signal and re-deciding it: magnifying a noisy copy carries the noise onward, while choosing between two levels at a threshold throws it away.',
    exemplarKeywords: [
      'digital and analog signals',
      'why is digital better over long distances',
      'repeaters along a line',
      'noise builds up in analog transmission',
      'regenerating a signal',
      'a threshold decides nought or one',
      'copies of copies get worse',
      'two levels instead of a continuous voltage',
      'noise immunity of digital',
      'why does a digital recording not hiss',
      'the message arrives exactly as it was sent',
    ],
  },

  briefing: {
    observable: [
      'Two lanes run across the screen, named analog and digital, each made of five framed panels standing at the same horizontal positions: sent, three repeaters, and received.',
      'The upper lane carries a smooth continuous curve and the lower lane a staircase that only ever takes two heights; both are drawn in the same ink, so the lanes are told apart by their names and their shapes.',
      'Every panel holds two lines at once — a faint thin one showing what arrived, at about half the height it was sent at and with noise riding on it, and a thick one showing what the repeater sent onward.',
      'In each analog panel the thick line has exactly the same shape as the faint one, only larger, so the noise is plainly carried forward rather than removed.',
      'The analog curve is visibly rougher in each successive panel than in the one before, and roughest of all by the last.',
      'In each digital panel a dotted threshold line crosses the frame — already there before any signal arrives — and the thick staircase sits cleanly above and below it, the same shape in every panel as in the first.',
      'The signal enters one panel after another, sliding in from the left edge of each frame, and anything that would spill past a frame is cut off at its edge.',
      'At the end, what was originally sent is laid over the last panel of each lane as a dotted line: the analog curve wanders well off it, while the staircase lies exactly along it so that the dotted pattern appears to sit on top of the steps.',
      'The word threshold stands outside the last panel on the right rather than inside any of them.',
      'No voltage scale, no axis, no count of errors and no nought or one is written on the steps; the heights of the steps are the only thing saying what was sent.',
      'A line of text says in turn that the same line carries a continuous voltage and a two-level signal, that every stretch weakens the signal and adds noise while one repeater amplifies that noise and the other re-decides at a threshold, and that at the far end one has drifted off what was sent while the other still sits on it.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about twelve seconds and repeats.',
        'The screen opens with the signal already partway through the first stretch.',
        'Both lanes are fed noise from the same source along the same stretches, so a difference between them cannot be put down to one lane having had an easier journey.',
        'The threshold is drawn in all the digital panels from the start, because it belongs to the repeater rather than to the signal passing through it.',
        'The noise is held well below what would be needed to push a level across the threshold, so the staircase never comes out wrong here.',
        'The comparison is between shapes — a rough curve against a clean staircase — with no numbers to read instead.',
      ],
    },

    useWhen: [
      'The article has said that digital signals survive long journeys and the reader assumes it is because they are somehow stronger. The faint arriving line being identical in both lanes, with the difference lying entirely in what the repeater does next, puts the cause where it belongs.',
      'The point is that rounding to one of two levels is not a loss but the whole trick — that discarding everything except a decision is what leaves nothing for the noise to ride on — and the panel where the staircase comes out identical to the one before it is that argument.',
      'The reader needs to see noise as something cumulative, growing panel by panel rather than appearing at the end, and the analog lane getting rougher at every hop is that accumulation drawn.',
    ],

    avoidWhen: [
      'The subject is how a continuous sound is turned into numbers in the first place — sampling rate, bit depth, what gets lost in the conversion. Both signals here start out already in their form and nothing is converted.',
      'The point is that digital fails too once the noise is large enough, or the article is about error rates and correction. The noise here is kept small enough that the decision is never wrong.',
      'The article is about bandwidth, data rate, or how much can be sent per second. Nothing here is counted or timed.',
      'The subject is a signal simply getting weaker with distance. Weakening is present in both lanes equally and is not what separates them.',
      'The article turns on unwanted sound being cancelled by something added to it. Nothing is added here; the noise leaves by being ignored.',
      'The medium matters to the argument — a copper line, a fibre, a radio link. The line is drawn as a bare lane and never named.',
    ],

    contrastWith: [
      {
        concept: 'noise-cancellation',
        note: 'Two opposite ways of ridding a message of noise that has already arrived: one adds something chosen to annul it, the other keeps nothing but a decision and lets the noise fall away with everything else.',
      },
      {
        concept: 'wave-attenuation',
        note: 'One takes weakening along the way as the given condition and asks what a repeater should do about it; the other makes the weakening itself the subject and asks what law it follows.',
      },
    ],
  },
};
