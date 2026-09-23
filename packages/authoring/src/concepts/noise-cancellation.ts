/**
 * noise-cancellation 개념 선언.
 *
 * 「소음을 어떻게 없애는가」 둘 가운데 하나. **없애는 방식**으로 갈랐다.
 *   noise-cancellation        **더해서** 지운다 — 뒤집은 복사본을 함께 내보내 합을 평평하게
 *   digital-vs-analog-signal  **버려서** 지운다 — 문턱으로 두 준위를 다시 판정해 잡음을 떨군다
 * 이쪽만 「뒤집는다 · 거꾸로 된 복사본 · 늦으면 남는다」 어휘를 갖고, 저쪽만 「중계 · 문턱 ·
 * 되살아난다」 를 갖는다.
 *
 * 두 사인의 위상차를 손잡이로 미는 화면과도 겹치기 쉬운 자리다. 여기서 움직이는 것은
 * **뒤집기와 늦음** 둘뿐이고 소음은 사인 하나가 아니라 불규칙하다 — 그 사실을 definition ·
 * avoidWhen 에 넣어 화면에 있는 것으로만 갈랐다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const noiseCancellationConcept: Aperi21ConceptSource = {
  id: 'noise-cancellation',
  label: 'Cancelling an Irregular Noise with Its Inverse',
  canonicalSim: 'aperi21:noise-cancellation',

  surface: {
    definition:
      'Silencing an irregular sound by adding a copy of it turned upside down, the two summing to almost nothing, with whatever part arrives out of step left uncancelled.',
    exemplarKeywords: [
      'active noise cancellation',
      'noise cancelling headphones',
      'anti-noise',
      'playing sound to make silence',
      'an upside-down copy of the noise',
      'how do headphones cancel engine rumble',
      'why do they work better on low steady noise than on speech',
      'the microphone hears it and the speaker undoes it',
      'residual hiss that never goes away',
      'adding two sounds to get quiet',
      'cancelling a waveform by inverting it',
    ],
  },

  briefing: {
    observable: [
      'Three waveforms run rightward one above the other, named outside noise picked up by the microphone, the flipped copy sent to the speaker, and what reaches the ear.',
      'The noise is plainly irregular — crests of several different sizes and spacings, none of it repeating like a single tone.',
      'At first the speaker row is only a faint copy and the bottom row is the same shape as the top one, crest for crest.',
      'That faint copy then folds over its centre line and comes out mirrored, with a trough standing everywhere the noise had a crest.',
      'As the copy is played it darkens, and the bottom row sinks toward its centre line until it lies almost flat.',
      'The shape the noise had is left behind in the bottom row as a thin dotted trace, so a flat line reads as something erased rather than as a quiet that was always there.',
      'The flipped copy is then pushed back so that it no longer sits directly under the noise, and small rapid wiggles reappear in the bottom row while the two upper rows go on swinging as widely as before.',
      'What comes back is the short, closely spaced part of the noise rather than the long slow part — the same delay throws the fine ripples further out of step than the broad ones.',
      'The speaker is switched off, the bottom row rises back to the full noise, and the round begins again.',
      'No decibel, no delay in milliseconds and no measure of how much quieter it got appears anywhere, and no headphone, ear or speaker is drawn.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round runs about seventeen seconds and repeats.',
        'The screen opens with the noise already flowing, shortly before the flipping starts.',
        'The flipping is shown as a fold that takes time rather than as one shape swapped for another, so turning it upside down is watched happening.',
        'The copy is faint while the speaker is off and darkens as it is turned on, and it only counts toward the bottom row once it is dark — one appearance covers both facts.',
        'All three rows are drawn in the same colour and weight; what separates them is their row, their name and their shape.',
        'Nothing is played aloud; the whole argument is made in the shapes.',
      ],
    },

    useWhen: [
      'The article has said that headphones cancel noise by adding more sound and the reader finds that self-contradictory. Three rows with the sum on the bottom make the addition itself visible, and the dotted trace keeps the flat line from reading as mere quiet.',
      'The point being made is why cancelling is never perfect — why a hum goes and a voice does not — and the delayed copy leaving fine ripples behind while the broad swings vanish is that argument in one picture.',
      'The reader needs to see that what has to be produced is a copy of this particular noise rather than any old opposing sound, and the irregular shape is what makes the copying the hard part.',
    ],

    avoidWhen: [
      'The article is about blocking sound rather than cancelling it — earplugs, thick walls, absorbing foam. Nothing here obstructs anything; the quiet is made by adding.',
      'The subject is two steady tones of slightly different pitch and a loudness that swells and dies. The two waveforms here are the same shape, never two different rates.',
      'The article slides one of two identical sine waves along by a phase and watches the sum run from doubled to nothing. The waveform here is irregular on purpose, nothing is shifted by a fraction of a cycle, and the only two states shown are flipped and flipped-but-late.',
      'A figure is needed for how much quieter it got, or the delay in numbers. Nothing on this screen is measured.',
      'The point is which frequencies a real system can and cannot reach, or how the electronics predict the noise. What is shown is the waveform arithmetic alone.',
    ],

    contrastWith: [
      {
        concept: 'digital-vs-analog-signal',
        note: 'Two opposite ways of getting rid of noise that has already arrived: one adds something chosen to annul it, the other keeps nothing but a decision and lets the noise fall away with the rest.',
      },
      {
        concept: 'beats-in-oscillation',
        note: 'Both are two waves added together with the sum as the thing to watch. One has a sum that swells and dies over and over because the two rates differ; the other has a sum meant to stay at nothing, and what spoils it is timing rather than rate.',
      },
      {
        concept: 'constructive-destructive',
        note: 'One varies how far out of step two identical waves are and finds their sum taking every size between twice over and nothing; the other aims at that nothing deliberately, and its difficulty is holding the timing for a sound that is not one steady wave.',
      },
      {
        concept: 'superposition',
        note: 'One establishes that two waves add where they meet and each carries on unchanged; the other puts that adding to work to leave silence, which is not either sound being destroyed — what is annulled is the sum at one place.',
      },
    ],
  },
};
