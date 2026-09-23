/**
 * lc-oscillation 개념 선언.
 *
 * 이쪽의 새것은 「합이 그대로」 가 아니라 **에너지가 사는 자리가 두 장 사이를 옮겨 다닌다** 는 것이다.
 *   lc-oscillation     판 사이 **전기장** ↔ 코일을 꿰는 **자기장**, 서로를 채운다
 *   energy-in-inductor 한 자리에 **한 번 쌓였다가 한 번 돌아 나온다**
 *   shm-energy         같은 되풀이지만 **운동 에너지 ↔ 탄성 에너지**, 장이 아니다
 *   series-rlc-resonance 밖에서 **몰아 주는** 진동수가 있고 저항이 있다
 * 이쪽만 「저항 없음 · 반 주기마다 부호가 뒤집힘 · 장선의 늘고 줆」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lcOscillationConcept: Aperi21ConceptSource = {
  id: 'lc-oscillation',
  label: 'Energy Shuttling Between a Capacitor and a Coil',
  canonicalSim: 'aperi21:lc-oscillation',

  surface: {
    definition:
      'With nothing to waste it, the store held in the field between a capacitor’s plates empties into the field threading a coil and back again, each one filling by exactly what the other gives up.',
    exemplarKeywords: [
      'LC oscillation',
      'tank circuit',
      'energy swapping between a capacitor and an inductor',
      'electric and magnetic energy exchange',
      'the charge on the plates reverses every half cycle',
      'oscillating circuit with no resistance',
      'why the current is largest when the capacitor is empty',
      'an electrical pendulum',
      'a lossless circuit ringing on and on',
      'the two energies always add to the same total',
      'charge sloshing back and forth in a loop',
    ],
  },

  briefing: {
    observable: [
      'A loop holds a pair of capacitor plates on one branch and a coil on the other, with a single current arrow riding the wire across the top and a pair of upright bars standing to the right.',
      'Each mark of charge on a plate has one field strand running across the gap to its partner on the opposite plate, so the plates are read by counting strands rather than by any figure.',
      'Around the coil, closed loops of field run through it and back out either side, and these come up from the inside outward as the current grows.',
      'As the strands between the plates die away from the outside in, the loops around the coil multiply, and the current arrow reaches its full length exactly when the last faint strand has gone.',
      'When the current then falls back to nothing, the plates are full again but with the marks swapped over, and the arrowheads on the strands now point the other way.',
      'On the next half swing the current arrow and the arrowheads on the coil’s loops both turn round together, so the reversal is not something that happens to one of them alone.',
      'The two bars stand in a frame whose height is the total, with an accent line laid across the top; one bar reaches that line whenever the other is empty, and which of them touches it changes four times a cycle.',
      'The strands and loops count the strength of each field while the bars count the energy, so when the strands are down to about half the electric bar is down to about a quarter — the two do not fall together.',
      'Nothing on the screen is given a value: the capacitor and the coil carry only their letters, and there are no volts, amps, joules or seconds anywhere.',
    ],

    screen: {
      affordances: [
        'The swapping runs on its own, without beginning or end, and the reader arrives just after the plates have started to empty, with the first loops around the coil already showing.',
        'Neither the coil nor the capacitor can be altered, so the screen makes no claim about what sets the rhythm and never puts a period on screen.',
        'The two bars take the colours of the two parts they belong to — the electric one matching the plate marks and their strands, the magnetic one matching the loops around the coil — so a bar is read as belonging to a place, not as a value being explained by its colour.',
        'The accent colour is kept for the total line alone, which is what lets the constancy of the sum be seen without measuring either bar.',
        'Plus and minus on the plates are written in the same ink and told apart only by the sign, so the reversal of charge is read as a swap rather than as one side winning.',
        'The whole thing is shown far slower than it would really run, and the screen does not say so, because the claim is about the exchange and not about its pace.',
      ],
    },

    useWhen: [
      'The article has said that energy oscillates between a capacitor and an inductor and the reader has no idea where either store is kept. Strands across the gap and loops through the coil give both stores an address on the screen.',
      'The prose needs the moment of largest current to coincide with the emptiest capacitor, and would otherwise be asking the reader to hold two graphs in mind. Here the last strand vanishing and the arrow reaching full length happen in the same frame.',
      'The reader is being introduced to an oscillation with nothing mechanical in it, and a case is wanted where the thing going back and forth is plainly a field rather than a mass.',
    ],

    avoidWhen: [
      'The article is about damping, about the swing dying away, or about where the energy leaks to. There is no resistance in this loop and the exchange goes on unchanged.',
      'Something outside is driving the circuit, or the question is which driving frequency it answers to. Nothing drives this loop; it was set going and left alone.',
      'What is wanted is the period, the formula that fixes it, or how it shifts when the coil or the capacitor is changed. No interval is marked and neither part can be altered.',
      'The subject is charge moving as particles along a wire, or what the electrons are doing. Nothing flows on screen but a single arrow standing for the current.',
      'The article needs values — volts on the plates, amps in the wire, joules in either store. The bars are read as heights only and nothing is labelled with a quantity.',
    ],

    contrastWith: [
      {
        concept: 'energy-in-inductor',
        note: 'One store is filled once and emptied once so its size can be settled; here two stores keep handing the same amount back and forth and neither is ever weighed.',
      },
      {
        concept: 'shm-energy',
        note: 'Both are a trade in which each store fills exactly what the other gives up, but one trades motion against a strained spring, while this one trades two fields with nothing moving that could be watched.',
      },
      {
        concept: 'simple-harmonic-motion',
        note: 'One is about why a quantity comes back as a sine at all, in terms of what pushes the body back; the other takes the swing for granted and follows only where the energy is sitting at each moment.',
      },
      {
        concept: 'series-rlc-resonance',
        note: 'One is a loop left to itself with nothing to waste it; the other is the same parts kept going by an outside supply, with a resistor, and asks which driving frequency gets the biggest answer.',
      },
    ],
  },
};
