/**
 * pendulum-amplitude-dependence 개념 선언.
 *
 * 진자 형제 중 **근사의 경계**를 맡는다. 다른 셋이 「무엇이 주기를 정하는가」를
 * 답한다면 이쪽은 「그 답이 어디까지 참인가」를 답한다.
 *   simple-pendulum    줄 길이가 정한다 (작은 흔들림을 전제로 깔고 들어간다)
 *   physical-pendulum  매단 자리가 정한다
 *   simple-harmonic-motion  변위에 비례하는 되미는 힘이 사인을 그린다
 *   pendulum-amplitude-dependence  **흔들림 폭** — 넓히면 그 전제가 무너진다
 * 이쪽만 등시성 · 소각 근사 · 뒤처짐 · 「근사가 깨지는 자리」 어휘를 갖는다.
 * 줄 길이 · 추 무게 · 매단 자리라는 말은 쓰지 않는다.
 *
 * canonicalSim 은 주제 id 와 다르다 — `topics.yaml` 의 `sim` 값 그대로 쓴다 (C4).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pendulumAmplitudeDependenceConcept: Aperi21ConceptSource = {
  id: 'pendulum-amplitude-dependence',
  label: 'Amplitude and the Pendulum Period',
  canonicalSim: 'aperi21:pendulum-isochronism',

  surface: {
    definition:
      'The slow lengthening of a pendulum’s round-trip time as its swing is opened wider, the equal-time behaviour that holds for narrow swings breaking down once the angle grows large.',
    exemplarKeywords: [
      'isochronism',
      'does the amplitude change the period of a pendulum',
      'large angle pendulum',
      'the small angle approximation breaking down',
      'wide swings run slow',
      'a pendulum clock losing time as its swing opens',
      'circular error',
      'sin theta approximately equals theta',
      'when the pendulum formula stops being exact',
      'how far can you swing it before the timing drifts',
    ],
  },

  briefing: {
    observable: [
      'Five bobs hang from one pivot on strings of the same length, held out to five different angles — the widest five times the narrowest — and released so that they all swing together.',
      'Each bob drags a short streak behind it that is long where it is moving quickly and shrinks to nothing at the ends of its travel.',
      'A short dotted line marks the lowest point directly under the pivot, and a ring flashes there whenever a bob crosses it.',
      'Below the swinging bunch a band scrolls steadily leftward: five rows, one per bob, each receiving a small upright stroke at the moment that bob passes the bottom.',
      'A row of labels on the left of the band names the swing angle belonging to each row.',
      'When the swings are narrow the five strokes line up in a single vertical column all the way across the band, and the five bobs overlap into one cluster as they pass the bottom.',
      'When the swing is opened out the widest bob arrives a little later each time, its strokes fall behind the others, and the column of strokes tilts away from vertical by more and more as it runs back through the band.',
      'The sentence under the picture changes once that lag has grown past a certain size, from saying the five cross together to saying the widest has fallen behind.',
      'Away from the bottom the five are spread far apart, the widest swinging out much further than the narrowest.',
    ],

    screen: {
      affordances: [
        'A slider at the top right sets how wide the swing is, from a narrow angle up to a steep one; the narrowest four follow it in fixed proportion, so the five always differ fivefold.',
        'While the slider is being held the swing is resized without losing its place in the cycle, so the beat does not break when the angle changes.',
        'The band keeps roughly eight seconds of history, so the lag is read as the slant that has accumulated across the band rather than as a comparison of two instants.',
        'The picture arrives with the band already full and the bobs already swinging, so the evidence is there from the first moment rather than after a wait.',
        'The sentence under the picture is governed by the size of the lag rather than by the clock, so it turns over exactly when the drift becomes something to see.',
        'The swing starts narrow, where the five keep together; the departure has to be brought on by widening it.',
      ],
    },

    useWhen: [
      'The article has quoted the pendulum period formula and needs to say honestly that it is an approximation. Widening the swing until the column of strokes visibly leans, and the sentence changes, gives the reader the boundary rather than a caveat.',
      'The point being made is that a clock swinging wider runs slow, and a case is wanted where a small per-swing error is shown accumulating into an obvious one.',
    ],

    avoidWhen: [
      'The subject is what the string length or the weight of the bob does to the timing. All five strings here are the same and all five bobs are alike; only the angle differs.',
      'The swinging thing has size of its own and is hinged through its body.',
      'The article needs the plain statement that a pendulum keeps time, with no qualification. Opening the swing here is precisely what takes that away.',
      'The point is that the motion traces a sine curve. Nothing is plotted against time except the instants of passing the lowest point.',
      'Numbers are wanted — a period, a percentage error, a formula with correction terms. The only figures on the screen are the five angles.',
    ],

    contrastWith: [
      {
        concept: 'simple-pendulum',
        note: 'One asserts that a narrow swing keeps time whatever else changes; the other tests the condition that assertion rests on, and shows it failing as the swing opens.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One is the case where the restoring force is only nearly proportional to the displacement, which is why the timing drifts; the other is the idealised case where the proportionality is exact.',
      },
      {
        concept: 'mass-spring-system',
        note: 'One says how far you pull it does change the timing, once you pull far enough; the other says it does not, and stays within the range where that holds.',
      },
      {
        concept: 'physical-pendulum',
        note: 'Both change the timing of a swing, but one does it by widening the swing and the other by moving the pivot along the body.',
      },
    ],
  },
};
