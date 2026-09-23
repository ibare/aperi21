/**
 * longitudinal-wave 개념 선언.
 *
 * `transverse-wave` 의 짝. 두 조각이 「매질은 제자리, 무늬는 간다」 를 함께 보이므로
 * **주어를 갈랐다.**
 *   transverse-wave   주어 = 두 자취가 이루는 **각**. 주장 = 직각이다
 *   longitudinal-wave 주어 = **몰림**. 주장 = 아무도 그리지 않은 빽빽한 띠가 점의 앞뒤
 *                     흔들림에서 절로 생겨 앞으로 흘러간다
 * 이쪽만 압축 · 성김 · 몰림 · 소리 어휘를 갖는다. 각 · 수직 · 자취는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 저절로 일어나는 것을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const longitudinalWaveConcept: Aperi21ConceptSource = {
  id: 'longitudinal-wave',
  label: 'Longitudinal Wave — Crowding That Travels',
  canonicalSim: 'aperi21:longitudinal-wave',

  surface: {
    definition:
      'A wave whose medium sways back and forth along the very line it advances on, so that bands of crowded and thinned particles form of their own accord and drift forward.',
    exemplarKeywords: [
      'longitudinal wave',
      'compression and rarefaction',
      'sound is a longitudinal wave',
      'particles vibrate along the direction of travel',
      'air being squeezed and stretched',
      'crowded and spread out regions moving along',
      'what actually moves in a sound wave',
      'a pressure wave in air',
      'a slinky pushed back and forth',
      'P waves in an earthquake',
    ],
  },

  briefing: {
    observable: [
      'A wide field of scattered dots stands for the air. Each dot sways left and right about its own resting place and its height never changes at all.',
      'Out of that swaying alone, stripes of crowded dots appear with thinned stretches between them, and the stripes drift steadily to the right — nobody drew a stripe, and the dots are the only thing moving.',
      'Three of the dots are picked out in colour, and behind each of them lies a short segment marking the full reach of its sway. Stripe after stripe passes, and those dots never once leave their segments.',
      'A strip runs below the field, shaded by how crowded the dots directly above it are at this instant, and its dark places move to the right in step with the crowded stripes.',
      'Because the strip is counted from the very dots above it, the dark places and the crowded places cannot disagree — the strip is a second reading of the same thing rather than a separate drawing.',
      'A short line names what the strip shows, so that its dark places are not taken for a shadow of the dots.',
      'Three crowded stripes are in view at once, so the repeating of the pattern is seen rather than inferred from one band.',
      'The middle of a crowded stripe is strongly shaded while the gentler crowding around it comes out faint, so the strip reads more as a few dark bars than as a smooth swell.',
      'Nothing is measured — no wavelength, no speed, no pressure value, and no graph of displacement against place.',
    ],

    screen: {
      affordances: [
        'The field sways and the stripes travel by themselves, over and over; nothing has to be pressed and nothing can be set.',
        'The dots are scattered irregularly rather than ruled into a grid, so that the stripes that appear are crowding and not an artefact of a regular pattern.',
        'The sway is kept just short of the point where a dot would overtake its neighbour, which is what makes the crowded places about three times as dense as the average and the thin places about half.',
        'One colour is spent on the three followed dots alone — the crowded stripes are given no marker of their own, so the colour keeps a single meaning.',
        'One line of text says what is happening and never changes, because there is no setting it could disagree with.',
      ],
    },

    useWhen: [
      'The article has said that in this kind of wave the particles move along the direction of travel, and the reader cannot picture what would then be seen to move. Stripes of crowding emerging from the swaying and drifting forward is exactly the missing picture.',
      'The reader suspects that the air is being blown along — that the crowded band is a parcel of moving air. A coloured dot that never leaves its short segment while stripe after stripe goes past is what settles it.',
      'A companion is needed for the other kind of wave, and the article is setting the two side by side by the direction of the medium’s motion.',
    ],

    avoidWhen: [
      'The medium in the article moves across the line of travel. Everything here sways along it, and the crowding that is the whole point cannot arise the other way.',
      'The article wants this wave redrawn as a curve — displacement plotted against place, or a graph of pressure. Nothing here is plotted; the reading is the crowding itself.',
      'The subject is how fast sound goes, or how that differs between air, water and steel. There is one medium here and it never changes.',
      'Wavelength, frequency or amplitude values are being compared. No quantity is written anywhere.',
      'The article is about two waves overlapping or about a pattern that stands still. One wave runs through this field and its stripes never stop moving.',
    ],

    contrastWith: [
      {
        concept: 'transverse-wave',
        note: 'The two sort waves by one question — does the medium move across the travel or along it — and give the opposite answers, which is why they read as a pair rather than as a repetition.',
      },
      {
        concept: 'wave-vs-particle-transport',
        note: 'Both have a medium that goes nowhere, but one uses that to say what a travelling wave is made of, and the other uses it to say what a wave hands over at the far end.',
      },
      {
        concept: 'wave-basics',
        note: 'One shows a kind of wave whose shape is crowding rather than a curve; the other measures a wave’s length and period, which a crowding pattern has too but which this one never puts a number on.',
      },
      {
        concept: 'gas-pressure',
        note: 'Both fill the picture with particles of a gas, moving in quite different ways — one has them swaying in step about fixed places so that a pattern emerges, the other has them flying at random so that no pattern ever does.',
      },
    ],
  },
};
