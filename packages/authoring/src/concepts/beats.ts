/**
 * beats 개념 선언.
 *
 * 이미 선언된 `beats-in-oscillation`(회전과 진동)과 붙을 위험이 가장 크다. **주어와
 * 주장을 갈랐다.**
 *   beats                 주어 = 함께 울리는 **두 음의 합**. 주장 = 어느 음도 세지거나
 *                         약해지지 않는다 — 어긋난 만큼 **서로를 지워** 합이 사라진다
 *   beats-in-oscillation  주어 = 매달린 **두 진동자 한 쌍씩**. 주장 = 두 진동수가 가까울수록
 *                         부푸는 것이 **느리다** (차이와 빠르기가 짝)
 *
 * 이쪽만 「음 · 조율 · 들린다 · 지운다 · 사라진다 · 울렁임 한 번」 어휘를 갖는다.
 * 「차이가 작을수록 느리다」 를 머리 문장으로 쓰지 않는다 — 그쪽의 주장이다. 손으로
 * 차이를 바꾸는 것은 화면에 있으므로 조작으로만 적고, 구어에서도 기계 진동자 쪽 말
 * (rig · 매달린 · 용수철)은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const beatsConcept: Aperi21ConceptSource = {
  id: 'beats',
  label: 'Beats Between Two Tones as Mutual Cancellation',
  canonicalSim: 'aperi21:beats',

  surface: {
    definition:
      'Why two tones sounded together throb although neither of them ever alters: their steps slide out of register, and where they are exactly opposed each wipes the other out.',
    exemplarKeywords: [
      'beats between two tones',
      'tuning a guitar by listening for the throb',
      'a piano tuner counting the wavering',
      'two notes almost but not quite in tune',
      'why does the loudness pulse when two tones sound together',
      'neither note changes yet the sound wavers',
      'the sound goes silent for a moment and comes back',
      'two sounds cancelling each other',
      'wavering when two instruments are slightly off',
      'adding two sound waves of nearly the same pitch',
      'what you hear when two pitches are close',
    ],
  },

  briefing: {
    observable: [
      'A time window fills the picture, its right-hand edge being the present and everything flowing away to the left as it ages.',
      'The upper track carries two waves of the same height drawn in one and the same ink. When their steps agree they lie exactly on top of one another and read as a single line.',
      'As time goes on they separate, and the ground between the two curves is filled in as a band, so how far apart they have got is an area rather than something to be judged by eye.',
      'The lower track carries the one wave that is actually heard, the two added. It rises to twice the height of a single one where they agree and shrinks to a flat line where they are opposed.',
      'At the right-hand edge sit three small circles that are the present moment of the three waves: two of them, drawn alike, ride the two tones, and a third, in the accent colour, rides the sum.',
      'Where the sum flattens to nothing, a faint upright stroke is cut through the whole picture and left behind, so those instants stay on view as they travel leftward.',
      'Between two neighbouring strokes a measured span is drawn and named as one throb; when the strokes come close enough that the naming will not fit, the name drops out and the span is left as a bare measure.',
      'Neither of the two tones ever changes its height. What changes is only how far their steps have slid apart, and the band between them is the picture of that sliding.',
      'A line of text below says which of the states is on view — in register, exactly opposed, sliding apart, or coming back together.',
    ],

    screen: {
      affordances: [
        'One control, in the lower right, sets how far apart the two tones are. It runs from nothing up to a wide gap and moves continuously rather than clicking to set values.',
        'With the control at rest at the bottom the two tones are identical, the band between them closes to nothing, and the sum stays loud forever — the reader can make the throbbing stop altogether.',
        'Changing the gap does not restart anything: the older strokes stay on view while the new ones come in at a different spacing, so the widening or narrowing is compared inside the picture rather than against a memory.',
        'The two tones are drawn in the same ink and at the same height on purpose, so that agreeing means lying on top of one another and disagreeing is something that happens to them.',
        'The accent colour is kept for a single meaning — the sound actually heard — and marks both the summed wave and its present-moment circle.',
        'The band between the two tones is laid under their curves rather than over them, since it is the gap between the lines and not a thing covering them.',
        'The window arrives already full and already in progress: the picture on opening is the moment when the two agree and the sum is at its largest.',
        'No rates or times are written anywhere; what is read is the spacing of the strokes and the height of the summed wave.',
      ],
    },

    useWhen: [
      'The article has said that two close tones throb, and the reader has taken it as one of them growing louder and softer. The two upper waves never changing height while the lower one is wiped out is what corrects that.',
      'The point being made is that sounds can remove one another, and a case is wanted where the cancelling is total and repeated rather than argued for.',
      'The reader is to satisfy themselves that the gap is what does it, by closing the gap to nothing and finding the throbbing gone and the sound simply loud.',
    ],

    avoidWhen: [
      'The article is about two swinging bodies, pendulums or weights on springs, rather than about sound. Nothing mechanical is drawn here; the subject is a heard tone.',
      'The reader is to be shown that two gaps of different size throb at different rates by standing them side by side. One pair of tones is on view at a time, and the gap is altered rather than compared.',
      'The subject is one motion passing over to another body and back, or a tangled motion taken apart into the shapes a system can hold. Nothing crosses over and nothing is decomposed here.',
      'Values are wanted — the pitch of either tone, the throb rate in throbs per second, a time between strokes. No figure is written on the picture.',
      'The claim to be carried is that waves meeting in space leave a fixed pattern of loud and quiet places. Everything here happens at one place and varies with time.',
      'The article is about a moving source or listener altering a pitch. Nothing moves here; the two tones are simply sounded together.',
    ],

    contrastWith: [
      {
        concept: 'beats-in-oscillation',
        note: 'Both are two close rhythms added, but one is about what a listener hears from two tones and dwells on the instants where the sum is wiped out entirely, while the other compares two fixed gaps side by side to show that the smaller gap throbs the slower.',
      },
      {
        concept: 'standing-wave',
        note: 'Both are two waves added, but one adds two rates at a single place and gets loud and quiet moments, while the other adds two directions along a line and gets loud and quiet places that stay put.',
      },
      {
        concept: 'coupled-oscillators',
        note: 'One adds two independent tones that never affect each other; the other joins two bodies so that a swing crosses from one to the other and back.',
      },
      {
        concept: 'doppler-effect',
        note: 'One has two fixed tones whose sliding apart is the whole story; the other has one tone whose pitch is altered by the source travelling.',
      },
    ],
  },
};
