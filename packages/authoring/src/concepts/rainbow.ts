/**
 * rainbow 개념 선언.
 *
 * 색 갈라짐 셋 가운데 **어디에 서는가**를 다루는 쪽이다.
 *   rainbow     물방울에서 꺾이고 되비쳐 나온 빛이 **한 각에 몰린다** — 그 각이 하늘의 띠 높이가 된다
 *   dispersion  굴절률이 파장마다 다른 것 — 면 하나 · 곡선 (형제)
 *   prism       면 둘 · 스크린의 띠 (형제)
 * 이쪽만 물방울 · 안쪽 되비침 · 몰림 · 42°/40° · 해를 등진 하늘 · 바깥이 빨강 어휘를 갖는다.
 * 굴절률-파장 곡선(dispersion 몫)과 꼭지각 · 스크린(prism 몫)은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rainbowConcept: Aperi21ConceptSource = {
  id: 'rainbow',
  label: 'Why the Bow Stands at One Height with Red Outside',
  canonicalSim: 'aperi21:rainbow',

  surface: {
    definition:
      'What sunlight does inside a raindrop and where it ends up: bent going in, reflected off the back, bent going out, the rays pile up near forty-two degrees from the sun’s line.',
    exemplarKeywords: [
      'rainbow',
      'why is a rainbow always opposite the sun',
      'forty-two degrees',
      'refraction and one internal reflection in a raindrop',
      'why is red on the outside of the bow',
      'the rainbow angle',
      'sunlight in falling drops of water',
      'the Descartes ray',
      'why a rainbow is an arc and not a patch',
      'rain in front of you and the sun behind you',
    ],
  },

  briefing: {
    observable: [
      'The screen holds two dark panels. On the left one large drop is drawn with a row of parallel sunlight rays running into it from the side.',
      'Only the red light is followed at first: each ray bends as it enters the drop, strikes the far inside wall and comes back off it, and bends again as it leaves, heading back roughly the way it came.',
      'The leaving rays are drawn out to an arc, and a dot is left where each one meets it. Near the top of the arc the dots are sparse, and toward the lower end they crowd together, thickly, at one place marked with the figure for the red angle.',
      'A dashed reference line runs back toward the sun, and the marked angle is measured from that line, so the crowding has a direction to be counted from.',
      'The red then dims and the violet light is taken through the same route. Its dots crowd at a slightly smaller angle, marked with its own figure.',
      'On the right panel the scene changes to a side view of the sky: a cloud of small drops, an eye with the sun behind it, and a dashed horizontal line running back toward the sun from the eye.',
      'Sunlight reaches two of those drops, one at the red angle above the line and one a little lower at the violet angle, and from each a ray of that colour runs down to the eye.',
      'Then the drops at every height between those two light up, each in the colour that crowds at its own height, and their rays converge on the eye as a wedge — red at the top, on the outside, and violet at the bottom.',
      'A note says the spread between the colours has been exaggerated, giving the factor, while the angle figures on screen are the real ones.',
    ],

    screen: {
      affordances: [
        'The round goes through the single drop twice, once for red and once for violet, then moves to the sky, over and over, with nothing to press.',
        'The crowding is shown as how densely dots fall on an arc rather than stated as a number, so the reader sees a pile-up instead of being told there is one.',
        'The same exaggeration is applied on both panels, so the angle at which the drop sends red out and the height at which a drop in the sky glows red never disagree.',
        'The two angle figures are the real ones and are written on tags, while the angles actually drawn are stretched apart; what the figures fix is the order and the near-equality, not the picture’s geometry.',
        'Every ray is drawn in the colour of its own light, and the drops in the sky take the colour that crowds at the height they occupy.',
        'One reflection off the inside wall is followed and no more, which is what puts the band where it is.',
        'The drops in the sky are scattered by a fixed recipe rather than freshly at random, so the same sky comes back every round.',
        'The screen opens on the left panel with the sunlight already entering the drop.',
      ],
    },

    useWhen: [
      'The article has said a rainbow appears at a fixed angle and the reader cannot see why an angle would be fixed when the drops are everywhere. The dots piling at one end of the arc are the answer, and they are watched accumulating.',
      'The reader is told to stand with the sun behind them and takes it as folklore. The second panel puts the eye, the sun’s direction and the two heights in one picture, so the instruction becomes a consequence.',
      'The article needs the order of the colours explained rather than remembered. Red and violet crowd at slightly different angles on the left panel, and that difference is carried straight over into which drops send which colour to the eye.',
    ],

    avoidWhen: [
      'The subject is why the index of water differs between colours, or the shape of the index-against-wavelength relation. That difference is used here without being shown.',
      'The article is about a block of glass, an apex angle, or a spectrum caught on a screen. The light here comes back toward its source and is caught by an eye looking up.',
      'The point is the fainter second bow outside the first, its reversed colours, or the dark sky between the two. Only one reflection is followed here.',
      'The subject is a ring around the sun or moon, which comes from ice crystals, or coloured fringes from thin films and gratings. Everything here happens in round drops of water.',
      'The article is about why the daytime sky is blue or why the sun reddens at the horizon. Nothing here is scattered sideways by small particles.',
      'A drawing of the bow as an arc across the landscape, or its dependence on the sun’s height, is what is wanted. The sky here is shown from the side, as heights above a line.',
    ],

    contrastWith: [
      {
        concept: 'dispersion',
        note: 'One gives the material property that makes colours part; the other follows what becomes of that parting once the light has been round a sphere and has to reach an observer.',
      },
      {
        concept: 'prism',
        note: 'Both end in an ordered band, but one lays it on a screen a short way past two flat faces, while the other sends the light back the way it came and the band is made of separate drops, each seen at its own height.',
      },
      {
        concept: 'mirage',
        note: 'Both place something in the sky where the observer’s own line of sight puts it; one does so because rays from countless drops pile at one angle, the other because a single ray was curved by the air on its way in.',
      },
    ],
  },
};
