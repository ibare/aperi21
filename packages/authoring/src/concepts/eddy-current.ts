/**
 * eddy-current 개념 선언.
 *
 * 유도 다섯 가운데 이쪽은 **회로 없는 덩어리 도체**다 — 저절로 닫히는 전류가
 * 움직임을 막아 고른 느린 빠르기가 된다.
 *   eddy-current     **덩어리 도체** 속에서 저절로 도는 전류가 움직임을 막는다 (종단 속도)
 *   faradays-law     유도 전압의 크기 (빠르기 · 감은 수)
 *   lenzs-law        유도의 방향 — 힘은 늘 움직임을 거스른다 (코일 · 힘 화살표)
 *   motional-emf     움직이는 도체 속 전하가 갈라진다 (회로가 열려 있다)
 *   self-inductance  코일이 자기 자신의 전류 변화에 맞선다
 * 이쪽만 「덩어리 · 회로가 없다 · 제동 · 고른 느린 빠르기 · 구리 관」 어휘를 갖는다.
 * 방향 규칙 자체는 lenzs-law, 전압의 크기는 faradays-law 의 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const eddyCurrentConcept: Aperi21ConceptSource = {
  id: 'eddy-current',
  label: 'Braking by Currents Circulating in Solid Metal',
  canonicalSim: 'aperi21:eddy-current',

  surface: {
    definition:
      'That currents close on themselves inside a solid piece of metal when a magnet moves near it, and their braking holds the magnet down to a steady creeping speed although no circuit has been wired anywhere.',
    exemplarKeywords: [
      'eddy currents',
      'a magnet falling slowly down a copper tube',
      'magnetic braking',
      'why does a magnet take so long to fall through copper',
      'currents swirling inside a solid conductor',
      'copper is not magnetic yet it slows the magnet',
      'the falling magnet reaches a steady speed',
      'eddy current brake on a train or a saw',
      'damping produced by induced currents',
      'induced currents with no wires and no circuit',
    ],
  },

  briefing: {
    observable: [
      'Two upright tubes stand side by side on the floor, named beneath them: the left one plastic, drawn as an empty outline, the right one copper, drawn with filled walls.',
      'Identical magnets are held at the same height at the top of each tube and released at the same instant, each with its north end downward.',
      'The magnet in the plastic tube speeds up all the way and is on the floor almost at once; the one in the copper tube settles almost immediately into a slow, even descent and takes many times as long.',
      'To the left of each tube a short horizontal tick is left behind at the magnet\'s height every fifth of a second, so a ladder of marks builds up as each magnet falls.',
      'The plastic side\'s ticks spread further and further apart, five of them in all; the copper side\'s stay at one even spacing and number about twenty.',
      'Around the copper tube two flattened rings encircle the wall, one above the magnet and one below, travelling down with it, and the small heads on their near halves point opposite ways to one another.',
      'To the right of the copper tube two arrows stand: the weight pointing down in plain ink, and the retarding force pointing up in the accent colour, the two at equal length while the descent is steady.',
      'Beside the plastic tube only the weight is drawn, with nothing opposing it.',
      'When the copper magnet reaches the floor the rings fade out and both arrows go, since with the motion gone there is nothing to induce.',
      'Both ladders of ticks remain after the landings, a spreading one beside a regular one, so speeding up and going at a steady speed can be compared as spacings.',
      'The two tubes are told apart by whether their walls are filled and by their names, not by colour, and the accent colour belongs to the retarding force alone.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the two magnets are held, released together, and both are left on the floor with their tick ladders showing before it begins again.',
        'Both magnets are released at the same moment from the same height, so the comparison is made in one run rather than by remembering the previous one.',
        'The ticks are laid at one fixed interval of time for both tubes, which makes the gap between ticks stand directly for speed, and since they are never numbered the only question is whether the gaps spread or stay level.',
        'The retarding force is drawn in proportion to the speed so that it exactly equals the weight once the descent is steady, and the two arrows standing at equal length is what balance looks like here.',
        'The force arrows are drawn only while the magnet is falling, which keeps the held magnet and the landed magnet from needing a hand or a floor drawn in.',
        'The rings are drawn half behind the tube and half in front so that they read as encircling the wall rather than lying on it.',
        'The rings\' darkness follows the speed, so they fade away of themselves as the magnet comes to rest.',
        'The tubes are drawn at real scale and real gravity, with the plastic magnet taking about the time a real one would, so the slowness of the copper side is not an exaggeration.',
      ],
    },

    useWhen: [
      'The article has described the copper tube demonstration, or magnetic braking generally, and the reader wants to know where the current is supposed to be flowing when there is no circuit. Two rings encircling the wall above and below the magnet, turning opposite ways, is the answer.',
      'The prose needs a steady speed produced by a resistance that grows with speed, and the even ladder of ticks beside the spreading one shows the settling rather than asserting it.',
      'The article contrasts magnetic attraction with magnetic braking and needs a metal that a magnet will not stick to yet cannot fall freely through.',
    ],

    avoidWhen: [
      'The rule that fixes which way an induced current goes is the subject, or the sign of the opposition itself. The two rings turn opposite ways here without the rule being worked out.',
      'The size of the induced voltage is at issue — faster, more turns, a stronger magnet. No voltage appears anywhere.',
      'The article is about a wound coil, a circuit, or a current that has somewhere to be delivered. The conductor is a solid wall and the currents close within it.',
      'Speeds, times, forces or a terminal speed are wanted as numbers. The ticks carry no scale.',
      'The subject is why only some materials are attracted to magnets, or the classes of magnetic material. Both magnets here are identical and only the tube differs.',
      'The article is about resistance that grows with the square of the speed, or about a body slowed by air or liquid. The braking here comes from induction and grows in simple proportion to the speed.',
      'Heating of the metal, or where the lost energy goes, is the point. Nothing about warmth or dissipation is shown.',
    ],

    contrastWith: [
      {
        concept: 'lenzs-law',
        note: 'One states the opposing direction as a rule, in the plainest arrangement that can carry it; the other assumes the rule and asks what follows when the conductor is solid and the opposition has a whole fall to act over.',
      },
      {
        concept: 'faradays-law',
        note: 'One is about how large a voltage a change induces; the other never names a voltage and is entirely about the mechanical effect the induced current has back on the motion.',
      },
      {
        concept: 'terminal-velocity',
        note: 'Both end in a steady speed where a resistance has grown to match the weight, but one gets its resistance from a fluid pushed aside and the other from currents induced in a metal that is not touched at all.',
      },
      {
        concept: 'magnetic-materials',
        note: 'One is about metals answering a magnet only while something is moving; the other is about metals answering a magnet while everything stands still.',
      },
      {
        concept: 'energy-dissipation',
        note: 'One is a particular way of taking energy out of a motion, by inducing currents in metal; the other is the general fact that motion gives its energy up to something.',
      },
    ],
  },
};
