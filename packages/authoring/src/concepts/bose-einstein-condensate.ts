/**
 * bose-einstein-condensate 개념 선언.
 *
 * 분포 둘의 갈림 — **무엇을 주장하는가**. 이미 선언된 `maxwell-boltzmann-distribution` 은
 * 온도를 바꾸면 언덕이 **넓어지고 내려앉는다** 를 주장한다(모양은 끝까지 언덕 하나다).
 * 이쪽은 임계 온도라는 **문턱**이 있고 그 아래에서 언덕 위에 **봉우리가 새로 선다** 를
 * 주장한다 — 자리 구름이 한 점으로 무너지는 것이 같은 사건의 다른 쪽 얼굴이다.
 *
 * 이웃 `pauli-exclusion` 과도 갈랐다 — 그쪽은 「한 상태에 하나씩」 이고 이쪽은 「한 상태에
 * 다 같이」 다. 준위 사다리 · 채움 어휘를 쓰지 않는다(화면에도 없다).
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const boseEinsteinCondensateConcept: Aperi21ConceptSource = {
  id: 'bose-einstein-condensate',
  label: 'Crowding into the Single Lowest State Below a Critical Temperature',
  canonicalSim: 'aperi21:bose-einstein-condensate',

  surface: {
    definition:
      'Below a critical temperature, bosonic atoms crowd into the single lowest state: the trapped cloud collapses to a point and a spike rises in their velocity distribution.',
    exemplarKeywords: [
      'Bose–Einstein condensate',
      'the fifth state of matter',
      'atoms all in the same quantum state',
      'the 1995 rubidium experiment',
      'what happens to matter a billionth of a degree above absolute zero',
      'bosons piling into the ground state',
      'condensing in velocity rather than into a liquid',
      'the famous peak picture from JILA',
      'a critical temperature below which the condensate appears',
      'nearly every atom doing the same thing at once',
      'why cold atoms stop behaving like a gas',
    ],
  },

  briefing: {
    observable: [
      'Three panels stand side by side: a thermometer on the left, the atoms held in a trap in the middle, and their velocity distribution on the right.',
      'The thermometer carries one mark only, the critical temperature, and it is there from the first moment, so the eye waits for the falling level to cross it.',
      'Six hundred atoms are drawn as dots that keep circling inside the trap the whole time; nothing on the picture is ever still.',
      'While the level is still above the mark the cloud simply draws in and the curve beside it simply narrows — one rounded hill that keeps its shape.',
      'Once the level passes the mark, atoms begin peeling off one after another and are drawn into the middle of the cloud, where they pile into a dense clump.',
      'At the same moment a narrow spike starts rising out of the middle of the curve, and a phrase appears beside it naming it as the single lowest state.',
      'There is a stretch where both are there at once: a wide hill with a spike standing on it, and a cloud that is thin at the edges with a knot at the centre.',
      'Cooled further, the hill drains away, the outer dots thin to almost nothing, and the curve becomes one sharp spike reaching the top of its panel.',
      'The atoms that have joined the clump barely move, while those still outside go on circling as before, and they are all drawn in the same colour — no atom is marked as having changed.',
      'The picture then fades and the whole cooling starts over from a hot cloud.',
      'Nothing carries a figure: no temperature, no share as a percentage, no scale up the side of the curve. The only named level anywhere is the critical one.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The cooling, the two pauses and the fade run in that order by themselves and the round repeats.',
        'It opens with the cooling already under way, so the first thing seen is a cloud drawing in rather than a still hot gas.',
        'The cloud panel and the curve panel are set to the same horizontal scale, since position and velocity narrow together for atoms held in a trap.',
        'Both are shown rather than the curve alone, because the claim reads two ways — a cloud falling in on its middle, and a spike standing up in a distribution.',
        'The spike is drawn wider than it truly is, so that the hill beside it still has room to be seen; what the picture measures is the change of shape, not the ratio of the widths.',
        'Atoms cross into the clump over a spread of moments rather than all together, which is what makes it read as being drawn in rather than jumping.',
        'The height of the curve is what says how many have crowded in, since a stack of dots at one spot cannot be made darker.',
        'Everything is timed off the cooling itself, so during a pause the picture genuinely holds still at that temperature.',
      ],
    },

    useWhen: [
      'The article has said that cooling slows atoms down and the reader has concluded that a very cold gas is just a slower gas. The hill narrowing and then a spike appearing is the difference.',
      'The phrase “a large number of particles in one and the same state” has been used and needs to be something seen rather than asserted. The clump at the middle of the cloud is that number.',
      'The critical temperature has to read as a genuine threshold rather than a gradual change: above the mark the shape only narrows, below it a new feature appears.',
      'The article refers to the 1995 experiment or to the picture that came out of it, and the reader needs to know what that picture is showing.',
    ],

    avoidWhen: [
      'The subject is why only some particles can do this — the counting rule, the statistics, or what separates the two families of particles.',
      'The article is about flow without friction, vortices, or anything the condensate does once it exists. What is shown is its forming.',
      'The point is how such temperatures are reached: laser cooling, evaporative cooling, or the apparatus that holds the atoms.',
      'The subject is a gas turning into a liquid or a solid, a change of state at an ordinary temperature, or heat given up in the process.',
      'Interactions between the atoms matter, or what the cloud does after the trap is switched off and it is let go.',
      'A figure is wanted: a temperature in nanokelvin, the fraction condensed as a percentage, the number of atoms, or the power in the law that governs it.',
    ],

    contrastWith: [
      {
        concept: 'maxwell-boltzmann-distribution',
        note: 'Both watch a distribution of speeds change with temperature, but one has it widen and flatten while keeping one shape, and the other has a second, far narrower feature appear below a threshold.',
      },
      {
        concept: 'kinetic-theory-of-gases',
        note: 'One treats a gas as many independent particles whose separate effects add up; the other is about the point at which that picture fails because a great many of them stop being independent.',
      },
      {
        concept: 'phase-diagram',
        note: 'Both are about a substance changing its character at a definite condition, but one sorts the familiar states by pressure and temperature, and the other is a change of state that happens in how the particles are distributed rather than in how they are packed.',
      },
      {
        concept: 'de-broglie-wavelength',
        note: 'One gives a moving particle a wavelength that grows as it slows; the other is what a whole cold population does, which is the reason the first one matters at these temperatures.',
      },
      {
        concept: 'pauli-exclusion',
        note: 'The two are opposite rules about sharing a state: one forbids a second occupant outright and pushes the rest upward, while the other has a great many particles settle into the one lowest state together below a threshold temperature.',
      },
    ],
  },
};
