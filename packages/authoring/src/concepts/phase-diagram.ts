/**
 * phase-diagram 개념 선언.
 *
 * 상변화 셋 중 하나. 축으로 갈랐다 — 이쪽의 축은 **압력과 온도**다.
 *   latent-heat    시간과 온도 — 데우는데 온도가 멈춘다
 *   phase-diagram  압력과 온도 — **압력이 어느 상이 되는가를 정한다**, 낮으면 액체를 건너뛴다
 *   triple-point   한 점 — 거기서만 셋이 함께, 조금만 벗어나면 하나
 * 이쪽만 「경계선을 건넌다 · 건너뛴다 · 승화 · 압력을 고른다 · 띠 두 줄」 어휘를 갖는다.
 * 잠열 값 · 평평한 구간의 길이 · 공존은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const phaseDiagramConcept: Aperi21ConceptSource = {
  id: 'phase-diagram',
  label: 'Pressure Deciding Which States a Heating Passes Through',
  canonicalSim: 'aperi21:phase-diagram',

  surface: {
    definition:
      'A map on which pressure and temperature fix which state a substance holds, so the same heating crosses two boundaries at one pressure and only one at a lower.',
    exemplarKeywords: [
      'phase diagram',
      'why does dry ice not melt',
      'sublimation',
      'pressure temperature chart of a substance',
      'solid liquid gas regions and the lines between them',
      'crossing a phase boundary',
      'below the triple point pressure there is no liquid',
      'freeze drying',
      'the liquid range disappears at low pressure',
      'which state at a given pressure and temperature',
    ],
  },

  briefing: {
    observable: [
      'A chart has pressure running up and temperature running right, divided into three shaded regions named solid, liquid and gas, with the boundaries between them meeting at a marked point named the triple point.',
      'A state dot travels rightward along a level line as the heating proceeds, and halts on each boundary it reaches while the change of state takes place.',
      'Below the chart run two strips sharing the same temperature axis, one recording a run at a pressure above the triple point and one a run below it, each filling in the state held at every temperature.',
      'The upper strip fills with solid, then liquid, then gas; the lower strip has gas where the upper one has liquid, so the missing stretch is a stretch of colour you can lay a finger across.',
      'A box at the right shows the particles of the sample: a trembling lattice while solid, a settled heap wandering about while liquid, and free flight with bounces off the walls while gas.',
      'On the low-pressure run the lattice goes straight to free flight with no heap in between, and the caption counts the boundaries — two on one run, one on the other.',
      'A slider sets the pressure, and the state dot moves up or down the chart as it is dragged.',
      'No values, units, gridlines or named substances appear anywhere on the chart; the slider alone carries a bare figure.',
    ],

    screen: {
      affordances: [
        'The two contrasting runs play by themselves in order, so the comparison is complete without anything being touched.',
        'A slider lets the reader choose a pressure of their own; that heating is then laid out afresh, while the first strip keeps the high-pressure result beside it for comparison.',
        'Temperature is not something the reader sets — it is swept by the heating — so the chart is explored along one axis only, which is the axis the claim turns on.',
        'The strips are aligned to the chart’s own temperature axis, which is what allows a stretch of the upper strip to be read against the same stretch below it.',
        'The boundary past the highest pressure shown is drawn as a clean line all the way to the edge, so nothing suggests the distinction blurring there.',
      ],
    },

    useWhen: [
      'The article has claimed that whether a solid melts or goes straight to gas is settled by the pressure, and the reader needs the absent liquid to be visible rather than argued. The two strips, one with three states and one with two, are that.',
      'The reader is wondering what happens close to the boundary meeting point, and what is wanted is a pressure they can set for themselves and a run that answers it.',
    ],

    avoidWhen: [
      'The article is about how much heat a change of state costs, or about the temperature standing still while it happens. No energy is drawn and there is no temperature-against-time curve.',
      'The point is the three states being present together. The dot is only ever inside one region or halted on one line.',
      'The critical point or supercritical behaviour is at issue. The boundary is carried straight to the edge with nothing marking where it would end.',
      'The article turns on water’s unusual melting line leaning the other way. That lean is not drawn.',
      'Real figures are needed — pressures in pascals, temperatures in degrees, a named substance. The chart carries no values at all.',
    ],

    contrastWith: [
      {
        concept: 'triple-point',
        note: 'One is the whole map and the routes across it; the other is the single place on that map where the three regions meet, and what is special about standing exactly there.',
      },
      {
        concept: 'latent-heat',
        note: 'One asks which changes of state a heating will meet; the other takes the changes as given and asks what the heat does to the temperature while each one runs.',
      },
      {
        concept: 'atmospheric-pressure',
        note: 'One treats pressure as an axis that settles what state a substance is in; the other is about the pressure of the air itself and how it makes its presence felt.',
      },
    ],
  },
};
