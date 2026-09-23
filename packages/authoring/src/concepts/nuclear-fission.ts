/**
 * nuclear-fission 개념 선언.
 *
 * 붕괴 넷 가운데 **맞아서 갈라지는 한 번의 사건** 쪽이고, 연쇄 둘 가운데 **한 번** 쪽이다.
 *   radioactive-decay  저절로, 무리로, 시간에 걸쳐 줄어드는 것
 *   nuclear-fission    중성자 하나를 삼킨 U-235 가 흔들리다 늘어나 두 조각과 중성자 셋으로
 *                      갈라지고 조각이 서로 밀어내며 날아간다 — 알갱이 수는 그대로다
 *   chain-reaction     나온 중성자가 **다음** 분열을 부르는 것, 세대마다 k 배
 * 이쪽만 흔들림 · 아령 · 알갱이 장부(235+1=141+92+3) · 반발 어휘를 갖는다. 다음 분열은 여기
 * 없고(중성자는 화면 밖으로 흘러간다), 에너지가 어디서 오는지는 `binding-energy-curve` 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const nuclearFissionConcept: Aperi21ConceptSource = {
  id: 'nuclear-fission',
  label: 'One Fission Event of Uranium-235',
  canonicalSim: 'aperi21:nuclear-fission',

  surface: {
    definition:
      'What happens when a uranium-235 nucleus takes in a slow neutron: it wobbles, stretches into a dumbbell and breaks into barium-141, krypton-92 and three neutrons that fly apart.',
    exemplarKeywords: [
      'nuclear fission',
      'splitting a uranium nucleus',
      'uranium-235 absorbing a neutron',
      'barium and krypton as fission products',
      'about two hundred MeV per fission',
      'the neutrons released when a nucleus splits',
      'the liquid drop picture of a nucleus breaking',
      'fragments flying apart and repelling each other',
      'what triggers a nucleus to split',
      'the nucleon count on both sides balances',
      'a heavy nucleus made to break in two',
    ],
  },

  briefing: {
    observable: [
      'A single dark body sits at the centre with its name written above it: the letter and the mass number.',
      'A small grey particle, marked with its own letter, comes in slowly from the left, goes into the body and disappears there. The mass number above changes by one.',
      'The body then wobbles — tall, then wide, then tall again — and each swing is wider than the last, three times over, ending on its way to wide.',
      'That last swing carries straight on into a stretch: the body draws out sideways into a capsule, then the middle narrows into a waist, and the waist pinches until the two lobes meet at a single point. The left lobe is visibly bigger than the right.',
      'They part. Starting from rest, the two pieces gather speed as they move away, and a highlighted arrow grows behind each one as it goes. Each gets its own name, the lighter one carrying the longer arrow.',
      'From the place the waist gave way, three grey particles shoot out at angles, each with a short tail and its own letter.',
      'The whole picture then slows to a fraction of its pace. A line of figures appears along the top reading the count before against the counts after, and a figure for the energy released appears between the receding pieces.',
      'Nothing stops while those are being read — the pieces and the particles keep travelling in the slowed picture.',
      'From one round to the next the three particles go off at somewhat different angles.',
      'The body is drawn as one mass throughout rather than as a heap of separate particles, and the counts are carried entirely by the line of figures.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The approach, the wobble, the stretch and the break run on their own and the round repeats.',
        'The nucleus is drawn as one body, so that the breaking is what reads first; the particle bookkeeping is left to the line of figures rather than to anything to be counted on screen.',
        'The highlight means the energy released, and it marks both the speed arrows and the figure, tying the two together.',
        'The pieces start from rest and speed up as they separate, since moving off at a steady rate would not show them pushing each other away.',
        'The heavier piece carries the shorter arrow, because the two go off with equal and opposite momentum.',
        'The bigger lobe forms on the same side as the heavier piece, and its size follows from how many particles it holds.',
        'The picture is slowed rather than frozen while the figures are read, so that the pieces are still travelling when the energy is named.',
        'The waist is drawn narrowing continuously from a single body down to a touching point, so the break has a middle rather than being a cut.',
        'The angles of the three particles are drawn afresh each round, so nothing about the event looks like a fixed diagram.',
        'The speeds are drawn slowed; the incoming particle being slower than the outgoing ones is the only thing about pace meant to be read.',
        'It opens with the incoming particle already on its way.',
      ],
    },

    useWhen: [
      'The article has said that this kind of splitting has to be set off and the reader needs the trigger and the break to be one continuous sequence rather than two facts.',
      'The point is that the particle count balances while the energy does not come from nowhere. The line of figures is put up beside the figure for the energy.',
      'The article needs the energy to appear as something: the pieces start from rest and gather speed, with the arrows growing as they go.',
      'The reader should see the middle of the event. The nucleus is not cut in two but wobbles ever wider and stretches until the waist gives way.',
      'The point is that more neutrons come out than went in, and the reader needs to count them leaving.',
    ],

    avoidWhen: [
      'The subject is what the released neutrons go on to do, whether the reaction sustains itself, or reactors and bombs.',
      'The article is about where the energy comes from in terms of how tightly nuclei are bound.',
      'The subject is a nucleus coming apart of its own accord, or how long a population of them takes to thin out.',
      'The point is what a nucleus is called, how nuclide notation works, or which element is which.',
      'The subject is two light nuclei joining rather than a heavy one breaking.',
      'The figures wanted are the mass defect, how the energy is divided among the products, or the chance of a neutron being captured.',
    ],

    contrastWith: [
      {
        concept: 'chain-reaction',
        note: 'One follows a single event from the trigger to the pieces flying apart; the other treats each such event as a point and asks how many follow from one.',
      },
      {
        concept: 'binding-energy-curve',
        note: 'One shows the event and names the energy that comes out of it; the other explains why there is any energy to come out, as a height gained on a curve.',
      },
      {
        concept: 'radioactive-decay',
        note: 'One is a nucleus made to break by something striking it, at a moment set by that arrival; the other a crowd of nuclei going of their own accord at moments nothing sets.',
      },
      {
        concept: 'nuclear-structure',
        note: 'One breaks a nucleus into two large pieces and balances the particle count across the break; the other alters a nucleus one particle at a time and watches its name.',
      },
      {
        concept: 'decay-types',
        note: 'One is a nucleus broken into two comparable halves by something striking it; the other the light particles and rays that leave a nucleus and travel away from it.',
      },
    ],
  },
};
