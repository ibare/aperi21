/**
 * rutherford-scattering 개념 선언.
 *
 * 핵 둘의 갈림 — **무엇을 주장하는가**. 이웃 `nuclear-structure` 는 핵 **안**을 주장한다
 * (무엇이 몇 개 들었나). 이쪽은 핵 **바깥에서 쏘아 넣은** 입자가 어떻게 되는지만 주장한다 —
 * 거의 다 곧게 지나가고 드물게 하나가 되튀며, 그것이 양전하가 아주 작은 자리에 몰려 있다는
 * 증거다. 양성자 · 중성자 · 핵자 수 어휘를 쓰지 않는다(화면에도 없다).
 *
 * 이미 선언된 `scattering`(빛이 알갱이 크기에 따라 흩어짐)과 낱말이 겹치므로
 * exemplarKeywords 를 겨냥 · 되튐 · 금박 쪽으로만 세웠다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rutherfordScatteringConcept: Aperi21ConceptSource = {
  id: 'rutherford-scattering',
  label: 'Most Pass Straight Through, a Rare One Turns Back',
  canonicalSim: 'aperi21:rutherford-scattering',

  surface: {
    definition:
      'Alpha particles fired at gold: nearly all pass almost unbent, while the rare one aimed closest turns back past a right angle, placing the positive charge in one tiny spot.',
    exemplarKeywords: [
      'Rutherford scattering',
      'the gold foil experiment',
      'Geiger and Marsden',
      'as if a shell had bounced back off tissue paper',
      'how the nucleus was discovered',
      'alpha particles deflected through large angles',
      'the plum pudding model ruled out',
      'most of an atom is empty space',
      'bouncing straight back is very rare',
      'how close the aim is decides how much the path bends',
      'firing something at an atom to find out what is inside',
    ],
  },

  briefing: {
    observable: [
      'A single gold nucleus sits at the centre, ringed by a circle that serves as a scale of directions, with one tick on it marked at ninety degrees.',
      'Alpha particles arrive from the left edge in a narrow beam, one after another, about thirty of them in a round.',
      'Their paths curve by different amounts: the ones that come in well off to the side barely bend at all, and the nearer a particle passes the nucleus the more its path turns.',
      'A particle close to the nucleus visibly slows as it comes up to it and speeds away again once past, because it is being pushed the whole way.',
      'As each one crosses the ring, a dot is added to the wedge matching the direction it is now travelling, so the wedges build into heaps.',
      'The heaps straight ahead and within ten degrees of it grow tall while the wedges to either side collect one or two dots each.',
      'Once the beam stops, one last particle flies in alone and the picture slows down for it: it is aimed dead at the nucleus, it stalls just in front of it, and it turns and goes back the way it came.',
      'A single dot lands in a wedge past the ninety-degree tick — one dot behind against a tall pile in front.',
      'Paths already flown stay on faintly inside the ring, so by the end there is a narrow fan of near-straight lines and one line that doubles back on itself.',
      'Particles, nucleus and dots are all drawn in the same ink; nothing is coloured to mark it as the interesting one.',
      'Nothing is counted out in writing — no tally, no proportion, no angle read off. The tall heap and the lone dot are the whole of the arithmetic.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. A round of particles is fired, the close one comes in last, the heaps are held for a moment, and it starts again with a fresh draw.',
        'It opens with particles already arriving and a few dots already stacked, rather than with an empty picture waiting for the first one.',
        'The aims are spread evenly across the width of the beam rather than drawn at random, so that exactly one particle per round comes close enough to turn back; drawn at random, whole rounds would pass with nothing to see.',
        'The close approach and the turn are played slower than the rest, because at the speed of the others they would be over in a fraction of a second.',
        'A dot is placed by the direction the particle is travelling when it crosses the ring, not by the spot on the ring it crossed, since a particle that entered off to the side crosses off to the side even when it has not bent.',
        'The push from the nucleus is drawn far stronger relative to the width of the beam than it is in the real experiment, so that a turn-back appears among thirty particles rather than among thousands.',
        'The ring is a scale of directions rather than a screen around the target, which is why the beam is allowed to cross it on the way in.',
        'How rare the turn-back is comes across through the shape of the paths and the height of the heaps, never through a colour marking one path out.',
      ],
    },

    useWhen: [
      'The article has told the experiment as an anecdote and the reader needs “most passed, a few came back” as a frequency they can see rather than a phrase they are asked to accept.',
      'The point is that one observation overturned a model, and the observation has to be on the page before the conclusion drawn from it.',
      'The reader has taken “deflected” to mean that every particle got nudged a little. The narrow fan and the single doubled-back path is the correction.',
      'The article needs the link between how close a particle is aimed and how sharply it turns, since that link is what puts the charge in a small place rather than a large one.',
    ],

    avoidWhen: [
      'The subject is what a nucleus is made of or how many of each thing it holds. What is shown is a single point that pushes, and nothing about its contents.',
      'The article is about electrons — where they sit, the orbits they take, the levels they jump between, or the light that comes of it.',
      'The point requires the older model to be drawn alongside for comparison. Only what actually happens is drawn; the contrast is left to the prose.',
      'A figure is wanted: the fraction that comes back, a cross-section, the size of the nucleus, or the energy of the particles.',
      'The subject is where alpha particles come from, the material that emits them, or the danger they pose.',
      'The article is about waves or light being turned aside, or about a pattern formed by many paths interfering.',
    ],

    contrastWith: [
      {
        concept: 'coulombs-law',
        note: 'One states how the push between two charges falls off with their separation; the other fires something past a charge and reads what that push does to its path.',
      },
      {
        concept: 'scattering',
        note: 'Both share the word, but one is about light being thrown off particles of different sizes, and the other about charged projectiles turned aside by a single charge.',
      },
      {
        concept: 'compton-scattering',
        note: 'Both fire something at a target and ask where it goes, but one is about what a photon loses in the encounter and the other about what the spread of directions says about the target’s size.',
      },
      {
        concept: 'millikan-experiment',
        note: 'Both settle a fact about charge by gathering many separate results into a pattern; one finds that charge comes in whole steps, the other that positive charge sits in one tiny place.',
      },
    ],
  },
};
