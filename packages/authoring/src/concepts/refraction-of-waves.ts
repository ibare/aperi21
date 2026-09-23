/**
 * refraction-of-waves 개념 선언.
 *
 * 경계를 다루는 형제 둘과 갈랐다. **경계에서 무엇을 묻는가**가 다르다.
 *   refraction-of-waves  주어 = 비스듬히 건너는 **마루**. 주장 = 먼저 들어간 끝이 뒤처져 **방향이 꺾인다**
 *   impedance-mismatch   주어 = **이음매**. 주장 = 얼마나 **되돌아오는가**, 그리고 어느 쪽으로 솟아서
 *   seismic-waves        주어 = **지구 속 두 파**. 주장 = 어느 지표에 **닿지 못하는가**
 * 이쪽만 「기울기 · 뒤처짐 · 꺾임 · 속력 비」 어휘를 갖는다. 되돌아오는 몫 · 각도 수치는 화면에 없다.
 *
 * 회절 둘(diffraction · slit-width-and-diffraction)과는 「무엇이 방향을 바꾸게 하는가」로 갈린다 — 여기는 속력,
 * 저기는 막힘이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const refractionOfWavesConcept: Aperi21ConceptSource = {
  id: 'refraction-of-waves',
  label: 'Refraction as a Crest Bending at a Speed Change',
  canonicalSim: 'aperi21:refraction-of-waves',

  surface: {
    definition:
      'A wave crossing obliquely into a medium where it moves slower, the end that enters first falling behind the rest so that the whole crest turns to a new direction.',
    exemplarKeywords: [
      'refraction of waves',
      'why do waves bend in shallow water',
      'water waves entering the shallows',
      'a change of speed turns the direction',
      'wavefront bends at a boundary',
      'ripple tank refraction',
      'the end that slows first drags the rest around',
      'waves turn toward the normal',
      'why light bends going into glass',
      'crossing a boundary at an angle',
      'same period, shorter wavelength on the slow side',
    ],
  },

  briefing: {
    observable: [
      'A wide tank of water seen from above, flowing with bright and dark bands, is cut down the middle by a line: the left half is named deep water — fast, the right half shallow water — slow and lies under a faint tint.',
      'One crest is drawn thick and followed for eight seconds as it comes in at a slant from the fast side.',
      'On the slow side a dashed line marks where that same crest would have got to had it not slowed; the thick crest falls behind it and the gap between the two opens as the crossing goes on.',
      'The thick crest is one straight line before the boundary and another, differently sloped line after it, with the kink sitting exactly on the boundary rather than somewhere past it.',
      'The bands of the pattern are packed closer together on the slow side, while along the boundary itself they arrive at the same spacing on both sides.',
      'A line under the tank says in turn that the crest is approaching, that the end which crosses first slows first and falls behind the dashed line, and that once across it keeps its bent direction.',
      'Raising the slow side to full speed removes the dashed line, straightens the crest through the boundary, and changes the right-hand name to shallow water — same speed.',
      'The crossing repeats without end; nothing is numbered and no arrow says which way the wave is going.',
    ],

    screen: {
      affordances: [
        'A slider at the lower right sets the speed of the slow side against the fast side held at 1, from 0.35 up to 1 in steps of 0.05; it opens at 0.55.',
        'The line of text under the tank is tied to where the crest is, so moving the slider changes the picture while the sentence keeps following the crossing.',
        'At the top of the slider the two sides become one medium and the screen says so in words as well as by the crest going straight — the reader can take the bend away and put it back.',
        'Nothing else is offered: the eight-second crossing runs and repeats on its own.',
      ],
    },

    useWhen: [
      'The article has stated that a wave changes direction when its speed changes, and the reader cannot see why speed should have anything to do with direction. Watching one end of the crest fall behind the dashed line while the other end has not yet crossed is the mechanism, and the slider lets the reader take the speed difference away and watch the bend go with it.',
      'The point being made is that refraction is about the medium rather than about the wave: the period never changes here, and what closes up on the slow side is the spacing between bands.',
    ],

    avoidWhen: [
      'The article works with Snell’s law as an equation, or needs an angle of incidence and an angle of refraction to be read off. No angle is marked and no number but the speed ratio appears anywhere.',
      'The subject is colours separating in a prism, or a rainbow. One wavelength crosses here and nothing is split.',
      'The point is how much of the wave gets across a boundary and how much comes back. Everything shown carries straight on into the slow side.',
      'The article is about total internal reflection or a critical angle. The crossing here always goes from fast to slow and always completes.',
      'The subject is a wave bending past the edge of an obstacle or through an opening. The boundary here runs right across the tank and nothing blocks anything.',
    ],

    contrastWith: [
      {
        concept: 'diffraction',
        note: 'Both end with a wave travelling in a direction it did not start in; one gets there because part of the wave is slowed and drags the rest around, the other because part of the wave has been blocked and what survives spreads from the opening.',
      },
      {
        concept: 'impedance-mismatch',
        note: 'Both are about a wave meeting a change of medium. One asks which way what crosses is now heading; the other ignores direction and asks what fraction never crossed at all.',
      },
      {
        concept: 'seismic-waves',
        note: 'One is the bending itself, isolated at a single boundary; the other uses bending inside a body as a means, and its question is which parts of the far surface end up receiving nothing.',
      },
      {
        concept: 'wave-basics',
        note: 'One states the lock between a wave’s wavelength, period and speed while nothing about the wave changes; the other is what that lock forces when the speed changes at a boundary and the period cannot, which is why the crest ends up pointing elsewhere.',
      },
    ],
  },
};
