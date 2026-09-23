/**
 * circular-orbit 개념 선언.
 *
 * 궤도 넷 중 하나. **주장을 「왜 떨어지지 않는가」 하나에 건다.**
 *   circular-orbit    당김이 속도와 **늘 직각**이라 빠르기는 그대로 두고 방향만 꺾는다 — 유령이 곧게 나가고
 *                     끌어내린 몫의 끝이 자취 위에 닿는다
 *   orbital-velocity  속도를 바꿔 본다 — 원은 다섯 중 하나뿐
 *   elliptical-orbit  빈 초점을 벌린다 — 원이 길쭉해진다
 *   keplers-first-law 중심 천체가 어디 앉는가 · 거리 합
 * 이쪽만 「직각 · 방향만 · 계속 떨어지는데 길이 휘어 나간다 · 중력이 없다면」 어휘를 갖는다.
 * 속도 값 · 배수 · 주기 어휘는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const circularOrbitConcept: Aperi21ConceptSource = {
  id: 'circular-orbit',
  label: 'Why a Steady Pull Bends a Path Instead of Bringing It Down',
  canonicalSim: 'aperi21:circular-orbit',

  surface: {
    definition:
      'A body whose pull stays square to its motion the whole way round, so that the pull changes its heading without touching how fast it goes, and the bending returns it to where it started.',
    exemplarKeywords: [
      'why doesn’t a satellite fall down',
      'an orbit is falling and missing',
      'gravity at right angles to the motion',
      'the ground curves away beneath it',
      'falling around the Earth',
      'what holds a satellite up',
      'the pull turns it without speeding it up',
      'continuous free fall in orbit',
      'if gravity switched off it would fly off straight',
      'how a circular orbit keeps itself',
    ],
  },

  briefing: {
    observable: [
      'A body travels round a central planet carrying two arrows: one along its motion and one aimed at the planet.',
      'Both arrows keep exactly the same length all the way round, and only their directions turn, so nothing on screen says that anything is getting faster or stronger.',
      'A small right-angle mark rides between the two arrows and travels with the body, so the squareness is shown at every moment and not at one chosen instant.',
      'No circle is drawn in advance; the path appears only behind the body as it goes, and it completes and closes exactly when the caption says it does.',
      'At the top of the path a hollow copy of the body departs, named as what would happen with no pull, and it runs perfectly straight along the direction the body had at that instant, leaving the traced path behind and outside.',
      'A dashed arrow in the accent colour runs from that hollow copy down to the body, standing for how far the pull has brought it in.',
      'When the hollow copy and its straight line fade, the tip of that dashed arrow is resting exactly on the traced path — the body has come down by that much and is still the same distance from the planet.',
      'The two arrows carry their names on opposite sides of the body so they never collide as the pair turns.',
      'No speeds, no distances, no radius and no period are written anywhere.',
      'The run goes twice round and then repeats by itself.',
    ],

    screen: {
      affordances: [
        'The circling, the departure of the hollow copy and the fading happen in order and then begin again; nothing has to be pressed.',
        'The arrows are given a fixed length rather than a computed one, since what is claimed is about direction; their being equal to each other the whole way round is the thing kept true.',
        'The path is grown rather than drawn ahead, so that the circle is the result of the bending and not a track the body was already on.',
        'The accent colour is kept for one meaning only — the pull and the gap it has opened between the straight line and the real path.',
        'The hollow copy leaves toward the empty side of the picture and downward on the screen means downward toward the planet, so the falling is read the way it is drawn.',
        'The angular mark is a plain corner between the two arrows, which is what makes the right angle something looked at rather than asserted.',
      ],
    },

    useWhen: [
      'The article has said that an orbiting body is in free fall and the reader cannot reconcile falling with going round. The hollow copy running straight off and the dashed arrow bringing the body back onto its own path is exactly that reconciliation, in one picture.',
      'The prose needs the reason a steady pull leaves the speed alone — that it is square to the motion at every instant — and the right-angle mark travelling with the body is what makes "at every instant" visible.',
    ],

    avoidWhen: [
      'The article changes the speed, or asks what a satellite that is too slow or too fast does. Nothing here is varied; one body goes round at one speed.',
      'The orbit in the article is stretched, or the body comes nearer at one end than the other. This path is a circle, and its distance from the planet never changes.',
      'What is needed is a magnitude — how strong the pull is, how fast the body goes, how big the orbit is, how long a lap takes. The arrows are not drawn to scale with any quantity and nothing is written.',
      'The subject is the launch — how a body is put into orbit, or from where. The body is already circling when the picture begins.',
      'The article is about weightlessness as a sensation, or people floating in a cabin. There is no interior here and nothing is weighed.',
      'The point is the general relation between a turning force and the size of the circle. The claim here is about direction only, and no relation between quantities is offered.',
    ],

    contrastWith: [
      {
        concept: 'orbital-velocity',
        note: 'One takes the circle as given and explains what keeps it; the other takes the explanation as given and asks which of many launch speeds actually produces a circle.',
      },
      {
        concept: 'centripetal-force',
        note: 'One is the case where the turning is done by gravity, so nothing touches the body and the falling and the circling are the same event; the other is the general role a force plays when it turns a body, whatever is exerting it.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'One is about the cause — a pull that stays square and so leaves the speed alone; the other is about the motion that results, with the cause not in view.',
      },
      {
        concept: 'newtons-first-law',
        note: 'One shows what a body would have done with nothing acting on it, as a hollow copy running straight off the path; the other is that behaviour itself, taken as the subject.',
      },
      {
        concept: 'free-fall',
        note: 'Both are bodies with nothing but gravity on them, but one is going sideways fast enough that its falling never arrives, while the other falls straight to the ground.',
      },
      {
        concept: 'escape-velocity',
        note: 'Both are bodies under gravity alone that never come down, for different reasons: one goes sideways fast enough that the pull only turns it and the falling never arrives, while the other is sent straight out fast enough that a pull weakening with distance never gets it back.',
      },
    ],
  },
};
