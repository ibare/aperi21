/**
 * superconductivity 개념 선언.
 *
 * 이미 선언된 `temperature-and-resistance` 와 **온도가 저항을 바꾼다**를 공유하므로
 * 주장으로 갈랐다.
 *   temperature-and-resistance  **데운다** — 금속은 저항이 오르고 반도체는 내린다.
 *                               까닭이 다른 두 방향의 견줌이다
 *   superconductivity           **끝까지 식힌다** — 한 금속은 바닥(잔류 저항)에 남고
 *                               다른 하나는 임계 온도에서 **수직으로 0 에 닿는다**
 * 이쪽만 임계 온도 · 잔류 저항 · 「뚝 떨어진다」 · 저항 0 어휘를 갖는다. 자기장을
 * 밀어내는 것 · 쌍맺음 · 임계 자기장은 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const superconductivityConcept: Aperi21ConceptSource = {
  id: 'superconductivity',
  label: 'Resistance Falling to Nothing at a Critical Temperature',
  canonicalSim: 'aperi21:superconductivity',

  surface: {
    definition:
      'That some metals lose their resistance outright rather than gradually: cooled alongside one that merely flattens out above zero, one of them drops vertically to nothing at a particular temperature a few degrees above absolute zero.',
    exemplarKeywords: [
      'superconductivity',
      'critical temperature',
      'resistance becoming exactly zero',
      'mercury cooled to a few kelvin',
      'the residual resistance an ordinary metal keeps',
      'a graph of resistance against temperature',
      'cooling with liquid helium',
      'a sudden drop rather than a gradual fall',
      'what happens to resistance at the very lowest temperatures',
      'the zero resistance state',
      'the discovery of 1911',
      'does resistance ever actually reach nothing',
    ],
  },

  briefing: {
    observable: [
      'One plane carries resistance upward and temperature across, and the two curves on it are grown from the warm end towards the cold, each with a moving point at its cold end.',
      'The two points always stand at the same place across, so the two samples are always at the same temperature and the comparison never has to be trusted.',
      'Both curves fall in the same smooth shape at first, and each is named at its warm end; they start from different heights only so that the two names have room.',
      'A dotted guide stands at one particular temperature from the very beginning, before anything has happened there.',
      'When the points reach that guide the cooling stops. One point stays exactly where it is on its curve; the other falls straight down to the horizontal axis, drawing a segment in the accent colour as it goes.',
      'That segment is upright because the temperature did not move while it was being drawn, not because an upright line was put there.',
      'Cooling then continues towards the cold end. One curve flattens out and settles above the axis; the other runs along the axis itself in the accent colour, drawn thicker than the axis so that the two do not merge.',
      'A dimension line measuring the height at which the flattened curve settles, and a label naming the other as having none at all, darken in as the cooling goes on.',
      'At the end the two outcomes stand side by side on one plane — one stopping above the axis, one having reached it — and then the picture fades and starts again from the warm end.',
      'The temperature axis carries three marks and no running value; where the points stand is what says the temperature.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The cooling, the stop at the guide, the drop and the run along the axis happen in that order and the round repeats.',
        'An ordinary metal is cooled alongside rather than described, so "it just keeps going down" has a case standing beside it.',
        'Both curves are drawn in one ink and told apart only by their names, so nothing about the difference is carried by colour.',
        'The accent colour means one thing: resistance of nothing — the upright segment and the line along the axis afterwards.',
        'The guide is put in place before anything happens at it, so that the eye is already at the right spot when the drop comes.',
        'The temperature is held still during the drop, which is what makes the segment upright without an upright line being drawn.',
        'The real change is a fraction of a degree wide and is stretched to about a second so that it can be watched at all.',
        'The resistance axis carries no scale beyond its zero, since the two samples differ in shape and size and what is to be read is only whether a curve reaches the axis or stops above it.',
        'The line along the axis is drawn thicker than the axis and over it, so that lying on zero can be told from being the zero line.',
        'No running temperature or resistance is written, and no way of moving the temperature is offered, which is also what stops the drop being skipped over.',
      ],
    },

    useWhen: [
      'The reader takes zero resistance to be the natural end of the ordinary decrease with cooling. A second metal cooled at exactly the same rate, settling above the axis and staying there, is what breaks that.',
      'The article needs the critical temperature to be a place where something changes abruptly rather than a value to be quoted. The guide standing there beforehand and the upright drop at it is that place.',
      'The prose distinguishes "very small" from "none". The two endings side by side on one plane, one with a measured height and one on the axis, is the distinction drawn.',
    ],

    avoidWhen: [
      'The subject is a magnetic field being pushed out of a material, levitation, or what a superconductor does to a magnet. No field and no magnet appear here.',
      'The article is about why it happens — electrons pairing up, an energy gap, or a mechanism of any kind. Only the resistance is shown.',
      'The point is the largest current or field a superconductor can take before it gives up, or how a material is chosen for an application. One cooling run is shown and nothing is carried through the samples.',
      'The subject is materials that do this at far higher temperatures, or the race to raise the temperature. Two samples and one critical temperature appear.',
      'The article is about heating a conductor and which way its resistance goes, or about telling metals from semiconductors by that direction. Everything here is cooled and both samples are metals.',
      'A resistance in ohms, or a value at some temperature between the marks, is to be read off. The upright axis carries only its zero.',
      'The subject is what zero resistance would be good for — lossless transmission, powerful magnets, or persistent currents. Nothing here is wired to anything.',
    ],

    contrastWith: [
      {
        concept: 'temperature-and-resistance',
        note: 'One heats two kinds of material and finds their resistance moving in opposite directions for different reasons; the other cools two metals as far as it can and finds one of them stopping above zero while the other reaches it.',
      },
      {
        concept: 'joule-heating',
        note: 'One asks how much a resistance warms when current passes through it; the other shows a resistance that has gone to nothing, which is the case in which that question has no answer to give.',
      },
      {
        concept: 'phase-diagram',
        note: 'Both mark a temperature at which a material changes abruptly into something else, but one is about which state matter settles into under a given pressure and temperature, and the other about a single electrical property vanishing.',
      },
      {
        concept: 'thermistor-and-ldr',
        note: 'One uses a resistance that answers to its surroundings as a way of reading them; the other is about a resistance that stops answering at all below a certain temperature.',
      },
      {
        concept: 'resistance-and-geometry',
        note: 'One keeps every sample as it is and changes only the temperature; the other keeps the temperature fixed and asks what the length and thickness of a conductor do to its resistance.',
      },
      {
        concept: 'meissner-effect',
        note: 'Both are about the same transition at the same critical temperature, but one claims only that the electrical resistance goes to nothing and says nothing of magnetism; the other says nothing of resistance and claims that a magnetic field already inside is driven out.',
      },
    ],
  },
};
