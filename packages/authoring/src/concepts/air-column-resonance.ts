/**
 * air-column-resonance 개념 선언.
 *
 * 「정상파」 네 형제 중 **관의 끝**을 맡는다.
 *   air-column-resonance  주어 = **관의 끝**(열림 · 막힘). 주장 = 막힌 끝은 공기가 멈추는
 *                         자리라 막은 관은 **절반 진동수에서 먼저, 홀수 배에서만** 울린다
 *   harmonics             주어 = 묶인 줄의 진동수 모임. 주장 = 정수배 전부가 남는다
 *   string-vibration      주어 = 흔들리는 길이. 주장 = 짧아지면 더 빨리 흔들린다
 *   standing-wave         주어 = 반대로 달리는 두 파동. 주장 = 무늬가 흐르기를 멈춘다
 *
 * 이쪽만 「관 · 공기 기둥 · 막은 끝 · 열린 끝 · 절반 · 홀수 배 · 엇갈림」 어휘를 갖는다.
 * 줄 · 손가락 · 옥타브는 쓰지 않고, 정수배 전부라는 말도 쓰지 않는다 — 이 화면의
 * 요지는 한 관이 그 절반을 잃는다는 것이다. 압력 쪽 그림은 화면에 없어 avoidWhen 으로 막는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const airColumnResonanceConcept: Aperi21ConceptSource = {
  id: 'air-column-resonance',
  label: 'Why a Stopped Pipe Sounds an Octave Below an Open One',
  canonicalSim: 'aperi21:air-column-resonance',

  surface: {
    definition:
      'What blocking one end of a pipe does to which notes it will answer: air cannot move where the pipe is shut, so a shut pipe first rings at half the open pipe’s lowest note and then only at odd multiples of that.',
    exemplarKeywords: [
      'air column resonance',
      'open pipe versus closed pipe',
      'stopped pipe sounds an octave lower',
      'why a closed pipe has only odd harmonics',
      'covering the end of a tube changes the note',
      'quarter wavelength in a closed pipe',
      'node at the closed end antinode at the open end',
      'organ pipe stopped and open',
      'blowing across a bottle',
      'resonance of a tube of air',
      'the closed end forbids the air to move',
    ],
  },

  briefing: {
    observable: [
      'Two pipes of exactly the same length lie one above the other, drawn on their sides. The upper one is open at both ends; the lower one has a plug closing its right-hand end.',
      'A single plate at the left mouths of both drives them together at one and the same rate, and that rate is raised in fixed steps, five of them in a round, pausing on each.',
      'Inside each pipe are grains of air that jiggle back and forth along the pipe. A pale shaded envelope drawn around them, outlined with a dashed edge, shows how big that jiggling is at each place.',
      'At every step exactly one of the two pipes rings. Its grains move far and its envelope bulges; the other pipe’s envelope is a flat band and its grains sit almost still.',
      'The shut pipe’s bulge is a wedge — widest at the open mouth and closing to nothing at the plug. The open pipe’s bulge is wide at both mouths and pinched in the middle.',
      'While a pipe is ringing, lit marks stand at the places inside it where the air is not moving, and in the shut pipe one of those marks is always at the plug itself.',
      'To the right stands a small ladder of two rows, one row per pipe, five rungs across. A dashed cursor sits over the step now being played, and the rung of whichever pipe rang is filled in.',
      'By the end of a round the two rows have filled alternately — the shut pipe’s first, third and fifth, the open pipe’s second and fourth — leaving two interleaved combs.',
      'The rungs are named by how they stand to the open pipe’s lowest note, so the shut pipe’s very first filled rung reads as half of it.',
      'Between steps, while the rate is moving, neither pipe rings and both envelopes go flat.',
      'A line of text below says which pipe is ringing and why, and at the end states that the shut pipe rang first at half and thereafter only at the odd ones.',
    ],

    screen: {
      affordances: [
        'The steps climb and dwell by themselves and the round repeats; nothing is pressed. The two pipes are given side by side from the start rather than one being shut and opened, so the comparison sits in one frame instead of in a memory.',
        'Both pipes are the same length and are driven by the same plate at the same rate, so the single thing that differs between them is the plug.',
        'The rate is stepped rather than swept smoothly, because the only question asked at each step is which of the two pipes answers.',
        'How far the air moves is what the envelopes show; the picture of pressure, in which the same ends would read the opposite way, is not put beside it.',
        'The air of both pipes is drawn in one ink and the envelopes, walls and empty rungs are held back; the accent is spent on the still places alone, and which pipe is ringing is told by the bulge, not by colour.',
        'The ladder holds what has already happened, so the alternation is a picture at the end of the round rather than something to be remembered step by step.',
        'The rungs are named as fractions and multiples of one note; nothing is given in cycles per second and nothing is heard.',
        'On arriving, the shut pipe is already ringing on the lowest step.',
      ],
    },

    useWhen: [
      'The article has stated that a stopped pipe sounds an octave below an open one of the same length and has only the odd members of the series, and the reader has taken both as facts to memorise. Two identical pipes ringing alternately up one ladder makes them one fact with one cause.',
      'What is being explained is that a boundary decides what may exist inside, and a case is wanted where two bodies alike in every other way are separated by the nature of one end.',
    ],

    avoidWhen: [
      'The subject is a string, a finger, a fret, or an instrument whose note is changed by shortening it. Both pipes here keep one length throughout.',
      'The reader is to be shown a column of air being lengthened or shortened until it answers — a water level lowered, a tube drawn out, a ladder of lengths that ring. The length is fixed here and it is the rate that is stepped through.',
      'The article is about the whole ladder of whole multiples a bounded body accepts, taken on its own. The point here is which half of that ladder a pipe loses.',
      'The claim to be carried concerns pressure — where the pressure swings most, where it holds steady, or how it stands against the movement of the air. Only how far the air moves is drawn.',
      'The point turns on an end correction, on the width of a pipe, or on why a real pipe rings slightly flat. The pipes here are ideal and the ends are exactly where they are drawn.',
      'The article is about sounding two notes and hearing them together, or about the character a note gets from several ringing at once. One rate is played at a time.',
      'Figures are wanted — rates, lengths, wavelengths. Everything written is a ratio to one lowest note.',
    ],

    contrastWith: [
      {
        concept: 'harmonics',
        note: 'Both are about ends choosing which shapes may survive, but one has two ends of the same kind and keeps every whole multiple, while the other makes the ends differ and is left with half of them.',
      },
      {
        concept: 'string-vibration',
        note: 'Both change which note sounds, but one alters what the end of the body is while keeping its size, and the other alters the size while keeping the ends.',
      },
      {
        concept: 'standing-wave',
        note: 'One is about which patterns a bounded body of air permits; the other is about how a pattern comes to hold still at all.',
      },
      {
        concept: 'reflection-of-waves',
        note: 'Both turn on what an end does — one that cannot move against one that is free. One follows a single pulse back from such an end; the other asks which continuing shapes those ends allow to persist.',
      },
      {
        concept: 'resonance',
        note: 'One sets two bodies under one driver and finds that they answer at alternating rates because their ends differ; the other sets several bodies under one shaking and finds that only the matching one builds up.',
      },
    ],
  },
};
