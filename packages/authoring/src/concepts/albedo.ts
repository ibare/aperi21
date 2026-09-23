/**
 * albedo 개념 선언.
 *
 * 들어온 빛과 온도 넷 중 하나. 주어를 **표면**으로 잡았다 — 주장은 닿은 빛 가운데
 * **되돌아가는 몫이 표면마다 다르다** 이고, 남은 것이 온도를 올린다는 데서 멈춘다.
 * 나가는 복사도, 멎는 온도도 화면에 없다(`radiative-equilibrium` · `greenhouse-effect` 의 몫).
 * 이쪽만 「되튄다 · 몫 · 밝기 · 눈이 녹아 바다」 어휘를 갖는다.
 *
 * `insulation` 과도 갈랐다 — 저쪽은 **이미 가진 열이 새 나가는** 빠르기, 이쪽은
 * **닿은 빛 중 아예 받아들이지 않는** 몫이다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const albedoConcept: Aperi21ConceptSource = {
  id: 'albedo',
  label: 'Albedo as the Share Sent Back',
  canonicalSim: 'aperi21:albedo',

  surface: {
    definition:
      'The share of arriving light a surface throws back instead of taking in, high over bright snow and low over dark water, with only the kept share warming the ground.',
    exemplarKeywords: [
      'albedo',
      'why does snow stay cooler than bare ground in the same sun',
      'dark surfaces soak up more sunlight',
      'how much sunlight bounces off a surface',
      'white roofs to keep a building cool',
      'melting ice uncovers dark ocean underneath',
      'ice-albedo feedback',
      'reflectivity of the ground',
      'why people wear light colours in summer',
      'the fraction of sunlight reflected away',
    ],
  },

  briefing: {
    observable: [
      'Four strips of ground lie side by side — snow, desert, forest and ocean — under one slanting sunlight, and the very same numbered grain of light arrives on all four at the same instant, differing only in where it lands.',
      'A grain that is sent back turns and climbs away out of the top of the sky, its streak now trailing the other way; a grain that is kept sinks into the surface and fades there.',
      'Over the snow many grains climb away and few sink; over the ocean almost every grain sinks.',
      'Each kept grain is one step of that strip’s bar, so the four bars pull apart in order — lowest over snow, then desert, then forest, highest over ocean.',
      'The brightness of each surface is itself the share it sends back, so the strips run from near white to nearly black in the same order, and the share is written beside each name as the figure it was given.',
      'Then the snow strip darkens until it matches the ocean, its label goes, and an open-sea label with the ocean’s own share rises in its place; from then on fewer grains climb away from that strip and its bar rises more steeply than before.',
      'The bars empty and snow covers the melted patch again for the next round.',
      'Nothing counts the grains out loud — how many came back and how many were kept is read off the sky and off the height of the bars, and the only figures on the screen are the four shares that were declared.',
      'No grain ever leaves a surface after being kept: nothing is drawn going back out once it has sunk in.',
    ],

    screen: {
      affordances: [
        'One round runs from the light falling, through the four bars separating, through the snow melting and the bar climbing faster, back to fresh snow; nothing has to be pressed.',
        'All four strips are given identical light at identical moments, which is what lets the difference in the bars be laid at the door of the surfaces alone.',
        'Whether a grain is sent back or kept is settled so that, over any stretch, the number sent back matches the declared share to within a single grain — otherwise a short stretch could show desert turning back more than snow.',
        'Sky, sunlight and ground are painted in brightness rather than in any colour of their own, so the white grains stay visible on a light background and the surface darkening as it melts is the share falling.',
        'A climbing grain is not given a colour or a shape of its own; what says it is going up rather than down is which way its streak trails.',
        'The moment the snow is lost and the moment the open sea is named are kept apart, so that the two labels never cross over one another.',
      ],
    },

    useWhen: [
      'The article has said that surfaces differ in how much sunlight they reflect, and the reader has no feel for the size of the difference. Four strips under identical light, with the sky above the snow full of returning grains and the sky above the sea almost empty, is what gives it a size.',
      'The point being made is the feedback that comes with melting — that losing a bright cover exposes a darker one, which then takes in more — and the bar over the melted patch climbing faster than before is that step made visible.',
    ],

    avoidWhen: [
      'The subject is the temperature a sunlit body ends up at, or where its warming stops. Nothing radiates away here and nothing settles; the bars climb for as long as the light keeps arriving, and carry no degrees.',
      'The article is about a layer in the air absorbing infrared and sending it back down. The only thing sent back here is the arriving sunlight itself, and it is sent back by the ground.',
      'The point is how quickly something already warm loses its heat, or what is wrapped round it. Nothing here cools at all.',
      'The article is about light bouncing off a mirror at an angle, or about how images form. Reflection here is a fraction of many grains, not the path of a single ray.',
      'The subject is why a warm surface gives off radiation of its own, or how much it gives off. Every grain on the screen came from the sun.',
    ],

    contrastWith: [
      {
        concept: 'radiative-equilibrium',
        note: 'One asks how much of the arriving light is taken in at all; the other takes that intake as settled and asks what temperature it leads to once the body is also radiating away.',
      },
      {
        concept: 'greenhouse-effect',
        note: 'Both turn on something being sent back, at opposite ends of the exchange: one has sunlight turned away before it is ever absorbed, the other has the ground’s own radiation returned to it after the fact.',
      },
      {
        concept: 'insulation',
        note: 'One is about refusing energy at the surface before anything is warmed; the other is about holding on to energy a body already has.',
      },
      {
        concept: 'thermal-radiation',
        note: 'One follows radiation arriving at a surface and being turned away or taken in; the other follows radiation crossing the gap to get there in the first place.',
      },
    ],
  },
};
