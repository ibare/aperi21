/**
 * hydrostatic-pressure 개념 선언.
 *
 * 압력 여섯 중 하나. 이쪽의 주장은 **깊이에 정비례** 하나다 — 두 배 깊이면 두 배.
 * 방향(`pressure-isotropy`) · 그릇 모양(`pressure-and-container-shape`) · 공기
 * (`atmospheric-pressure`) · 재는 장치(`barometer` · `manometer`) 는 저쪽 몫이다.
 * 이쪽만 깊이 · 두 배 · 정비례 · 곧은 쐐기 어휘를 갖는다.
 *
 * 화면이 계기압만 말한다(수면에서 화살표가 0). 대기압을 더한 절대압은 두 배가 아니라
 * avoidWhen 으로 되돌린다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const hydrostaticPressureConcept: Aperi21ConceptSource = {
  id: 'hydrostatic-pressure',
  label: 'Pressure in Proportion to Depth',
  canonicalSim: 'aperi21:hydrostatic-pressure',

  surface: {
    definition:
      'The way a still liquid presses harder the further down one goes, and in exact proportion, so that a surface taken to twice the depth is pushed on twice as hard.',
    exemplarKeywords: [
      'hydrostatic pressure',
      'pressure increases with depth',
      'twice as deep, twice the pressure',
      'p equals rho g h',
      'why a dam wall is thicker at the bottom',
      'water pressure at the bottom of a tank',
      'gauge pressure below the surface',
      'how hard does the water push five metres down',
      'pressure proportional to depth',
      'a deep tank presses harder on its walls',
    ],
  },

  briefing: {
    observable: [
      'A small sensor hangs from a string and is lowered into a tank of still water.',
      'An arrow presses on the sensor’s left-hand face and grows longer as it descends; the arrow’s length is the pressure.',
      'Behind the arrow’s tail a coloured wedge is left standing, beginning at the waterline where the push is nothing, and the sloping edge of that wedge stays perfectly straight.',
      'The descent halts once at a depth marked h, where the arrow’s tail lands exactly on a line marked p.',
      'The sensor then falls one more step of the same size in the same time, and the arrow it had at h stays behind as a faint thin copy for the comparison.',
      'At 2h the tail lands on the line marked 2p, exactly twice the faint copy, and the wedge’s straight edge passes through both crossing points without bending.',
      'Four ruled lines are all that is drawn — two across at h and 2h, two down at p and 2p — and no numbers appear anywhere, only those symbols.',
    ],

    screen: {
      affordances: [
        'The descent, the two halts and the return all run by themselves in one round; nothing is offered to drag, so the sensor always stops exactly on h and on 2h rather than near them.',
        'The two steps take the same time, so the arrow growing at a steady rate shows up as a speed as well as a pair of readings.',
        'The pressure is read as a length against ruled lines rather than as a number, so the claim is a ratio the eye can check.',
        'The arrow starts from nothing at the waterline, which is what lets the wedge’s straight edge stand for proportion rather than for mere increase.',
        'Only one face of the sensor carries an arrow, so nothing invites a reading of what the other faces are getting.',
      ],
    },

    useWhen: [
      'The article has given the proportionality as a formula and the reader holds it without a picture of what proportional looks like. A straight wedge edge running through both crossing points is that proportion as a shape.',
      'The reader accepts that the pressure grows but has no sense of how fast, and the moment wanted is the one where the second arrow stands at exactly twice the faint copy of the first.',
    ],

    avoidWhen: [
      'The claim concerns absolute pressure, or the atmosphere pressing on the surface as well. The arrow begins from nothing at the waterline, which holds only for the water’s own share.',
      'The point is that the push does not depend on which way a surface faces. One face carries an arrow here and the other three are left bare on purpose.',
      'The article turns on the shape of the vessel or on how much liquid it holds. The tank is one plain straight-sided box with nothing set beside it.',
      'The fluid in the article is air, and what is above rather than below is what presses.',
      'Figures are wanted in pascals or metres. Only the symbols h, 2h, p and 2p are written.',
      'The liquid in the article is flowing or being driven. The water is still and only the sensor moves through it.',
    ],

    contrastWith: [
      {
        concept: 'pressure-isotropy',
        note: 'One varies the depth and finds a proportional change; the other stays at one depth and varies the orientation of a surface, finding none.',
      },
      {
        concept: 'pressure-and-container-shape',
        note: 'One says what depth does to the pressure; the other says what nothing else does to it — neither the shape of the vessel nor the amount it holds.',
      },
      {
        concept: 'atmospheric-pressure',
        note: 'Both build a pressure out of what stands above, but one has a liquid of unchanging density, where the growth is exactly proportional, and the other a gas that thins as it rises.',
      },
      {
        concept: 'buoyancy',
        note: 'One follows the push on a single face as it goes down; the other sets the pushes on two faces of one body against each other and keeps only what is left over.',
      },
    ],
  },
};
