/**
 * sound-source-vibration 개념 선언.
 *
 * 소리 둘 가운데 **출처**를 맡는다. 형제와는 묻는 자리가 다르다.
 *   sound-source-vibration   주어 = **내는 쪽**. 주장 = 떨리는 동안에만 새 소리가 나오고, 멈추면 끊긴다
 *   sound-through-materials  주어 = **지나는 쪽**. 주장 = 무엇을 지나느냐가 빠르기와 건너감을 정한다
 * 이쪽만 「떨림 · 멎는다 · 새 고리가 끊긴다 · 이미 떠난 소리」 어휘를 갖는다. 알갱이 · 매질 ·
 * 빠르기 수치는 저쪽에 남긴다. 고리가 멀어지며 옅어지지 않는다는 것도 화면 그대로다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const soundSourceVibrationConcept: Aperi21ConceptSource = {
  id: 'sound-source-vibration',
  label: 'Sound Lasts Only While the Source Shakes',
  canonicalSim: 'aperi21:sound-source-vibration',

  surface: {
    definition:
      'The tie between a sounding object and its shaking: new sound leaves it only while it vibrates, and holding the object still ends the sound at once.',
    exemplarKeywords: [
      'sound and vibration',
      'what makes a sound',
      'a tuning fork vibrates when it sounds',
      'touch the fork and the sound stops',
      'sounding things are shaking',
      'where does sound come from',
      'stop the vibration and you stop the sound',
      'holding a bell silences it',
      'a struck object goes on ringing',
      'sound is made by something moving back and forth',
      'feel the speaker buzzing when it plays',
    ],
  },

  briefing: {
    observable: [
      'A tuning fork stands on its base on a table, and a mallet swings in and strikes it.',
      'From the moment of the strike the two prongs bow outward and inward, with a pale line beside each marking the two ends of its travel, so the prong reads as going back and forth rather than as merely bent.',
      'Every single shake of the prongs sends one ring out from the fork, and the rings are complete circles spreading in every direction at a steady pace, evenly spaced, several of them across the screen at once.',
      'How dark a ring is says how big the shake was when it left, so the pattern of rings is a record of the shaking rather than a decoration around it.',
      'A hand comes down and closes over the prongs; the bowing shrinks to nothing, the pale travel lines close up and disappear, and the one ring that left while the grip was taking hold is faint.',
      'After that no ring appears at all, while the rings already away keep moving outward at the same pace — so an empty circle opens out around the fork and grows.',
      'Eventually the last ring leaves the screen and the space around the fork is bare, with the hand still holding on.',
      'The rings never dim as they travel; the only thing that changes their darkness is how hard the fork was shaking when each one left.',
      'The mallet returns, the prongs shake again and the rings come back together in the same instant; before the strike the surroundings are empty.',
      'The hand carries the word Hand beside it; nothing else is named and no frequency, speed or distance is written.',
      'A line of text says in turn that the mallet strikes the fork, that each shake sends sound spreading out all around while it vibrates, that the hand grips and the vibration stops, and that no new sound comes out while what already left keeps moving away.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one round of strike, ring, grip and silence runs about nine and a half seconds and repeats.',
        'The screen opens with the fork already ringing and rings filling the space around it.',
        'The shaking is slowed and made far larger than a real fork’s, so that one shake and one ring can be seen to belong together.',
        'The rings are cut off at the table so that they never cross the line of text.',
        'There is no button for the grip, which is why the sentence beneath can say what is happening and stay true.',
      ],
    },

    useWhen: [
      'The article is teaching that everything making a sound is shaking and the reader has only been told so. The grip turns it into a test: stop the one thing and see whether the other stops with it.',
      'The point is that a source has to keep working for sound to keep being made, and that what has already left carries on regardless. The growing empty circle around a silenced fork says both at once and separates them.',
      'The reader is young and the article needs the plainest possible picture of sound leaving an object in all directions, without air particles or graphs.',
    ],

    avoidWhen: [
      'The article is about what sets a note’s pitch, or about high and low sounds. The fork shakes at one rate here and nothing compares two.',
      'The subject is air being squeezed and stretched, or particles moving back and forth as the sound passes. The sound is drawn only as spreading rings, with no medium shown.',
      'The article turns on what the sound is travelling through, or on it needing a material at all. Nothing here distinguishes what surrounds the fork.',
      'The point is sound getting fainter the further away you are. The rings hold their darkness the whole way out.',
      'The subject is a second object taking up the shaking on its own, or a body picking out one rate from many. One fork is struck and one hand stops it.',
      'The article deals with how loud or how long a struck object rings, or with the sound dying away by itself. The shaking here is ended by a hand rather than left to fade.',
    ],

    contrastWith: [
      {
        concept: 'sound-through-materials',
        note: 'The two halves of the same journey: one is about what has to keep happening at the place sound is made, the other about what has to be present between there and the listener.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One takes a body going back and forth as a given and asks what leaves it while it does so; the other asks after the motion itself and what makes it trace the curve it does.',
      },
    ],
  },
};
