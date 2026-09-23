/**
 * solar-altitude-shadow 개념 선언.
 *
 * 공전 · 계절 넷 가운데 하나. **무엇을 주장하는지로 갈랐다.**
 *   solar-altitude-shadow            고도 **하나**가 그림자 길이와 땅 한 칸의 빛을 **동시에** 정한다 — 계절도 시각도 말하지 않는다
 *   seasonal-sun-path                계절이 태양의 하루 길을 어디로 옮기나 — 고도의 원인
 *   axial-tilt-seasons               축의 기울기가 반구의 햇빛 몫을 어떻게 정하나
 *   earth-revolution-constellations  밤 쪽이 어느 방향을 향하나 — 한밤의 별자리
 * 이쪽만 막대 · 그림자 길이 · 같은 폭의 햇빛 · 넓이당 빛 어휘를 갖는다.
 * 기온은 화면에 없다 — 데워짐은 넓이당 빛으로만 보이므로 avoidWhen 으로 되돌린다(간극 장부 참조).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const solarAltitudeShadowConcept: Aperi21ConceptSource = {
  id: 'solar-altitude-shadow',
  label: 'Sun Height, Shadow Length and Light per Area',
  canonicalSim: 'aperi21:solar-altitude-shadow',

  surface: {
    definition:
      'How one height of the Sun fixes both the length of a stick’s shadow and how widely a fixed width of sunlight spreads across the ground it reaches.',
    exemplarKeywords: [
      'the Sun’s altitude above the horizon',
      'why are shadows shortest around noon',
      'a stick and its shadow',
      'sunlight arriving at a slant',
      'why is it colder near the poles',
      'the same beam spread over more ground',
      'angle at which sunlight strikes the ground',
      'why the high Sun warms the ground more',
      'light falling per unit of area',
      'shadow length and the height of the Sun',
    ],
  },

  briefing: {
    observable: [
      'On the left a stick stands on the ground, seen from the side, with one ray running from the Sun past the tip of the stick to the end of its shadow, so that the ray is what sets the shadow’s length.',
      'The shadow is a dark band lying on lit ground; as the Sun climbs, the ray stands up and the band pulls back toward the foot of the stick.',
      'A wedge in the accent colour at the shadow’s end marks the height of the Sun, and the heights already held this round are left as marks reading 20°, 45° and 70° — the one being held in the accent colour, the ones passed in faint.',
      'On the right a shaft of sunlight of fixed width comes down onto a dark strip of ground, drawn as a band with six rays inside it and a dimension line across its width.',
      'With the Sun low the shaft lies over, its six rays land far apart, the dimension line for the ground they cover is long, and that ground is dim.',
      'With the Sun high the shaft stands up, the same six rays land close together on a short stretch, and that stretch is the brightest thing on the panel.',
      'A bar beside it fills against a frame set by a Sun directly overhead, growing as the Sun climbs and leaving a faint mark at each height already held, so three fills can be set against one another.',
      'The Sun’s disc rides at a fixed distance back along the ray, so it sits low in the frame when the shadow is long and high when it is short.',
      'Then the Sun sinks again and the shadow stretches, the shaft lies over, the ground it covers widens and darkens, and the bar falls back past its marks.',
      'The rays on the right stay parallel to the single ray on the left the whole time, so the two panels are plainly the same sunlight.',
    ],

    screen: {
      affordances: [
        'Three heights come in order — held, climbed to, held again — and then the Sun sinks back and the run repeats; the arrival point is the low Sun already holding its long shadow.',
        'The height in degrees is written only while one of the three is being held, not while the Sun is on its way between them.',
        'Brightness is used rather than colour for the shadow and for lit ground, so the shadow reads as the dark place in any surroundings.',
        'No lengths are given as numbers; the marks left behind by earlier heights are what the present shadow and the present bar are read against.',
      ],
    },

    useWhen: [
      'The article has claimed that light arriving at a slant warms less, and the reader has nothing behind the words. A fixed width of sunlight spreading over more ground as the Sun drops makes the dilution the thing on the screen rather than a factor in a formula.',
      'The prose needs the shortening shadow and the stronger sunlight to be the same fact, and two panels driven by one ray, with three heights left as marks in both, will carry that.',
    ],

    avoidWhen: [
      'The article is about seasons, the length of the day, or where the Sun rises. Nothing here says what time of year or of day it is; only a height is set.',
      'The point is a temperature — degrees, a thermometer, how hot the ground actually gets. Warming appears here only as how much light lands on a patch.',
      'A formula for shadow length or measured values are needed. Nothing is computed on the screen beyond the three held heights.',
      'The subject is the second reason a low Sun is weak, its longer path through the air. No atmosphere is drawn and the rays arrive undiminished.',
      'The article is about shadows as shapes — umbra and penumbra, shadows of extended bodies, sharpness of edges.',
      'The reader is to be shown why the Sun’s height changes at all. It simply climbs and sinks here, with no cause offered.',
    ],

    contrastWith: [
      {
        concept: 'seasonal-sun-path',
        note: 'One takes a height as given and works out what it does to a shadow and to a patch of ground; the other asks what the season does to that height in the first place.',
      },
      {
        concept: 'axial-tilt-seasons',
        note: 'One is local and momentary — this Sun, this stick, this patch; the other is the whole orbit’s account of why one hemisphere catches more than its half.',
      },
      {
        concept: 'earth-rotation-day-night',
        note: 'One is about how steeply light lands where it lands; the other about whether a place is in the light at all.',
      },
    ],
  },
};
