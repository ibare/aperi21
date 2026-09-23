/**
 * standing-wave 개념 선언.
 *
 * 「정상파」 네 형제 중 **겹침이 만드는 무늬**를 맡는다. 넷 다 마디 · 배가 나오므로
 * 주어와 주장을 갈랐다.
 *   standing-wave         주어 = 반대로 달리는 **두 파동**. 주장 = 겹치면 무늬가 **흐르기를 멈춘다**
 *   harmonics             주어 = 묶인 줄이 받아들이는 **진동수 모임**. 주장 = 정수배만 남는다
 *   string-vibration      주어 = **흔들리는 길이**. 주장 = 짧아지면 더 빨리 흔들린다
 *   air-column-resonance  주어 = **관의 끝**. 주장 = 막으면 절반 진동수 · 홀수 배만 울린다
 *
 * 이쪽만 「겹친다 · 반대 방향 · 흐르지 않는다 · 제자리 · 시간 자취」 어휘를 갖는다.
 * 진동수 · 정수배 · 음높이 · 관 · 길이는 쓰지 않는다 — 화면에 수가 하나도 없고
 * 진동수를 고르는 일도 일어나지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const standingWaveConcept: Aperi21ConceptSource = {
  id: 'standing-wave',
  label: 'Standing Wave as Two Waves Overlapping',
  canonicalSim: 'aperi21:standing-wave',

  surface: {
    definition:
      'What two equal waves running opposite ways along one string make together: a pattern that no longer travels, certain points of it held still while the stretches between them swing.',
    exemplarKeywords: [
      'standing wave',
      'nodes and antinodes',
      'why do some points of the string never move',
      'two waves travelling in opposite directions overlap',
      'the wave stops moving along',
      'a wave that swings in place instead of running',
      'crests that no longer drift',
      'what a node is',
      'superposing a wave with one coming back',
      'stationary wave on a string',
      'the pattern stays put while the string moves',
    ],
  },

  briefing: {
    observable: [
      'Along the upper part of the picture lie three curves drawn on one another: a solid one, a dashed one, and a heavy dark one that is the two of them added — the heavy curve is the string itself.',
      'Below the string stands a tall patch of texture holding the recent past: across it is place along the string, down it is time, the top edge being the present and the bottom edge a few seconds ago. Only those two ends of the time axis carry writing.',
      'In that texture the string being up is inked one way and the string being down the other, with nothing at all where the string is level, so the patch is a record of where the string has been up and where down.',
      'While both waves are present the record is a chequer of blocks stacked straight downward, and running between them are blank columns that never break from top to bottom — those columns are the places that never move. A small lit mark sits on the string at the head of each one.',
      'The dashed wave then thins away to nothing. As it goes, the blank columns break up and the whole record turns into slanted stripes travelling steadily sideways: every place is moving now, and the crests drift along the string.',
      'The dashed wave comes back, and the slant breaks from the top edge downward while new blank columns form again at the same places along the string.',
      'The lit marks on the string appear only while the blank columns are whole.',
      'A line of text below says which of the three states is on view — overlapped, one wave only, or in the middle of the change.',
    ],

    screen: {
      affordances: [
        'Nothing is pressed. The wave running the other way is taken out and put back in a round of its own, and the round repeats.',
        'The two waves that are being added are told apart by how they are drawn — one solid, one dashed — while their sum is the heaviest line, so weight and dash carry the distinction instead of colour.',
        'Every row of the time record is worked out afresh from the moment shown rather than scrolled along, so coming back to the same moment gives the same picture.',
        'The lit marks are switched on only while the still places actually exist, which makes them evidence rather than decoration.',
        'The record carries no grid and no scale; the downward direction is time, and only its two ends are named.',
      ],
    },

    useWhen: [
      'The article has said that a standing wave is two waves overlapping, and the reader has taken the still points as part of the definition rather than as something that follows. Watching the travelling stripes break into columns that go nowhere is what turns the definition into a consequence.',
      'The case is being made that a standing wave is not a different kind of wave but the same running waves seen together, and a stretch with only one of them present is wanted alongside it in the same picture.',
    ],

    avoidWhen: [
      'The subject is which rates a string will take up, or a lowest one and its whole-number multiples. Nothing here is tuned, and no rate is named or chosen.',
      'The article is about pitch — a shorter string sounding higher, an instrument, a note. One string at one setting is all there is, and nothing is heard.',
      'The point turns on a pipe, a column of air, or an end that is open or closed. This string runs off both sides of the picture and has no ends to speak of.',
      'A single pulse is wanted, arriving somewhere and coming back. Both waves here are already running and neither begins or ends.',
      'Figures are needed — a wavelength, a rate, a height. Nothing is numbered except the two ends of the time axis.',
    ],

    contrastWith: [
      {
        concept: 'harmonics',
        note: 'One says that overlapping opposite waves make a pattern that holds still; the other says which rates a bounded body will actually take up, so that such a pattern can build at all.',
      },
      {
        concept: 'reflection-of-waves',
        note: 'One takes the two opposite waves as already given and asks what they make together; the other asks where the returning one comes from, and whether it comes back the same way up.',
      },
      {
        concept: 'normal-modes',
        note: 'One builds a still pattern out of two running waves; the other starts from the fixed shapes a many-part body can hold and takes a tangled motion apart into them.',
      },
      {
        concept: 'air-column-resonance',
        note: 'One is about how a non-travelling pattern arises at all; the other is about what the ends of a body do to which such patterns are permitted.',
      },
      {
        concept: 'interference',
        note: 'Both are waves adding to leave places that never move, but one has two waves running opposite ways along one line, so the whole pattern ceases to travel, while the other has two sources on a surface, where the still places lie along lines the ripples go on streaming through.',
      },
    ],
  },
};
