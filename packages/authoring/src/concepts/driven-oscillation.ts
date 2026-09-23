/**
 * driven-oscillation 개념 선언.
 *
 * 위험한 형제 셋(흔들어 주는 진동) 중 하나다. **주어와 주장을 이렇게 갈랐다.**
 *   driven-oscillation  한 진동자의 **박자와 방향** — 제 박자가 아니라 흔드는 쪽의 박자로,
 *                       느리면 같은 쪽 · 빠르면 반대쪽
 *   resonance           **여럿 중 누가** 커지는가 — 맞는 하나만 주기마다 쌓인다
 *   quality-factor      **한 성질을 두 곳에서 잰다** — 좁은 봉우리와 긴 울림이 같은 것
 *
 * 이쪽만 「따라간다 · 반대로 간다 · 손의 박자」 어휘를 갖는다. 「치솟는다 · 맞춘다 · 쌓인다」
 * (resonance)와 「좁다 · 오래 울린다」(quality-factor)는 쓰지 않는다. 화면도 두 구동 진동수를
 * 고유 진동수에서 멀리(0.4 배 · 1.6 배) 두어 진폭 봉우리를 들이지 않았다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const drivenOscillationConcept: Aperi21ConceptSource = {
  id: 'driven-oscillation',
  label: 'Driven Oscillation',
  canonicalSim: 'aperi21:driven-oscillation',

  surface: {
    definition:
      'A body kept shaking by an outside driver takes the driver’s tempo instead of its own, moving with the driver when the shaking is slow and against it when the shaking is quick.',
    exemplarKeywords: [
      'driven oscillation',
      'forced vibration',
      'steady-state response to a periodic drive',
      'does the mass follow the hand that shakes it',
      'in step with the driver or against it',
      'phase difference between drive and response',
      'shaking the top of a spring slowly versus quickly',
      'the oscillator swings at the frequency it is driven at',
      'driving frequency below and above the natural one',
      'why does the load move the opposite way to the shaker',
    ],
  },

  briefing: {
    observable: [
      'Two identical rigs hang side by side: the same spring, the same mass, and above each a hand that moves up and down by the same amount. The only difference between them is how fast the hand goes, and a line of text over each names it as the slow one or the quick one.',
      'A strip of paper runs out to the right of each rig. The hand and the mass each leave a wavy trail on it, and both strips run at the same speed, so the spacing of the waves is the tempo itself — the left strip carries about one wave, the right strip five.',
      'The mass’s trail always has the same wave spacing as the trail of its own hand, however far apart the two rigs are.',
      'Dotted upright lines in the accent colour drop from every crest of the hand’s trail down to the mass’s trail. On the slow rig they land on crests; on the quick rig they land on troughs.',
      'The same thing is visible in the rigs themselves: on the slow side the hand and the mass rise and fall together, while on the quick side the hand goes up as the mass comes down and the spring is squashed between them.',
      'The swing of the mass is a little larger than the hand’s on the slow rig and a little smaller on the quick one, but neither grows away from the other over time.',
      'The view moves between three settings on its own — the slow rig alone in full strength, then the quick rig alone, then both together at once. The rig that is not being pointed at stays faintly drawn rather than disappearing.',
      'Two faint dotted lines mark the height each mass rests at, which is what makes above and below readable.',
    ],

    screen: {
      affordances: [
        'The shaking, the strips running and the move through the three settings all happen by themselves and start over.',
        'Nothing is offered to press or drag — the two tempos are put side by side from the start rather than being reached by changing one of them.',
        'The hands and their trails carry one colour and the masses, springs and their trails another, so which side is shaking and which side is being shaken needs no legend.',
        'The accent colour is kept for one thing only — the instant the hand is at the top — so where the dotted line lands is the whole of the reading.',
        'No numbers appear anywhere: not the tempos, not the sizes of the swings, not the angle between them.',
      ],
    },

    useWhen: [
      'The article has said that a driven body ends up moving at the frequency it is driven at, and the reader still half expects the body to keep its own. Two rigs whose trails carry different wave spacings while each mass matches its own hand is what settles that.',
      'The point to be made is that the response can be the wrong way round — the load going down while the driver goes up — and a case is wanted where nothing else differs between the two rigs but speed.',
    ],

    avoidWhen: [
      'The article is about what happens when the driving is tuned to the body’s own frequency and the swing grows large. Both rigs here are deliberately far from that, and neither swing grows.',
      'The subject is how sharply an oscillator picks out one frequency, or how long it goes on after the driving is stopped. The driving here never stops and there is only ever one frequency per rig.',
      'What is needed is the angle between drive and response as a number, or a curve of that angle against frequency. Only two cases are shown, and they are read as with or against.',
      'The article turns on the first few cycles after the shaking starts, when the body’s own rhythm is still mixed in. The rigs here have been shaking for a long time before the reader arrives.',
      'The point is a swing that is pushed once and left, or one that slowly dies away. Nothing here is released and nothing fades.',
    ],

    contrastWith: [
      {
        concept: 'resonance',
        note: 'One follows a single body and asks what rhythm and direction it ends up with; the other sets many bodies against one shaking and asks which of them grows.',
      },
      {
        concept: 'quality-factor',
        note: 'One is about how the response is timed against the drive; the other is about how choosy that response is and how long it outlives the drive.',
      },
      {
        concept: 'spring-force',
        note: 'One takes the spring as given and watches what an outside rhythm does to the mass on its end; the other is about the spring itself and how its pull grows with how far it is pulled.',
      },
    ],
  },
};
