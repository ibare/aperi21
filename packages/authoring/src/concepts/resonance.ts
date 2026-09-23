/**
 * resonance 개념 선언.
 *
 * 흔들어 주는 진동 셋 중 **「여럿 중 누가 커지는가」** 를 맡는다.
 *   resonance           같은 흔들림을 똑같이 받는 여럿 가운데 **맞는 하나만** 주기마다 쌓인다
 *   driven-oscillation  한 진동자가 **어떤 박자로 · 어느 쪽으로** 움직이는가
 *   quality-factor      그 쌓임이 **얼마나 좁은 범위에서만** 일어나는가
 *
 * 이쪽만 「고르다 · 맞다 · 쌓인다 · 치솟는다」 어휘를 갖는다. 위상(같은 쪽 · 반대쪽)과
 * 봉우리의 폭 · 울림 길이는 형제의 몫이라 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const resonanceConcept: Aperi21ConceptSource = {
  id: 'resonance',
  label: 'Resonance',
  canonicalSim: 'aperi21:resonance',

  surface: {
    definition:
      'Of many bodies given exactly the same shaking, only the one whose own frequency agrees with that shaking piles up swing cycle after cycle while all the rest stay small.',
    exemplarKeywords: [
      'resonance',
      'why does only one of them start swinging',
      'matching the natural frequency',
      'amplitude builds up cycle after cycle',
      'pushing a swing at the right moment',
      'sympathetic vibration',
      'a wine glass shattering at one pitch',
      'tuning something to respond',
      'small pushes adding up to a large motion',
      'resonant frequency of a structure',
      'Tacoma Narrows bridge',
      'picking one frequency out of many',
    ],
  },

  briefing: {
    observable: [
      'Sixty-one little oscillators stand in a row on one shared bar, each a rod with a bob on top. They are graded left to right, the leftmost slowest to swing on its own and the rightmost quickest, and lines of text under the ends say so.',
      'The bar beneath them all shakes back and forth by a tiny amount — every oscillator in the row gets exactly the same shaking, and the shaking is far smaller than the swing that develops.',
      'Behind each oscillator a pale upright band grows to the height of the swing it is currently making, so the shape of the whole row can be read at a glance without watching any one of them move.',
      'One column swings enormously while its neighbours a little to either side swing noticeably less and the far ends of the row barely stir at all.',
      'A small pointer in the accent colour sits under the bar at the place along the row that matches the shaking, with its name written beside it.',
      'Below the row a broad patch of light and dark records how big every column’s swing has been over the last stretch of time: the newest reading is the top line and older readings run downward, with text saying so.',
      'In that patch a dark stripe runs straight down under the matched column — it did not appear all at once but darkened from the top, which is the piling-up shown as a history.',
      'Columns off to the side leave a faint slanted striping in the patch instead, a sign that their swing keeps growing a little and then falling back rather than accumulating.',
      'Moving the pointer to another place along the row makes the old tall column sink back and a new column start building in its place, so being the large one is nothing the column owns.',
    ],

    screen: {
      affordances: [
        'The row shakes and the record below fills in by itself from the moment the reader arrives, already in progress.',
        'A slider along the bottom sets where along the row the shaking is aimed, reading out in hertz; it moves in the same steps as the spacing of the oscillators, so it always lands on one of them.',
        'Moving that slider leaves the earlier tall column standing in the record below while the row itself changes over, which lets the change be seen as a change rather than a redraw.',
        'The tall column, the pale bands and the dark stripe in the record are all drawn in the same ink, and the accent colour marks only where the shaking is aimed.',
        'There are no numbers in the picture itself — the size of a swing is read as a height, and how selective the row is as the width of the dark stripe.',
      ],
    },

    useWhen: [
      'The article has claimed that a small repeated push can produce a large motion, and the reader wants to see the smallness and the largeness in the same frame. The shaking bar is visibly tiny next to the column it raises.',
      'The reader is being told that an object responds to one frequency in particular, and a case is wanted where many candidates get identical treatment so that the picking-out cannot be mistaken for something being pushed harder.',
      'The article needs to put down the idea that the large response belongs to one special object, and moving the aim so a different column takes over is what puts it down.',
    ],

    avoidWhen: [
      'The subject is a single oscillator and how its motion lines up with, or against, what drives it. Everything here is read as a size, never as a direction or a timing.',
      'What is wanted is how narrow the agreement has to be as a measured width, or how long the motion goes on after the shaking stops. The shaking here never stops.',
      'Two bodies exchanging a swing between them, or two frequencies adding up, is the point. The oscillators here are on one bar and none of them affects any other.',
      'The article needs values — a frequency, an amplitude, a factor by which the response is magnified. Only the control reads out a number; the picture has none.',
      'The point is the first moments after the shaking begins, or a body released and left to itself. The row has been running long before the reader gets there.',
    ],

    contrastWith: [
      {
        concept: 'driven-oscillation',
        note: 'One asks which of many bodies grows under the same shaking; the other stays with one body and asks what tempo and which way it ends up moving.',
      },
      {
        concept: 'quality-factor',
        note: 'Both are about agreement between a shaking and a body’s own rhythm, but one says that agreement is what selects, while the other says how tight the agreement must be and ties that tightness to how long the body rings on afterwards.',
      },
      {
        concept: 'normal-modes',
        note: 'One is about an outside rhythm finding the body that matches it; the other is about the rhythms a system already holds, with no outside driving at all.',
      },
    ],
  },
};
