/**
 * pv-diagram 개념 선언.
 *
 * 과정 다섯 중 하나. 다섯이 전부 P-V 그림 위에서 벌어져 definition 이 붙기 쉽다.
 * **무엇을 주장하는가**로 갈랐다.
 *   pv-diagram          **길** — 같은 두 상태 사이라도 길에 따라 넓이가 다르다
 *   isothermal-process  **열의 행방** — 들어온 만큼 모두 일로 나간다
 *   adiabatic-process   **열을 막으면** — 등온보다 가파르고 식는다
 *   isobaric-isochoric  **무엇을 고정하면** — 가로와 세로로 갈리고 한쪽만 넓이가 있다
 *   cyclic-process      **닫으면** — 상태는 돌아오는데 고리 넓이는 남는다
 * 이쪽만 두 길 · 같은 A 와 같은 B · 띠 수 · 올라간 추 수 어휘를 갖는다. 곡선 모양 ·
 * 온도 · 열의 출입은 형제들에게 넘겼다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const pvDiagramConcept: Aperi21ConceptSource = {
  id: 'pv-diagram',
  label: 'Work as the Area Under a Path',
  canonicalSim: 'aperi21:pv-diagram',

  surface: {
    definition:
      'A pressure–volume plot on which the work a gas does is the area beneath the path it takes, so two routes between the same two states do unequal work.',
    exemplarKeywords: [
      'PV diagram',
      'work is the area under the curve',
      'does the work depend on the path taken',
      'same start and same end but different work',
      'pressure volume graph of a gas',
      'area beneath the process line',
      'reading work off a pressure volume plot',
      'work done by an expanding gas',
      'path dependence of work',
      'why work is not fixed by the two end states',
    ],
  },

  briefing: {
    observable: [
      'A pressure–volume plot on the left and an upright cylinder on the right, the gas held down by a stack of weights on a tray above the piston.',
      'There is nothing above the tray and the piston is treated as weightless, so the pressure is simply the number of weights sitting on it — one step up the upright axis is one weight.',
      'On the first run a marker leaves the starting state with all three weights on, travelling rightward as the gas is heated; beneath its path a band fills in the accent colour, and fine lines divide that band into three, one per weight.',
      'Then the volume is held while the gas is cooled: the marker drops straight down as the weights slide off one at a time onto an upper ledge, and nothing further fills.',
      'The second run begins from the same starting state, but now two weights slide off onto a lower ledge first — the marker drops with nothing filling — and only then is the gas heated with a single weight left on, so the marker runs rightward and one band fills.',
      'Through the second run the first run’s three bands remain as a dashed outline and the weights it left high remain as dashed empty places, so three against one is set out on a single picture.',
      'Both runs finish at the same end state. A marker reading `W` appears in the middle of the filled area once it has stopped growing.',
      'The two ledges stand at the tray’s starting height and its finishing height, so a weight left on the upper ledge is one that was carried up and a weight on the lower one is not.',
      'The closing line names the counts — three weights raised and three bands shaded on one route, one and one on the other.',
      'A single plate beneath the cylinder is named for what it is doing at that moment, heating or cooling, rather than there being two devices.',
      'No values in kilopascals, litres or joules appear, and neither axis carries numbers.',
    ],

    screen: {
      affordances: [
        'Both routes play through on their own, one after the other, with nothing to press; the first route is left dashed underneath the second rather than the two being set side by side, which keeps the plot at full size.',
        'Counting the fine bands inside the filled area and counting the weights that ended up high give the same number, and that agreement is what ties an area to an amount of work.',
        'The accent colour is spent on the filled area alone, so the path, the marker, the weights and the cylinder walls all stay plain.',
        'The two routes are built from the very same pair of moves — one widening and two lowerings — differing only in which comes first, so nothing but the order can account for the difference.',
      ],
    },

    useWhen: [
      'The article has stated that work is the area under the process line and the reader has taken it as a definition rather than as a fact about the route. Two routes between one pair of states shading different amounts is what turns it into something watched.',
      'The reader wants the area tied to something physical before granting that it is work, and what is wanted is the payout — weights that finished higher than they began, three of them one way and one the other.',
    ],

    avoidWhen: [
      'The article is about a closed round trip, or about what is left over once a gas has come back to where it started. Neither route returns; the second simply starts afresh from the same point.',
      'The point is which quantity is held fixed during a change. Both routes here are made from the same two moves and nothing on screen names a constraint or argues from one.',
      'A curved path is wanted, or the way pressure trades against volume along one. Every leg here is straight, either flat or upright.',
      'Heat is the subject — how much came in, where it went, whether any was thrown away. Nothing in the picture accounts for heat.',
      'Numbers are needed in kilopascals, litres or joules, or an efficiency is to be worked out. Only counts of weights and counts of bands appear.',
    ],

    contrastWith: [
      {
        concept: 'cyclic-process',
        note: 'One asks whether two different routes between the same pair of states cost the same; the other closes a route on itself and asks what is left over once the gas is back where it began.',
      },
      {
        concept: 'isobaric-isochoric',
        note: 'One fixes the two end states and varies the route; the other fixes the starting state and varies which quantity is pinned, so the two never reach a common end at all.',
      },
      {
        concept: 'isothermal-process',
        note: 'One counts the work as an area and says nothing about what paid for it; the other follows the heat that did.',
      },
      {
        concept: 'work-by-variable-force',
        note: 'Both read an amount of work off as the area under a plotted line — one for a gas pushing a piston, the other for a force that changes as a body moves along.',
      },
    ],
  },
};
