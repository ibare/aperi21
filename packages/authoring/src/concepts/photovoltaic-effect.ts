/**
 * photovoltaic-effect 개념 선언.
 *
 * 곁의 셋과 갈랐다 — **빛이 들어와 무엇이 되는가**.
 *   photovoltaic-effect   빛이 접합 안에 **쌍**을 만들고 내부 전기장이 그것을 갈라
 *                         두 끝에 쌓여 **전압**이 생긴다. 띠 간격보다 약한 빛은 그냥 지나간다
 *   photoelectric-effect  광자가 전자를 **금속 밖으로** 내보낸다 — 나오느냐 마느냐가 주장
 *   diode-and-led         반대 방향 — 전류를 넣어 **빛을 낸다**
 *   pn-junction           그 공핍층과 전기장이 **어떻게 생기는지**
 * 이쪽만 태양 전지 · 개방 전압 · 적외선은 그냥 지나감 · 쌍이 갈림 · 전압계 바늘 어휘를 갖는다.
 * 전류 · 부하 · 효율은 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const photovoltaicEffectConcept: Aperi21ConceptSource = {
  id: 'photovoltaic-effect',
  label: 'Light Alone Raising a Voltage Across a Junction',
  canonicalSim: 'aperi21:photovoltaic-effect',

  surface: {
    definition:
      'How light by itself produces a voltage: photons carrying more than the band gap create a pair of carriers inside the junction layer, the field there drives the two to opposite ends, and weaker photons pass straight through.',
    exemplarKeywords: [
      'photovoltaic effect',
      'solar cell',
      'how does a solar panel make electricity',
      'the voltage of a cell with nothing connected to it',
      'light creating a pair of carriers',
      'photons below the band gap are not absorbed',
      'infrared passing straight through a cell',
      'why a cell cannot use all of sunlight',
      'the field at the junction pulling the two apart',
      'sunlight turned into a voltage',
      'green light works where infrared does nothing',
      'charge gathering at the two ends of a cell',
    ],
  },

  briefing: {
    observable: [
      'A bar lies across the picture with a different kind of material on each side and a plate at either end; its middle is washed with a tint and an arrow beneath that tint points from one side to the other.',
      'A lamp stands above the bar and two leads run down from the plates to a meter with a needle. A figure in electronvolts for the material’s gap is written on screen throughout.',
      'The lamp begins dark and the needle sits at nothing.',
      'It then gives out a light named on screen with its own photon energy, drawn as widely spaced ripple packets in plain ink; each packet enters the tinted middle, passes straight on through the bar and out the far side, fading as it goes.',
      'Not one pair of carriers appears and the needle does not stir.',
      'The lamp then changes: the first name and beam fade out as a second, coloured one fades in, carrying a larger photon energy — larger than the gap figure, where the first was smaller.',
      'A closely spaced packet of the new light reaching a point inside the tinted middle makes a small ring spread there, and leaves behind a filled dot and a hollow ring at that very point.',
      'The two set off in opposite directions along the bar, each trailing a tail, one towards each end.',
      'They gather at the plates; a sign darkens on each plate as its own kind arrives, and the needle climbs by as much as has reached the ends.',
      'When the needle has finished rising a voltage is written beside the meter, and it stays there while later pairs keep being made and keep vanishing into the plates without moving the needle further.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. One lamp runs dark, then one light, then the other, and the round repeats.',
        'Both lights are delivered by the same lamp at the same rate, so the only thing that has changed between the two stretches is the energy a single photon carries.',
        'The weaker light is aimed through the middle of the bar rather than past it, so that its failure cannot be read as its having missed.',
        'It is drawn in plain ink because it lies outside what the eye can see, while the other is painted in its own colour, on the lamp, the beam and the packets alike.',
        'The ripple spacing carries the ratio of the two wavelengths, with the packets made equal in length so the count of ripples says it.',
        'The needle’s angle is the count of carriers that have reached the ends, so "gathering" and "the voltage rising" have one cause rather than two.',
        'The voltage figure appears only once the needle has finished moving, so a number never stands in for the rise itself.',
        'The accent colour is kept for the voltage that has been produced — the needle, the signs on the plates and the figure.',
        'Carriers are drawn in one ink and told apart by a filled dot against a hollow ring and by which way they go; only moving ones carry tails.',
        'They travel in straight lines at one speed, which is a simplification made because the claim is about which end each of them reaches.',
        'The only figures on screen are the two photon energies, the gap and the voltage; no current and no load is drawn anywhere.',
      ],
    },

    useWhen: [
      'The reader supposes that any light falling on a cell contributes something. One lamp changed from a weaker light to a stronger one, with nothing else altered, is the experiment that settles it.',
      'The article needs the internal field to be doing the work. A pair made in the middle and immediately pulled to opposite ends is what turns a pair into a voltage.',
      'The prose has to explain why a cell stops rising instead of building up indefinitely. Later pairs keep arriving and the needle stays where it is.',
      'The point is that the threshold here is a property of the material rather than of the lamp. The gap figure stands on screen while the photon energy beside the lamp changes across it.',
    ],

    avoidWhen: [
      'The subject is electrons being knocked clear of a surface and flying off into space. Nothing leaves the material here; the pair stays inside and is separated.',
      'The article is about current drawn from a cell, a load connected to it, a trace of current against voltage, or an efficiency. Nothing is connected and nothing flows through the meter.',
      'The point is how the layer in the middle came to be, or what its field is made of. The layer is already there when the screen begins.',
      'The subject is the energy picture of the absorption — bands, levels or an electron lifted across a gap in a diagram. Only the gap figure appears; no band picture is drawn.',
      'The article runs the other way, with current driven in and light coming out. Here the light arrives and a voltage results.',
      'The subject is how a panel is built, what a cell is made of, or how much power a roof could supply. One bar, one lamp and one meter carry the whole account.',
      'The point is that brighter light gives more of something. Both lights here arrive at the same rate and only their colour differs.',
    ],

    contrastWith: [
      {
        concept: 'photoelectric-effect',
        note: 'Both turn on a photon carrying more than a threshold, but one has the electron leave the material altogether and asks only whether it comes out, and the other keeps both halves of the pair inside and is about the voltage that results from separating them.',
      },
      {
        concept: 'pn-junction',
        note: 'One is about how the layer and its field arise and how an applied voltage changes them; the other takes the layer for granted and has light making the carriers that the field then sorts.',
      },
      {
        concept: 'diode-and-led',
        note: 'One takes light in and gives a voltage out; the other takes current in and gives light out, and in each case the gap decides which light is involved.',
      },
      {
        concept: 'band-theory',
        note: 'One uses the gap to sort materials by whether they conduct; the other uses it as the dividing line between light that is absorbed and light that goes straight through.',
      },
      {
        concept: 'emf-and-internal-resistance',
        note: 'One is about how a source comes to have a voltage across its terminals when nothing is drawing from it; the other is about how that voltage sags once something is.',
      },
    ],
  },
};
