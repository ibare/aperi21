/**
 * lenzs-law 개념 선언.
 *
 * 유도 다섯 가운데 이쪽은 **방향**이다 — 전류는 뒤집혀도 힘은 뒤집히지 않는다.
 *   lenzs-law        유도의 **향** — 들어올 때와 나갈 때 전류는 반대인데 힘은 늘 움직임 반대
 *   faradays-law     유도 전압의 **크기** (빠르기 · 감은 수)
 *   motional-emf     움직이는 도체 속에서 전하가 갈라지는 기작
 *   eddy-current     덩어리 도체 속 저절로 도는 전류가 움직임을 막는다
 *   self-inductance  코일이 자기 자신의 전류 변화에 맞선다
 * 이쪽만 「거스른다 · 되민다 · 붙잡는다 · 전류는 뒤집히는데 힘은 그대로」 어휘를 갖고,
 * 크기 · 수치 어휘를 하나도 갖지 않는다. 주제 id 는 `lenzs-law` 이고 조각 등록 키는
 * `aperi21:lenz-law` 라 서로 다르다 — topics.yaml 의 sim 값을 그대로 쓴다 (C4).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lenzsLawConcept: Aperi21ConceptSource = {
  id: 'lenzs-law',
  label: 'The Direction That Stands Against the Change',
  canonicalSim: 'aperi21:lenz-law',

  surface: {
    definition:
      'That the induced current runs one way as a magnet approaches and the other way as it leaves, while the force on the magnet never turns about: it always stands against whichever way the magnet is going.',
    exemplarKeywords: [
      "Lenz's law",
      'which way does the induced current flow',
      'the induced effect opposes the change that caused it',
      'the minus sign in the law of induction',
      'pushing a magnet into a coil takes effort',
      'the coil pushes the magnet back and holds it back',
      'does the force reverse when the magnet is pulled out',
      'why induction always resists motion',
      'induced current direction reverses but the drag does not',
      'you cannot get induction for free',
    ],
  },

  briefing: {
    observable: [
      'Five rings seen edge-on stand in a row, and a magnet with a dark north half and a pale south half travels along their common axis, passing through them and out the other side.',
      'Charges ride round each ring, and small solid heads on the rings say which way round the current is going at this moment.',
      'One arrow above the magnet is named as the magnet\'s motion, and one below it, in the accent colour, is named as the force from the coil, and the two point opposite ways whenever both are present.',
      'As the magnet comes in, the heads on the rings point one way and the caption says the coil pushes it back; once the magnet has passed the middle and is leaving, the heads have turned about and the caption says the coil holds it back.',
      'Across that reversal the force arrow does not change side at all: it points backwards along the travel before the middle and forwards against the travel after it, which in both cases is against the way the magnet is going.',
      'At the instant the magnet is squarely in the middle of the coil the force arrow and its name disappear together and the current heads disappear too, so the accent colour is entirely absent from that one frame.',
      'At each end of its run the magnet halts for a moment before turning back, and while it is halted there is no current and no force, only the caption saying so.',
      'On the return journey, with the magnet approaching from the far side, the current heads point the same way as they did on the first approach while the force arrow points the other way, since the magnet is now travelling the other way.',
      'Nothing is numbered and nothing is measured; the whole thing is carried by which way the two named arrows point.',
    ],

    screen: {
      affordances: [
        'The magnet travels back and forth on its own, pausing briefly at each end, and that alone carries the whole argument.',
        'The magnet can also be taken hold of and moved along the line it travels: a small round grip rides on it, and pressing anywhere near that line takes hold of it too.',
        'While it is held it follows the pointer, so a reader can drive it either way and watch the force arrow answer by pointing back at them each time.',
        'Held still, the current and the force both disappear, which makes being still and being at the middle the same kind of nothing.',
        'Released, it carries on by itself in the direction it was last going, so a drag turns back into the automatic run without a jump.',
        'The two arrows carry their names directly rather than through a key, since the claim is unreadable unless it is known which arrow is which.',
        'The accent colour means the force and nothing else, so its complete absence in one frame is itself a statement.',
        'No grid, no scale and no numbers are offered — the picture is about direction, and a ruler would invite the wrong reading.',
      ],
    },

    useWhen: [
      'The article has stated that induction opposes the change that produces it, and the reader takes it as a sign convention. A current that visibly turns about while the force does not is where opposition stops being bookkeeping.',
      'The prose needs the reader to feel that induction resists them, and a magnet that can be dragged either way while the force arrow keeps pointing back at the hand is what supplies it.',
      'The article is about where the energy in an induced current comes from, and needs it established first that moving the magnet is always work against something.',
    ],

    avoidWhen: [
      'The article is about how large the induced voltage or current is — faster, more turns, a stronger magnet. Nothing here has a size; both arrows are read for where they point.',
      'A voltage is to be measured, a meter read, or a trace compared. There is no meter and no record of any kind.',
      'The subject is the field of the induced current itself, or the induced pole that faces the magnet, or the rule by which that pole is worked out. The current appears as heads on the rings and no field of its own is drawn.',
      'The article needs a solid piece of metal rather than a coil, or currents with no circuit to follow.',
      'The mechanism inside the conductor is wanted — what pushes the charges and why they go round. The charges are simply seen going round.',
      'The change comes from something other than a magnet in motion — a current being switched, a coil being turned, a field being made to grow.',
    ],

    contrastWith: [
      {
        concept: 'faradays-law',
        note: 'One says which way and would be unchanged if every size on the page were doubled; the other says how much and would be unchanged if every direction were reversed.',
      },
      {
        concept: 'eddy-current',
        note: 'One states the rule about direction in the simplest case that can show it, a coil and a magnet; the other takes that opposition as given and looks at what it does when the conductor is a solid block with no circuit in it.',
      },
      {
        concept: 'motional-emf',
        note: 'One is about the sense of an induced current and the force it brings with it; the other is about charges separating inside a conductor before there is any current to have a sense.',
      },
      {
        concept: 'self-inductance',
        note: 'One has a coil opposing a magnet that something else is moving; the other has a coil opposing a change in its own current, with nothing outside to push against.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One is the reason the books balance in induction — you never get current without pushing against something; the other is the balance itself, stated for a body that nothing is taking energy from.',
      },
    ],
  },
};
