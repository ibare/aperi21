/**
 * latent-heat 개념 선언.
 *
 * 상변화 셋 중 하나. 셋 다 상이 바뀌는 이야기라 **무엇을 축으로 놓는가**로 갈랐다.
 *   latent-heat    축은 **시간과 온도** — 같은 세기로 데우는데 온도가 멈춘다
 *   phase-diagram  축은 **압력과 온도** — 어느 상이 되는가는 압력이 정하고, 낮으면 액체를 건너뛴다
 *   triple-point   축이 아니라 **한 점** — 거기서만 셋이 함께 있고 조금만 벗어나면 하나만 남는다
 * 이쪽만 「평평한 구간 · 잠열 값 · 끓음이 녹음보다 훨씬 길다」 어휘를 갖는다. 압력 · 경계선 ·
 * 승화 · 공존은 쓰지 않는다 — 화면에 압력이 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const latentHeatConcept: Aperi21ConceptSource = {
  id: 'latent-heat',
  label: 'Heat That Changes State Instead of Temperature',
  canonicalSim: 'aperi21:latent-heat',

  surface: {
    definition:
      'Heat a substance takes in while it changes state rather than while it warms, so steady heating leaves the temperature standing still throughout the melting and the boiling.',
    exemplarKeywords: [
      'latent heat',
      'heat of fusion and heat of vaporisation',
      'why does ice at zero degrees not get warmer',
      'the temperature plateau while melting',
      'heating curve of water',
      'why does boiling water stay at 100 degrees',
      'the flat part of the graph',
      'kilojoules per kilogram to melt ice',
      'it takes far more heat to boil away than to melt',
      'energy going into the change of state',
    ],
  },

  briefing: {
    observable: [
      'A pot sits on a heater whose coil is lit and whose three heat arrows point up into it, and that whole arrangement stays exactly as it is from the first moment to the last — what is going in never changes.',
      'To the right, a curve of temperature against time climbs steeply from −20 ℃ to a dashed line at 0 ℃ and then lies down flat along it.',
      'While it lies flat a marked length grows along it, and in the pot the ice pieces shrink as the water level rises.',
      'When the last of the ice is gone the curve climbs again to a second dashed line at 100 ℃ and lies flat a second time; now the water level falls instead and grains of steam rise from the surface.',
      'The second flat stretch takes about three quarters of the width of the whole picture, and the first about a ninth of it, so their lengths are directly comparable.',
      'At the end, 334 kJ/kg is written on the shorter flat stretch and 2260 kJ/kg on the longer one, and those figures appear only once each stretch is complete.',
      'The temperature axis carries three marks and no others — the starting temperature and the two at which the curve lies flat; the time axis carries no marks or units at all.',
      'Ice, water and steam are drawn in one colour, told apart by texture, by shape and by their names beside the pot, so the picture is about one substance in three conditions.',
    ],

    screen: {
      affordances: [
        'One long round runs from cold ice through to nothing but steam and then begins again; nothing has to be pressed.',
        'The two flat stretches are drawn to their true proportion rather than trimmed to fit, which is what makes their lengths worth comparing.',
        'The heating strength is never given as a figure; the unchanging lit coil and arrows are the whole statement that it is steady.',
        'The two dashed lines are laid down first, so that the curve lying along them is something to check rather than to infer.',
        'The first climb is slowed down deliberately, because at true proportion it would pass too quickly to be seen at all.',
      ],
    },

    useWhen: [
      'The article has said that the energy goes into the change of state rather than into the temperature, and the reader cannot square heating with not warming. The curve resting on the dashed line while the pot visibly keeps changing is what resolves it.',
      'The point is the size of the difference between melting and boiling — that a substance takes far more to leave the liquid than to leave the solid — and the two flat stretches, one many times the other, are the evidence.',
    ],

    avoidWhen: [
      'Pressure has any part in the claim — boiling at altitude, sublimation, dry ice. There is no pressure anywhere here; everything happens at one unstated condition.',
      'The article is about the three states being present at once. They arrive in turn here, and by the end only steam is left.',
      'The subject is what molecules or bonds are doing during the change. Nothing inside the substance is drawn.',
      'The point is freezing or condensing, or heat coming back out. The heating never stops and the curve never comes down.',
      'Times in minutes, a heater rating in watts, or the temperature at some instant are needed. The time axis has no scale and the running temperature is never written.',
    ],

    contrastWith: [
      {
        concept: 'phase-diagram',
        note: 'One follows a substance changing state at one fixed condition and asks what the heat does to its temperature; the other varies the condition and asks which changes of state happen at all.',
      },
      {
        concept: 'triple-point',
        note: 'One has the states arrive one after another as heat goes in; the other has three of them persisting side by side with nothing arriving or leaving.',
      },
      {
        concept: 'specific-heat',
        note: 'Two answers to the same question of what heat buys — one buys a rise in temperature whose size depends on the material, the other buys a change of state and no rise at all.',
      },
      {
        concept: 'thermal-equilibrium',
        note: 'Both end with a temperature that will not move, for opposite reasons — one because the flow has died away, the other while the flow continues undiminished.',
      },
    ],
  },
};
