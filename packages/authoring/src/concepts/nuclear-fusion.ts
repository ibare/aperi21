/**
 * nuclear-fusion 개념 선언.
 *
 * 이 묶음에서 질량 ↔ 에너지를 말하는 형제는 `antimatter` 다. **무엇이 없어지는가**로 갈랐다.
 *   nuclear-fusion  두 핵이 합쳐지고 알갱이는 남는다 — 없어지는 것은 **질량의 일부**(0.4 %)다.
 *                   저울에 단 막대와 ×100 확대창이 그 몫을 보인다
 *   antimatter      두 입자가 **통째로** 없어진다 — 남는 것은 광자 둘뿐이다
 * 이쪽만 중수소 · 삼중수소 · 질량 결손 · u · MeV · 「반응 뒤가 더 가볍다」 어휘를 갖는다.
 * 결합 에너지 곡선 · 쿨롱 장벽 · 높은 온도는 화면에 없으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const nuclearFusionConcept: Aperi21ConceptSource = {
  id: 'nuclear-fusion',
  label: 'Mass Going Missing When Light Nuclei Merge',
  canonicalSim: 'aperi21:nuclear-fusion',

  surface: {
    definition:
      'Where the energy of a merger between light nuclei comes from: the two that go in weigh more than the two that come out, and the missing fraction of mass is what flies away as energy.',
    exemplarKeywords: [
      'nuclear fusion',
      'deuterium and tritium making helium',
      'mass defect of a reaction',
      'the products weigh less than what went in',
      'mass turning into energy',
      'seventeen point six MeV from one merger',
      'fusion fuel',
      'joining light nuclei rather than splitting heavy ones',
      'atomic mass units and the fraction that disappears',
      'why does a merger release anything at all',
      'weighing a nuclear reaction before and after',
    ],
  },

  briefing: {
    observable: [
      'Two nuclei come together from the left, each drawn as its nucleons and carrying its symbol and its mass written out to six decimal places — one holds a proton and a neutron, the other a proton and two neutrons.',
      'In the middle a tall bar stacks the two masses one on the other and is named as the state before the reaction; a thin band across its top end is tied by two dotted lines to a window on the right, and that window is marked as a hundredfold enlargement.',
      'The five nucleons draw together into one clump, and a second bar appears beside the first for the state after — a helium nucleus with a neutron on top of it.',
      'In the enlarged window the top of the after bar is filled in the accent colour right up to the height the before bar reached, so the two bars agree at the scale of the whole picture and differ only inside the window.',
      'The helium then drifts slowly down to the right while the neutron shoots up to the left, and accent arrows grow out behind each of them.',
      'At exactly the same pace, the accent sliver in the window shrinks away to nothing and leaves a dotted outline where it stood — the arrows grow by as much as the bar loses, and that pairing is the whole claim.',
      'The after sum is then written out, a dimension line measures the difference between the two bars and names it, and an accent line reads that the difference has gone to energy in MeV.',
      'Each arrow carries its own share at its tip, and the faster, lighter particle has by far the larger one.',
      'Seen at the scale of the whole bars the two heights still look the same; only the window shows that they are not.',
      'Everything from the reaction then withdraws and the next pair of nuclei takes up the starting position.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. One reaction runs from the approach to the reading of the figures and the round begins again.',
        'The full-height bars and the enlarged window stand side by side, because the loss is four parts in a thousand and would be under a pixel on the bars alone; the window on its own would read as a large loss, and the bars on their own would show no loss at all.',
        'The enlargement is stated on screen as a factor, and the two dotted lines say which sliver of the bar the window is looking at.',
        'The accent colour carries one meaning only — the mass that is turning into energy and the energy it becomes — so the shrinking sliver and the growing arrows are read as one event rather than two.',
        'Protons and neutrons are told apart by filled against hollow circles rather than by colour.',
        'Each arrow is drawn at a length proportional to that particle’s share of the energy, and the distances the two travel follow from their speeds, so the light one runs about four times as far as the heavy one.',
        'The masses are written to six decimal places, because rounding them further would leave the sum on screen disagreeing with its own addition.',
        'Nothing is drawn to hold the two nuclei apart and nothing is said about it; they simply approach and touch.',
      ],
    },

    useWhen: [
      'The article has said that fusion releases energy and the reader takes that on trust without any picture of where it comes from. A balance struck before and after, with the shortfall measured and named, is what turns the claim into an accounting.',
      'The prose needs the smallness of the loss and the size of the energy to be held together in one thought. The full bars saying "the same" and the enlargement saying "not quite" is that pair of readings in one frame.',
      'The reader should see that the energy leaves as motion rather than as a glow — two particles flying apart, each with its own share written at the tip of its arrow.',
    ],

    avoidWhen: [
      'The subject is a heavy nucleus coming apart, or neutrons setting off further reactions. One merger runs here and nothing is broken.',
      'The article turns on the curve of binding energy per nucleon, or on why iron sits at its bottom. No curve is drawn; a single reaction is weighed.',
      'The point is why fusion is hard to bring about — repulsion between the nuclei, the temperatures required, or confinement. The two nuclei here simply approach and touch, and nothing on screen speaks of what would prevent it.',
      'The article is about how elements were built up inside stars, or about a sequence of reactions. One reaction is shown, with no star and no chain.',
      'A yield per kilogram, a reactor output or an efficiency is wanted. The only figures are the masses of one reaction, their difference and the energy that difference amounts to.',
      'The subject is radioactive decay or the particles a nucleus emits on its own. Nothing here decays; two nuclei are brought together.',
    ],

    contrastWith: [
      {
        concept: 'antimatter',
        note: 'One loses a small fraction of the mass while the particles themselves survive and fly apart; the other loses the particles entirely, so that nothing of them is left except the radiation.',
      },
      {
        concept: 'pair-production',
        note: 'Both put mass and energy on the same books, but one runs the exchange from mass to energy in a reaction that leaves particles behind, and the other runs it the other way, with a photon disappearing and matter appearing in its place.',
      },
      {
        concept: 'stellar-nucleosynthesis',
        note: 'One weighs a single merger and asks what the shortfall in mass is worth; the other is about the succession of mergers by which heavier elements are built up, and about where in a star each one happens.',
      },
      {
        concept: 'star-radiation-gravity-balance',
        note: 'One is the source of the energy, taken one reaction at a time; the other is what that energy does once it is being made — holding a star open against its own weight.',
      },
      {
        concept: 'nuclear-fission',
        note: 'One joins two light nuclei, with every particle surviving and a fraction of the mass gone; the other has a heavy nucleus made to break by a neutron striking it, with the particle count balancing across the break.',
      },
      {
        concept: 'binding-energy-curve',
        note: 'One weighs a single merger and finds the energy in the mass that went missing; the other never weighs anything and locates the same energy as a height gained on a comparison across nuclei, which is why joining light ones and splitting heavy ones both give something up.',
      },
    ],
  },
};
