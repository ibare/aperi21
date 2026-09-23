/**
 * light-cone 개념 선언.
 *
 * 시공간 둘 중 하나. `spacetime-diagram` 과 갈랐다 — 저쪽은 **읽는 법**(속도를 고치면
 * 동시선이 기운다)이고 이쪽은 **인과의 경계**다. 이 조각이 묻는 것은 「얼마나」 가 아니라
 * 「안인가 밖인가」 이고, 틀을 바꾸는 동안 사건은 미끄러져도 **경계는 한 획도 안 바뀐다**.
 * `relativity-of-simultaneity` 와도 갈린다 — 저쪽은 순서가 달라질 수 있다는 것이고,
 * 이쪽은 **어떤 쌍에 한해** 그것이 허용되며 나머지는 모두가 같은 순서로 본다는 것이다.
 *
 * 조각에 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lightConeConcept: Aperi21ConceptSource = {
  id: 'light-cone',
  label: 'The Cone of What an Event Can Reach',
  canonicalSim: 'aperi21:light-cone',

  surface: {
    definition:
      'The boundary swept out by light leaving one event, dividing what that event can influence from what it cannot, and standing unchanged however the observer is chosen.',
    exemplarKeywords: [
      'light cone',
      'causal structure of spacetime',
      'what an event is able to influence',
      'timelike and spacelike separation',
      'the elsewhere region',
      'the cone is the same for every observer',
      'which of two events can be cause and which effect',
      'nothing outruns light, so nothing leaves the cone',
      'past cone and future cone of an event',
      'events too far apart in space to affect each other',
    ],
  },

  briefing: {
    observable: [
      'The picture is drawn as a solid, seen from an angle: two directions of space spread out and time rises.',
      'One event sits at the meeting point of everything, and from it a flat sheet — the present moment — rises steadily, carrying a ring of light that widens exactly as fast as the sheet climbs.',
      'What that widening ring sweeps out as it rises is the cone itself, so the boundary is watched being made rather than presented ready-made.',
      'Four other events are scattered in the solid, and each flashes into being at the moment the rising sheet passes its height.',
      'From the first event a straight line grows out toward each of two of them, reaching each exactly as it happens, and the head of every such line stays inside the ring of light the whole way — nothing sent ever gets out in front of the light.',
      'Those two become filled points, written as reached; the other two happen while the ring is still short of where they are, and become hollow circles written as not reached.',
      'A cone below the first event is drawn faintly as well, with its far rim dotted, so what could have reached this event is shown alongside what it can reach.',
      'The sheet and the ring then go, leaving the two cones, a name for the region between them, and the four verdicts.',
      'The observer is then changed: the four events slide along faint curved tracks, the lines that were sent follow them, and the cones do not move by a single stroke.',
      'Through all of it the two events that were inside stay inside and the two that were outside stay outside.',
      'While the observer is being changed, a flat sheet is laid at the height the first event now counts as the present, and one of the outside events drops below it — it has become the earlier of the two — while the other outside event rises to later, and neither has entered the cone.',
      'The observer is then changed back, the events return along their tracks, and the whole thing begins again.',
      'Verdicts are told by filled against hollow and by writing, not by colour; no coordinates, no speeds and no gradations appear anywhere.',
    ],

    screen: {
      affordances: [
        'The spreading, the verdicts, the change of observer and the return run through by themselves on a loop; nothing has to be pressed.',
        'What is offered is the one question of inside or outside, which is why no figures are given and nothing is read off an axis.',
        'The one strong colour is used for the front of the light only — the first flash and the ring — so the boundary is the thing that draws the eye.',
        'The far side of the past cone is dotted and the near side solid, which is what keeps the solid readable as a solid.',
        'The change of observer is shown by the events moving rather than by the cone moving, which is the point being made.',
      ],
    },

    useWhen: [
      'The article has said that nothing travels faster than light and the reader takes that as a rule about vehicles rather than about what can be caused. Watching signals stay inside a spreading ring, and two events fall outside it, turns the speed limit into a boundary on influence.',
      'A piece needs the one thing in relativity that every observer agrees on, after a run of claims about what changes from observer to observer. The events sliding while the cone stays put is that agreement made visible.',
      'The reader has learned that the order of two events can differ between observers and is now worried about cause and effect. The pairs for which order can be reversed turning out to be exactly the pairs outside the cone is what settles it.',
    ],

    avoidWhen: [
      'What is wanted is how to read a diagram of this kind — speed as slope, or the tilting of the line of now. No tilt is shown and no axis is named.',
      'The subject is how much a clock slows or a body shortens. Nothing on the picture is a clock or a body and no factor is given.',
      'The article needs a boundary produced by gravity, from which light cannot climb out. Nothing here bends or curves, and the boundary is the one that flat spacetime already has.',
      'The point is a single observer who reverses course and comes back with a different age. There is one event and no journey.',
      'Coordinates, speeds or separations are wanted as figures. Only inside and outside are offered.',
    ],

    contrastWith: [
      {
        concept: 'spacetime-diagram',
        note: 'One picks out the structure that stays fixed however the observer is chosen; the other is about everything that tilts when the observer changes.',
      },
      {
        concept: 'relativity-of-simultaneity',
        note: 'One shows that observers can disagree about the order of two events; the other marks out precisely which pairs that can happen to, and so which of them could ever be cause and effect.',
      },
      {
        concept: 'relativistic-velocity-addition',
        note: 'One draws the region that the speed limit carves out of space and time; the other tests that limit directly by trying to exceed it through addition.',
      },
      {
        concept: 'black-hole-horizon',
        note: 'Both are surfaces that light defines and nothing gets back across, but one belongs to every event everywhere and depends on no matter at all, while the other exists only around a particular concentration of mass.',
      },
    ],
  },
};
