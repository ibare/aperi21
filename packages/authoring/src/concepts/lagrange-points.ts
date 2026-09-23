/**
 * lagrange-points 개념 선언.
 *
 * 위험한 짝은 `two-body-problem` — 둘 다 두 천체다. **주어를 갈랐다.**
 *   lagrange-points   주어는 **셋째 물체** — 두 천체가 만든 지형의 다섯 자리에 놓으면 머무는가
 *   two-body-problem  주어는 **두 천체 자신** — 둘 다 질량 중심 둘레를 돈다
 * 이미 선언된 `equilibrium-points` 와도 갈랐다 — 저쪽은 골짜기/꼭대기라는 **일반 판정**이고,
 * 이쪽은 꼭대기인데도 붙잡는 두 자리가 있다는 **뒤집힘**이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lagrangePointsConcept: Aperi21ConceptSource = {
  id: 'lagrange-points',
  label: 'Lagrange Points — Five Places That Turn With the Pair',
  canonicalSim: 'aperi21:lagrange-points',

  surface: {
    definition:
      'Five places keep pace with a pair of orbiting bodies effortlessly; three let a nudged object slide away, while two hold it circling despite being high ground.',
    exemplarKeywords: [
      'Lagrange points',
      'L1 L2 L3 L4 L5',
      'where the James Webb telescope parks',
      'Trojan asteroids sharing a planet’s orbit',
      'a spacecraft that keeps station with the Earth',
      'places that orbit along with two bodies',
      'why L4 and L5 collect debris',
      'halo orbits and station keeping',
      'equilibrium in the rotating frame of two bodies',
      'parking spots in the Earth-Moon system',
    ],
  },

  briefing: {
    observable: [
      'Two bodies of very unequal size are held fixed on the screen, because the whole picture turns along with them — the label says as much, since turning cannot be read from a still picture.',
      'Shading covers the field, dark where an object would sit low and pale where it would sit high, with contour lines running through it so the shape of that landscape can be followed by eye.',
      'Two wells surround the bodies themselves, a narrow pass lies between them, further passes lie beyond each one, and two broad rises stand off to either side of the line joining them.',
      'Five places are marked with small crosses and named, one on the pass between the bodies, one beyond each body, and one on each of the two rises.',
      'Test objects are laid down repeatedly a little to one side of each of the five, and each one is then left to move as the landscape and the turning dictate; every one leaves a fading trail.',
      'At the three places on the line, objects slip away — sideways off the pass, out past a body, or off into the distance — and their trails run off the picture or down into a well.',
      'At the two rises, which are high ground and should shed anything placed on them, objects instead loop round and round the marked cross and stay in the neighbourhood.',
      'New objects keep being laid down at all five crosses, so both outcomes are always on screen at the same time rather than being shown in turn.',
      'No value is written anywhere — no height, no distance, no scale for the shading.',
    ],

    screen: {
      affordances: [
        'The picture arrives already running, with trails established at all five places; nothing has to be pressed and no object is placed by hand.',
        'Objects are dropped at intervals and fade out after a while, so the comparison never becomes a single frozen pattern and neither outcome depends on having watched from the beginning.',
        'The landscape and the motion are drawn from the same underlying description, so the trails are a consequence of the shading rather than an illustration laid on top of it.',
      ],
    },

    useWhen: [
      'The article has said a spacecraft is parked at one of these places and the reader takes it to be a spot where gravity cancels. Watching objects slide off three of the five shows that keeping station there is not the same as being held there.',
      'The prose needs the surprise that two of the places are hilltops and hold anyway, as the setup for why asteroids gather at them or why the turning matters.',
    ],

    avoidWhen: [
      'The article is about the two bodies themselves — how they divide the motion, where their shared centre falls, how their circles compare. Both are pinned here and nothing about them changes.',
      'The general distinction between a stable and an unstable resting place is the subject, as a valley against a hilltop. The whole point here is a case where that reading fails, which would mislead if borrowed.',
      'Which particular place a named mission uses, or how far out it lies. The five are marked and named and nothing else is written about any of them.',
      'The motion has to be shown from outside, as ordinary orbits around the pair. Everything here is drawn in a picture that turns with the two bodies and would have to be untangled first.',
      'The article turns on how the outcome changes with the ratio of the two masses. One pair is shown and the ratio never varies.',
      'A launch, a transfer or the cost of getting to such a place is the subject. Nothing arrives and nothing manoeuvres.',
    ],

    contrastWith: [
      {
        concept: 'two-body-problem',
        note: 'One takes a bound pair as given and asks where a third, negligible body may keep pace with them; the other is about the pair itself and how the two share the motion between them.',
      },
      {
        concept: 'equilibrium-points',
        note: 'One is a case where the usual reading breaks: two of the places are high ground and hold anyway, because the picture is turning. The other is that usual reading, sorted out on ground that does not turn.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One reads a landscape spread over a plane, where a nudged object can also curve sideways; the other reads a single curve along one direction, where a body can only roll one way or the other.',
      },
      {
        concept: 'coriolis-effect',
        note: 'One is a situation whose surprising half depends on what a turning frame does to a moving body; the other is that deflection itself, isolated and watched on its own.',
      },
      {
        concept: 'fictitious-force',
        note: 'One is a landscape that only exists once a turning viewpoint has been adopted; the other is the general business of what such a viewpoint adds to the accounting.',
      },
    ],
  },
};
