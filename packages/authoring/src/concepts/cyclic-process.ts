/**
 * cyclic-process 개념 선언.
 *
 * 과정 다섯 중 하나(가름은 `pv-diagram.ts` 머리 참조).
 * 이 조각은 **닫으면 무엇이 남는가** 를 주장한다 — 온도계는 「처음」 눈금으로 돌아왔는데
 * 고리가 둘러싼 넓이는 0 으로 돌아가지 않는다. 그 어긋남 하나가 전부다.
 * 이쪽만 시계 방향 한 바퀴 · 빗금으로 바뀌는 칸 · 「처음」 눈금 어휘를 갖는다.
 * 넓이가 왜 일인가(pv-diagram) · 열의 출입과 버림(heat-engine · carnot-cycle) 은 두지 않았다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const cyclicProcessConcept: Aperi21ConceptSource = {
  id: 'cyclic-process',
  label: 'What a Closed Cycle Leaves Behind',
  canonicalSim: 'aperi21:cyclic-process',

  surface: {
    definition:
      'A change returning a gas to the state it began in, after which its temperature is exactly as before yet the area enclosed by the closed loop remains as work.',
    exemplarKeywords: [
      'cyclic process',
      'closed loop on a PV diagram',
      'net work per cycle',
      'the area enclosed by the cycle',
      'back in the same state but work was done',
      'does a round trip leave nothing behind',
      'work done minus work received',
      'internal energy is unchanged over a full cycle',
      'going clockwise round the loop',
      'why an engine has to run in cycles',
    ],
  },

  briefing: {
    observable: [
      'A marker travels clockwise round a rectangle of four corners on a pressure–volume plot, setting out from the one corner that is named.',
      'On the first leg the volume grows at the upper pressure, the area beneath the path fills with accent colour right down to the axis, and a thermometer beside the plot climbs above a mark reading "Start".',
      'On the second leg the pressure falls at fixed volume; nothing fills, and the area already coloured is named as the work done.',
      'On the third leg the volume shrinks at the lower pressure, and as the marker comes back the lower part of that coloured area turns to hatching from the right-hand end inwards — exactly the ground the first leg had covered.',
      'On the fourth the pressure climbs at fixed volume back to the named corner, the hatched part is named as the work received, and the thermometer returns to the "Start" mark.',
      'Then the hatched part fades away and only the region enclosed by the now closed rectangle is left coloured, renamed as the work left over.',
      'The thermometer rests on the "Start" mark, exactly where it began, while the coloured region has not gone back to nothing — the two disagreeing on one screen is the whole of the claim.',
      'Work done and work received wear the same colour and are told apart by one being solid and the other hatched, because both of them are work.',
      'The hatching is laid down over the very ground the colouring will lose, so the cancelling is watched happening rather than announced.',
      'Only the starting corner is lettered; the other three carry no names.',
      'No pressures, volumes, temperatures or amounts of work appear, and the axes carry no numbers.',
    ],

    screen: {
      affordances: [
        'The loop runs once through and then begins again, with nothing to press and no corner to move — the claim is that something is left, not how much.',
        'The name inside the loop is swapped at the moment the hatching clears, so the reader is told which quantity the remaining colour now stands for.',
        'The thermometer follows the gas throughout rather than only at the end, which is what lets its return to the "Start" mark be checked instead of taken on trust.',
        'Temperature is one column whose height is the entire reading; hot and cold are not given separate colours.',
      ],
    },

    useWhen: [
      'The article has said that the internal energy of a gas is unchanged over a complete cycle and the reader has drawn the wrong conclusion from it — that therefore nothing happened. A thermometer back on its mark while the loop still holds colour is the correction.',
      'The reader has been told the net work is the enclosed area and wants to see where the subtraction takes place; a coloured region turning hatched over exactly the ground it is about to lose is that subtraction.',
    ],

    avoidWhen: [
      'The article is about a single change and what it costs, or about two ways of getting between two states. Everything here comes back to where it began.',
      'Heat is the subject — how much was taken in, how much thrown away, what share became work. No heat is drawn or counted; there is a plot and a thermometer and nothing else.',
      'An efficiency is wanted, or a comparison between an ideal machine and a real one. Nothing here is rated against anything.',
      'The engine’s parts are the point — cylinder, weights, wheel, strokes. None of them appear.',
      'Values are needed in joules or kelvin, or the size of the loop matters to the argument. There is not a number on the screen.',
    ],

    contrastWith: [
      {
        concept: 'pv-diagram',
        note: 'One closes the route on itself and asks what survives a return to the start; the other leaves it open and asks why two ways of arriving cost differently.',
      },
      {
        concept: 'heat-engine',
        note: 'One says a closed cycle leaves work behind; the other says what such a cycle has to be fed and what it has to pass on in order to leave it.',
      },
      {
        concept: 'carnot-cycle',
        note: 'One asks only whether anything at all is left after the round trip; the other asks how much of what was taken in could possibly have been left, and why a share never can be.',
      },
      {
        concept: 'isobaric-isochoric',
        note: 'One strings legs of both kinds into a closed loop; the other sets one of each side by side from a shared start and asks how the two differ.',
      },
    ],
  },
};
