/**
 * sound-intensity 개념 선언.
 *
 * 역제곱을 다루는 이웃이 둘 이미 선언되어 있다 — `inverse-square-law`(구껍질 위
 * 알갱이 세기) · `apparent-brightness`(별 하나의 어두워짐). **주장을 갈랐다.**
 *   sound-intensity      주어 = **같은 감쇠를 읽는 두 눈금**. 주장 = 세기는 1/4 · 1/16 로
 *                        꺼지는데 세기 준위(dB)는 80 → 74 → 68 로 조금만 낮아진다
 *   inverse-square-law   주어 = 넓어지는 구껍질. 주장 = 알갱이 수는 그대로인데 넓이가 는다
 *   apparent-brightness  주어 = 한 별. 주장 = 멀수록 네 조각 · 아홉 조각에 나뉜다
 *   magnitude-scale      주어 = 별 등급의 눈금. 주장 = 한 칸이 곱하기 한 번이다
 *
 * 이쪽만 「소리 · 귀 · 데시벨 · 두 막대가 갈라진다」 어휘를 갖는다. 구껍질 · 조각 ·
 * 창 · 알갱이 세기는 쓰지 않고, 별 · 등급도 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const soundIntensityConcept: Aperi21ConceptSource = {
  id: 'sound-intensity',
  label: 'Intensity Falls Fourfold While the Sound Level Dips Six Decibels',
  canonicalSim: 'aperi21:sound-intensity',

  surface: {
    definition:
      'The same weakening of a sound read on two scales at once: at twice the range the intensity is down to a quarter, while the sound level in decibels has fallen by only a few.',
    exemplarKeywords: [
      'sound intensity and distance',
      'why does moving twice as far away barely quieten a sound',
      'intensity falls as one over distance squared',
      'six decibels per doubling of distance',
      'decibels against intensity',
      'how much quieter is twice as far',
      'sound level and sound intensity',
      'sound spreading out and growing faint',
      'why sound level is given in decibels',
      'eighty decibels to seventy four',
    ],
  },

  briefing: {
    observable: [
      'A source sits at the left of a band and sends rings outward through it at a steady beat. Each ring is drawn fainter the wider it has grown, so the far part of the band is nearly bare while the near part is dense.',
      'A listener stands at a marked place a certain way along, and two further places are marked at twice and four times that distance, named by those multiples.',
      'Beneath the listener stand two bars side by side. One is the intensity at that place and the other is the sound level there in decibels, and at the first place the two are set to exactly the same height — which is what makes what happens afterwards a comparison.',
      'The listener steps back to the second place and then to the third, pausing at each. While stepping, the pair of bars travels along underneath with no figures on it, the intensity bar dropping fast and the sound-level bar barely settling.',
      'At each place where it pauses, a pair of bars is left standing there with its figures written: the intensity as a fraction of the first, the sound level in decibels.',
      'By the end three pairs stand in a row. The intensity bars read one, a quarter and a sixteenth, the last two flattened almost onto the floor; the sound-level bars read eighty, seventy-four and sixty-eight decibels and are nearly a level row.',
      'The rings passing the furthest place are so faint as to be barely visible, which is the same fact the short intensity bar is reporting.',
      'The sound-level bars are measured up from the floor of the panel, the floor standing for zero decibels, the reference level near the faintest sound that can be heard.',
      'The two kinds of bar are told apart by the names written under the first pair and by the form their figures take — a fraction against a figure with a unit.',
      'A line of text below names the multiple of distance, the fraction the intensity has fallen to, and the two decibel figures being compared.',
    ],

    screen: {
      affordances: [
        'The listener steps back and returns by itself in a round; nothing is pressed. The stopping places are fixed so that the figures written are exact rather than rounded.',
        'The pair of bars that travels with the listener carries no figures, since between the marked places the values would have to be rounded to be written at all; only its heights move.',
        'The pairs left behind at each place stay on view, so three pairs are compared inside one picture rather than against a memory of an earlier one.',
        'The two bars are deliberately started at one height at the nearest place, which turns the whole of the rest into a picture of two scales parting company.',
        'The accent colour is kept for one meaning — the strength of the sound — and is used for both the rings and the intensity bars, so a ring growing faint and its bar shrinking read as the same thing.',
        'The rings are kept inside the band and not allowed across the bar panel, so the heights stay readable.',
        'No expression, no logarithm and no decibel definition is written; the ladder is carried by three figures on three bars.',
        'The beat of the rings and the speed they spread at are chosen so that the fading is smooth to look at, not to stand for any real sound.',
        'On arriving, the rings already fill the band and the listener is already at the nearest place.',
      ],
    },

    useWhen: [
      'The article has stated that intensity goes as the inverse square and also that doubling the distance costs six decibels, and the reader is holding the two as unrelated rules. Two bars starting level and parting company is what makes them one fact told twice.',
      'The point being made is that the decibel scale is logarithmic — each halving of intensity takes off the same three decibels — and a case is wanted where the fall in intensity and the fall in decibels are drawn from the same height on the same picture.',
      'The reader is puzzled that a sound whose intensity has fallen to a sixteenth still reads sixty-eight decibels against eighty, and needs to see the two scales side by side.',
    ],

    avoidWhen: [
      'The article is about why the falling-off goes as the square — about a quantity spread over a growing surface. Nothing here is drawn as a surface, a patch or a count of grains; the fading of the rings simply reports the result.',
      'The subject is a star, its brightness with range, or a numbering of brightnesses. This is a sound and a listener.',
      'The decibel scale is to be defined, or a value worked out from a reference. No reference level and no output are written; what is on view are three places and their figures.',
      'The article is about a sound weakening for some other reason — absorbed along the way, blocked, damped. Nothing here takes anything out of the sound; it only spreads.',
      'The point turns on the pitch of a sound, on a moving source, or on two sounds together. One unchanging source stands still throughout.',
      'The reader is to be shown the sound level at ranges other than the three marked. Only those three are stopped at and only they carry figures.',
    ],

    contrastWith: [
      {
        concept: 'inverse-square-law',
        note: 'One takes the inverse-square fall as given and sets it against the decibel scale; the other asks why the fall goes as the square at all, by following a fixed amount over a growing surface.',
      },
      {
        concept: 'apparent-brightness',
        note: 'Both are one unchanging source weakening with range, but one keeps two scales side by side to show how differently the same fall reads, while the other divides the emission among equal patches to show where the fall comes from.',
      },
      {
        concept: 'magnitude-scale',
        note: 'Both are about a numbering in which even steps stand for equal multiplications, one for sound and one for starlight; one puts that numbering directly against the underlying quantity, the other lays out the ladder itself.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One has a sound weakening only because it is spread over more ground, with nothing taken out of it; the other has a motion weakening because something really is removed and turned into heat.',
      },
    ],
  },
};
