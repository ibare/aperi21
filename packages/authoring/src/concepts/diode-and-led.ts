/**
 * diode-and-led 개념 선언.
 *
 * 이미 선언된 `iv-characteristic` 과 화면이 가장 닮아 **주장을 갈랐다.**
 *   iv-characteristic  비례가 **깨지는 소자가 있다** — 저항 · 전구 · 다이오드 세 곡선의 모양
 *   diode-and-led      **띠 간격 하나가 문턱과 빛의 색을 함께 정한다** — 간격이 클수록
 *                      문턱이 높고 빛이 푸르다. 실리콘 · 빨강 · 파랑 셋을 간격 순으로 견준다
 * 「비례가 깨진다」 · 「기울기」 · 「비선형」 어휘는 저쪽에 두고, 이쪽은 띠 간격 · 문턱과
 * 색의 짝 · 전자가 떨어지며 내는 빛 어휘만 갖는다. 공핍층 · 이온은 `pn-junction` 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const diodeAndLedConcept: Aperi21ConceptSource = {
  id: 'diode-and-led',
  label: 'One Band Gap Setting Both the Turn-On and the Colour',
  canonicalSim: 'aperi21:diode-and-led',

  surface: {
    definition:
      'That the band gap of a diode fixes two things at once: the forward voltage below which it passes nothing, and, when it emits, the colour of the light — a wider gap means a later turn-on and bluer light.',
    exemplarKeywords: [
      'light emitting diode',
      'LED',
      'why does a blue LED need more voltage than a red one',
      'forward voltage of an LED',
      'what decides the colour an LED gives out',
      'an electron falling across the gap and sending out a photon',
      'silicon gives out no visible light',
      'electricity turned into light in a single device',
      'red and blue devices compared side by side',
      'why an LED lights only above a certain voltage',
      'band gap in electronvolts against wavelength',
      'three devices with three different turn-on points',
    ],
  },

  briefing: {
    observable: [
      'A plane on the left carries current upward and voltage across, with the two directions named on either side of the origin, and a panel on the right carries two level lines with the distance between them measured and written in electronvolts.',
      'Three devices take their turn on the same pair of panels — a plain one first, then two that emit.',
      'A bright point runs out along the voltage axis into the blocking direction as far as a marked voltage and comes back, and the trace it leaves lies flat on the axis the whole way.',
      'It then goes forward, still flat on the axis, and a mark with a figure in volts appears on the axis as the point approaches it.',
      'Past that mark the point leaves the axis and climbs almost vertically to the top of the plane, moving at an even pace along the curve rather than along the voltage.',
      'At the same moment electrons appear on the upper line of the right-hand panel and begin dropping to vacancies on the lower one, and they drop faster as the current grows.',
      'While the first device runs at full current the drops go on but nothing leaves the panel.',
      'For the second device each drop sends a packet of ripples away to the right, drawn in its own colour, with the ripples widely spaced; for the third they are drawn in a different colour and packed much more closely into a packet of the same length.',
      'Between devices the finished trace stays behind in grey and the measured distance in the right-hand panel grows to a larger figure.',
      'At the end three traces stand together on one plane in order of their marked voltages, the rightmost carrying the most closely spaced ripples.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. Three devices run in a fixed order on one pair of panels and the round repeats.',
        'The trace and the level panel run on one clock, so a drop never happens except while current is passing, and the blocking stretch leaves the right-hand panel empty.',
        'The point travels at an even pace along the curve rather than along the voltage, or the climb would be over before it could be watched.',
        'The upright axis carries no scale at all, since the devices differ in their actual currents by orders of magnitude and the claim is about where each one starts.',
        'Colour is used for light and for nothing else; the devices are told apart by where their traces stand and by their names.',
        'The ripple spacing carries the ratio of the two wavelengths, with the packets made equal in length so the count of ripples says it.',
        'The first device is given no light at all, which is the honest outcome for it, and the accompanying line says where its energy goes instead.',
        'Each finished trace is kept in grey while the next is drawn, so that the three turn-on points stand together at the end rather than being remembered.',
        'The only figures on screen are the marked voltages and the measured distances; no current is written anywhere.',
        'No circuit, no supply and no component symbol is drawn; the two panels carry the whole account.',
      ],
    },

    useWhen: [
      'The reader knows LEDs come in colours and takes the colour to be a property of the plastic. The same measured distance growing while both the turn-on voltage and the tightness of the ripples change with it is what locates the cause.',
      'The article has to make "electricity into light" a mechanism rather than a phrase. One electron dropping and one packet leaving, repeated as fast as the current allows, is that mechanism.',
      'The prose needs the turn-on voltage to be a consequence of the material rather than a specification. Three devices, three marks, and the marks lining up with the three measured distances is the argument.',
      'The reader wonders why an ordinary diode does not glow. It drops electrons at the same rate and sends out nothing.',
    ],

    avoidWhen: [
      'The point is that proportionality between current and voltage fails, or that a trace should be compared with a straight one. No straight trace is drawn here and no slope is read.',
      'The subject is the layer inside the device, the fixed charge in it, or how it narrows and widens. Nothing here is drawn inside the device.',
      'The article is about a circuit built around the device, about protecting it, or about converting an alternating supply. Nothing is connected to anything.',
      'The subject is breakdown in the blocking direction, or what happens at large reverse voltages. The blocking stretch here is short and simply flat.',
      'A current in milliamps, a power or an efficiency is to be read off. The upright axis has no scale.',
      'The article runs the other way — light arriving and charge or a voltage resulting. Here the voltage is applied and the light leaves.',
      'The subject is a device with a third terminal, or one current commanding another.',
    ],

    contrastWith: [
      {
        concept: 'iv-characteristic',
        note: 'One is about traces departing from a straight line, with several kinds of component set against one another; the other is about a single material property fixing both where a device starts and what colour it emits.',
      },
      {
        concept: 'pn-junction',
        note: 'One reads the device from the outside, as a trace with a turn-on point; the other opens it and shows the layer of fixed charge whose width is why the two directions differ at all.',
      },
      {
        concept: 'photovoltaic-effect',
        note: 'One drives current in and gets light out, with the gap fixing the colour; the other lets light in and gets a voltage out, with the gap fixing which light is any use.',
      },
      {
        concept: 'band-theory',
        note: 'Both measure the same gap in electronvolts, but one uses it to sort materials by whether they conduct at all, and the other uses it to fix a device’s turn-on voltage and the colour it gives out.',
      },
      {
        concept: 'dispersion',
        note: 'Both end with colours standing beside one another, but one separates colours that were already present in the light, and the other has each colour made anew by a material that can give out only one.',
      },
    ],
  },
};
