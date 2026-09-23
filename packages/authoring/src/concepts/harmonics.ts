/**
 * harmonics 개념 선언.
 *
 * 「정상파」 네 형제 중 **허용되는 진동수 모임**을 맡는다.
 *   harmonics             주어 = 묶인 줄이 받아들이는 **진동수 모임**. 주장 = 끝이 모양을 걸러
 *                         가장 낮은 것의 **정수배만** 남는다
 *   standing-wave         주어 = 반대로 달리는 두 파동. 주장 = 겹치면 무늬가 흐르기를 멈춘다
 *   string-vibration      주어 = 흔들리는 길이. 주장 = 짧아지면 더 빨리 흔들린다
 *   air-column-resonance  주어 = 관의 끝. 주장 = 막으면 절반 · 홀수 배만 울린다
 *
 * 이쪽만 「거른다 · 정수배 · 봉우리 · 훑는다 · 맞는 모양 · 어긋난 모양」 어휘를 갖는다.
 * 음높이 · 옥타브 · 길이 바꾸기(string-vibration)와 관 · 열림 · 닫힘
 * (air-column-resonance)은 쓰지 않는다. 한 봉우리 자체의 크기 · 폭은 `resonance` 의 몫이라
 * 크게 흔들리는 **이유**가 아니라 **어디에 몇 개** 서는가만 말한다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const harmonicsConcept: Aperi21ConceptSource = {
  id: 'harmonics',
  label: 'The Whole-Number Ladder of Frequencies a Bounded String Accepts',
  canonicalSim: 'aperi21:harmonics',

  surface: {
    definition:
      'The set of rates a string held at its ends will swing hard at: only the shapes whose halves fit the length exactly survive, and those come at whole multiples of the lowest one.',
    exemplarKeywords: [
      'harmonics',
      'fundamental and overtones',
      'why only certain frequencies work',
      'whole number multiples of the lowest frequency',
      'first second and third harmonic',
      'the boundary picks the frequencies',
      'allowed modes of a string tied at both ends',
      'half wavelengths fitting the length',
      'harmonic series',
      'the string ignores frequencies in between',
      'overtone frequencies are integer multiples',
    ],
  },

  briefing: {
    observable: [
      'A string runs from a small driver at the left to a knot tied against a wall at the right. The driver rides up and down on a short rail by a very small amount and raises its rate slowly as time goes on.',
      'A dashed outline is laid over the string: it is the shape the present rate is asking for, starting at the driver and running on as a wave of fixed height. At its right-hand end hang two small open rings.',
      'When the rate is wrong for the length, those two rings stand apart, one above and one below the knot, and the string itself lies nearly flat — only the driver’s own small movement shows.',
      'At certain rates the two rings close onto the knot together, and in that same instant the string fills the dashed outline and swings in one loop, then two loops, then three. Lit marks appear on the still places inside the string for exactly as long as this lasts.',
      'Below the string a curve is drawn out from left to right as the rate is raised, its height being how hard the string swung at each rate passed through. It crawls along the bottom almost everywhere and rises into a narrow peak at each rate where the rings met.',
      'The horizontal line under that curve carries three marks, at the lowest rate that worked and at twice and three times it, and every peak stands over one of those three marks and nowhere else.',
      'By the end of a round the curve is complete: three peaks over three marks and flat between them.',
      'At three times the lowest rate the string swings three times as fast as it did at the lowest, so the loops beat quicker as well as being more numerous.',
      'A line of text below says whether the shape presently misses the knot, lands on it, or whether the finished curve is being shown.',
    ],

    screen: {
      affordances: [
        'The rate climbs and dwells on its own, over and over; nothing is pressed. It pauses on each rate that works long enough for the shape to be seen, because the peaks are narrow and a steady sweep would pass through them too fast.',
        'The sweep goes through every rate in between, not only the ones that work, so the rates that fail are seen failing rather than being left out.',
        'The dashed outline is the shape being asked for and the string is what actually survives; the two are drawn differently and the judgement is made at one place only, the knot where the rings either meet or miss.',
        'The string and the response curve are drawn in the same ink because they are the same quantity, while the outline, the wall and the axis are held back; the accent is spent on the still places alone.',
        'Nothing is written as a figure. The marks under the curve name the lowest rate and its multiples as symbols, so what is read off is a ratio and not a value.',
        'On arriving, the string is already swinging in a single loop with the first peak standing under its mark, so the round is joined in progress.',
      ],
    },

    useWhen: [
      'The article has given the reader the harmonic series as a rule — that the permitted rates are whole multiples of the lowest — and what is wanted is the reason rather than the list. The rings missing the knot at every rate in between is that reason.',
      'The point being made is that the ends of a body do the choosing, and a case is needed where the shapes that fail are as visible as the ones that succeed.',
    ],

    avoidWhen: [
      'The subject is pitch and how to change it — a shorter sounding length, a finger, an instrument being played. The length here never changes and the rate is raised from outside.',
      'The article is about a pipe or a column of air, or about ends that are open rather than tied. Both ends here are held.',
      'The claim to be carried is that a body swings hardest when the shaking matches its own rate, taken on its own. That statement is about one peak; what is on view here is where the peaks stand and how many there are.',
      'The article is about a single shape holding still and the places in it that do not move. The still places appear here only as evidence that a shape has been accepted.',
      'Figures are wanted — rates in cycles per second, wavelengths, lengths. Only symbols for the lowest rate and its multiples are written.',
      'The point is several shapes present at once making up a tone’s character. Only one shape is ever on the string here.',
    ],

    contrastWith: [
      {
        concept: 'standing-wave',
        note: 'One asks which rates a bounded body will take up at all; the other takes the two opposite running waves as given and asks what pattern they make together.',
      },
      {
        concept: 'resonance',
        note: 'Both turn on a body answering some rates and not others, but one lays out the whole ladder of rates a single bounded body accepts, while the other sets several bodies under one shaking and finds that only the matching body builds up.',
      },
      {
        concept: 'string-vibration',
        note: 'One holds the length fixed and sweeps the rate to find which rates fit; the other holds the shape fixed at its simplest and shortens the length to raise the rate.',
      },
      {
        concept: 'air-column-resonance',
        note: 'Both are about ends choosing which shapes survive, but one has two ends of the same kind and gets every whole multiple, while the other makes the two ends differ and loses half of them.',
      },
      {
        concept: 'normal-modes',
        note: 'One follows a driver through the rates and records which ones the body answers; the other names the shapes themselves and shows any motion as those shapes added together.',
      },
      {
        concept: 'driven-oscillation',
        note: 'One is about a bounded body having a whole ladder of rates it will accept; the other is about a single body taking on whatever tempo its driver imposes.',
      },
    ],
  },
};
