/**
 * rl-circuit 개념 선언.
 *
 * 코일 넷 가운데 이쪽은 **「누가 전압을 맡는가 — 그래서 전류가 시간을 들인다」** 다.
 *   rl-circuit          닫는 순간 코일이 **전부 맡고**, 차오르는 만큼 **저항으로 넘어간다**
 *   energy-in-inductor  그 사이에 **쌓이는 에너지**의 양과 자리
 *   mutual-inductance   바뀌는 동안 **이웃**에 서는 전압
 *   lc-oscillation      저항이 없어 **가라앉지 않는** 회로
 * 이쪽만 「스위치 · 서서히 · 몫의 넘어감 · L 이 크면 느리다」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rlCircuitConcept: Aperi21ConceptSource = {
  id: 'rl-circuit',
  label: 'Current Filling Slowly in a Coil and Resistor',
  canonicalSim: 'aperi21:rl-circuit',

  surface: {
    definition:
      'Close a switch on a coil in series with a resistor and the current cannot arrive at once: the coil takes the whole supply voltage at the first instant and hands its share over to the resistor as the current fills in.',
    exemplarKeywords: [
      'RL circuit',
      'why does the current not jump straight to its final value',
      'current rises gradually after the switch is closed',
      'time constant L over R',
      'the inductor opposes the change at the instant of switching',
      'voltage across the coil falls while the voltage across the resistor grows',
      'a bigger inductance makes the rise slower',
      'growth of current in an inductive circuit',
      'at the first instant the current is still zero',
      'the two voltages always add up to the supply',
      'inductive lag when switching on',
    ],
  },

  briefing: {
    observable: [
      'On the left a single loop holds a battery, a switch, a coil and a resistor, each drawn as a plain outline with its rating written beside it; on the right stands one upright column whose full height is the battery’s voltage.',
      'With the switch swung open below the loop there is no current arrow and the column is an empty frame.',
      'The blade comes down and touches, and in that instant the column fills from top to bottom with a single hatched share bearing the coil’s letter — the coil has taken the whole of the supply — while no current arrow has appeared yet.',
      'A solid share then grows up from the bottom of the column, carrying the resistor’s letter, and the boundary between the two shares climbs; the hatched share loses exactly what the solid one gains, and the column never changes height.',
      'At the same pace an arrow for the current grows beneath the coil toward a dotted arrow already laid down at the length the current will finally reach, quick at first and slower and slower after, so it never snaps to the end.',
      'Near the top the boundary creeps: a thin hatched sliver is still there long after the column looks full, and its letter fades as the sliver thins.',
      'At the end the column is one solid share, the boundary is at the very top and the current arrow has reached the dotted one.',
      'Choosing the larger coil starts the whole thing over from the open switch, and the boundary and the arrow then climb at half the pace toward the same final places; the label beside the coil changes to the larger rating.',
      'Neither the current, the two shares of voltage nor any time is given a number on screen — only the battery, the resistor and whichever coil has been chosen carry figures.',
    ],

    screen: {
      affordances: [
        'One two-way choice at the top right picks between the smaller and the larger coil; taking either one rewinds to the open switch so the closing is always watched from the beginning and no current is ever caught mid-flight.',
        'Everything else runs by itself — the switch opens, closes and closes again in a loop — and the reader arrives with the current already about half grown and the boundary already past the middle.',
        'The two shares are the same quantity and so share one colour, and they are told apart by one being hatched and the other solid, with the circuit’s own letters set beside them.',
        'The dotted arrow laid at the final length is on screen only while the switch is closed, so where the current is heading is always visible at the same time as how far short it still falls.',
        'The letter on a share dims as that share grows thin, so the nearly-finished state is read from the sliver rather than from writing crowded against the top of the column.',
      ],
    },

    useWhen: [
      'The article has stated that current in an inductive circuit rises exponentially and the reader has no picture of what is holding it back. The column going entirely to the coil at the instant of closing, then draining share by share into the resistor, supplies the mechanism behind the curve.',
      'The prose needs the two voltages to be seen adding up to the supply at every moment rather than only at the ends. One column of fixed height with one moving boundary makes that an observation instead of an arithmetic check.',
      'The reader is being asked to believe that a larger coil means a slower circuit and would rather see it than take it. Two coils can be put side by side from the same open switch.',
    ],

    avoidWhen: [
      'The subject is the switch being opened again, the collapse of the current, or the spark across the contacts. The blade only ever closes here; the current is never interrupted.',
      'The article turns on the constant itself as a number — how many of them to reach a given fraction, or the reading at one of them. There is no time axis, no marked interval and no figure for the current.',
      'The point is a capacitor charging, or the comparison between a circuit that stores charge and one that stores field. Only a coil and a resistor are in this loop.',
      'What is wanted is the energy banked while the current builds, or where it ends up. Nothing on this screen is counted as energy.',
      'The supply alternates, or the question is how the circuit answers at different frequencies. There is one steady battery and one switching event.',
    ],

    contrastWith: [
      {
        concept: 'energy-in-inductor',
        note: 'Both watch a current being brought up through a coil, but one is about the time that takes and who holds the supply voltage while it passes, and the other about the amount banked once it is up.',
      },
      {
        concept: 'mutual-inductance',
        note: 'One keeps everything inside a single loop and asks why its own current lags behind the switch; the other looks outside the loop at a coil that is not joined to it.',
      },
      {
        concept: 'lc-oscillation',
        note: 'One has a resistor, so the current climbs once and settles for good; the other has none, so nothing ever settles and the same quantity keeps being handed back and forth.',
      },
    ],
  },
};
