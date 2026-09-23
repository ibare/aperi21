/**
 * supernova-and-neutron-star 개념 선언.
 *
 * 별의 일생 넷 중 하나. 이쪽만 **끝의 1 초**를 확대한다 — 시간을 늦춘 단면이다.
 *   supernova-and-neutron-star      받침을 잃고 **무너졌다 튕긴다** — 남는 것은 작고 빽빽한 점
 *   stellar-nucleosynthesis         그 받침이 왜 사라지는가 — 철에서 곡선이 멎는다
 *   star-radiation-gravity-balance  받침이 있을 때 **되돌아간다**
 *   star-life-cycle                 이 끝이 **어느 질량의 것인가**
 * 이쪽만 쏟아짐 · 꼬리 뒤집힘 · 충격파 고리 · 과장 배율 어휘를 갖는다. 원소 · 곡선 ·
 * 화살표 · HR 도라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const supernovaAndNeutronStarConcept: Aperi21ConceptSource = {
  id: 'supernova-and-neutron-star',
  label: 'Core Collapse, Rebound and the Remnant Left Behind',
  canonicalSim: 'aperi21:supernova-and-neutron-star',

  surface: {
    definition:
      'The last second of a massive core: robbed of support it falls to city size, the material raining onto it rebounds outward, and a tiny dense remnant stays.',
    exemplarKeywords: [
      'core collapse supernova',
      'what happens inside an exploding star',
      'the core falls in and the outer layers bounce off',
      'shock wave blows the star apart',
      'neutron star left at the centre',
      'a teaspoon of neutron star weighs a mountain',
      'the size of a city and the mass of the Sun',
      'why does a dying star explode outward if it is collapsing',
      'infall and rebound',
      'remnant of a massive star',
    ],
  },

  briefing: {
    observable: [
      'A dark disc at the centre stands for the core, tagged as being about the size of a planet, and specks of material fill the frame around it right out past the edges so that no surface of the star is ever in view.',
      'For a while nothing at all moves, while the wording says there is nothing left to burn and the support is gone.',
      'The disc then shrinks, slowly at first and faster as it goes, leaving a dashed ring behind at the size it used to be.',
      'The specks nearest the disc grow inward-pointing tails and rain down after it, while specks further out are still barely stirring — how late a speck sets off depends on how far out it was.',
      'The shrinking stops at a small point, and from its surface a ring in the second colour appears and widens outward.',
      'As that ring passes them, the tails of the specks behind it flip from pointing inward to pointing outward, so a single frame holds material still falling in beyond the ring and material already thrown out inside it.',
      'The ring widens past the edges of the frame and the specks sweep away in all directions as a thick shell, emptying the view.',
      'What is left in the middle is one small point with three lines of text beside it: what it is, how wide and how heavy it is, and the plain statement that it has been drawn many times over size so as to be visible at all.',
      'The dashed ring marking the core before the fall stays on screen to the end, with its own name on it, so the before and after sizes can be set side by side.',
      'The collapse and the rebound are played far slower than they happen, and the wording says as much rather than leaving the pace to be taken literally.',
    ],

    screen: {
      affordances: [
        'The stillness, the fall, the rebound, the sweeping out and the reveal follow one another by themselves and then begin again.',
        'The picture opens on the intact core with a moment of stillness before the fall, so the starting size is established before it is lost.',
        'The specks are laid out more thickly toward the middle, which is both how the material of a star is arranged and what makes the raining-in readable.',
        'The second colour is used for the widening ring alone; the core and the remnant share one colour because they are the same object.',
        'No clock and no elapsed time is displayed — the sub-second span is said in words and the slowing is admitted in a parenthesis.',
        'The remnant’s width, mass and the factor by which it has been enlarged are the declared values themselves, printed rather than approximated.',
      ],
    },

    useWhen: [
      'The reader has been told that a star explodes by collapsing and cannot make the two halves agree. Seeing the tails flip from inward to outward as the ring passes is what joins them.',
      'The article states how small and how dense the remnant is, and a picture is needed in which the before and after sizes are both present and the enlargement is openly declared rather than quietly assumed.',
    ],

    avoidWhen: [
      'Which masses end this way, or how this ending compares with the quiet one, is the point. Only one core is shown and no mass is named.',
      'The article is about the elements made in the blast or about how the core came to be iron in the first place. No material is named or symbolised anywhere.',
      'What was holding the core up is to be shown rather than stated. The picture opens after the support is already gone and draws nothing pushing or pulling.',
      'The brightening seen from far away — the light curve, how bright such an event gets, how it is spotted — is the subject. The view never leaves the neighbourhood of the core.',
      'A black hole, or what settles which remnant is formed, is required. One outcome is shown and no fork is offered.',
      'The later refinements matter — a shock that stalls and is revived, material falling back, how long the whole thing really takes. The ring here spreads straight out without hesitating.',
      'The reader should vary a mass or a density and see a different ending. The sequence runs through unchanged each time.',
    ],

    contrastWith: [
      {
        concept: 'star-life-cycle',
        note: 'One magnifies a single second and fills the frame with it; the other passes that second in an instant because its subject is the whole span on either side.',
      },
      {
        concept: 'stellar-nucleosynthesis',
        note: 'One begins where the core fire has gone out; the other is about why the fire had to go out, and stops before anything falls.',
      },
      {
        concept: 'star-radiation-gravity-balance',
        note: 'One is the case where the outward side is gone for good; the other is the case where it is only disturbed, and the object finds its way back.',
      },
      {
        concept: 'explosion-and-recoil',
        note: 'Both watch matter thrown outward in all directions from one place, one from a rebound off a body that stops shrinking and one from a store released between parted pieces.',
      },
    ],
  },
};
