/**
 * polarization 개념 선언.
 *
 * 편광 넷 가운데 **판이 셋**인 쪽이다. 무엇을 주장하는지로 갈랐다.
 *   polarization    주장 = 엇갈린 두 판 사이에 판을 **하나 더 끼우면 빛이 되살아난다**
 *   malus-law       주장 = 판 하나의 각에 따라 **세기가 얼마나 주는가**(성분보다 빨리)
 *   brewster-angle  주장 = **반사광**이 한 각에서 한 방향 떨림만 남는다
 *   birefringence   주장 = 결정 속에서 한 줄기가 **둘로 갈라져** 상이 두 겹이 된다
 * 이쪽만 「세 판 · 엇갈림 · 끼운다 · 되살아난다 · 진동면이 기울어진다」 어휘를 갖고, 세기의 감소율 ·
 * 코사인 제곱 · 반사 · 갈라짐은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const polarizationConcept: Aperi21ConceptSource = {
  id: 'polarization',
  label: 'Light Brought Back by a Third Filter',
  canonicalSim: 'aperi21:polarization',

  surface: {
    definition:
      'Why light returns when a third filter is slipped between two crossed ones: every filter keeps only the part of the vibration lying along its own axis, so a tilted filter leaves a part for the last one to pass.',
    exemplarKeywords: [
      'polarization of light',
      'three polarising filters',
      'crossed polarisers block the light',
      'adding a filter makes it brighter instead of darker',
      'polaroid sunglasses',
      'the plane in which light vibrates',
      'transmission axis of a filter',
      'two filters at right angles let nothing through',
      'turning a filter makes the light come and go',
      'why does a third sheet let light through',
      'light as a transverse vibration',
    ],
  },

  briefing: {
    observable: [
      'Light travels along a path drawn from the left toward a screen at the right, seen from a slanted viewpoint so that the direction of travel and the direction of the vibration are both visible at once.',
      'The vibration is drawn as a running set of spokes standing out from the path, with a curve through their tips, so its direction and its size can be read directly.',
      'Before the first filter the spokes point every which way in short bursts, each burst in its own direction, which is what unpolarised light is made to look like.',
      'Three filters stand across the path, each with lines ruled across it in the direction it passes, and a marked axis; the outer two are fixed at right angles to one another and the middle one carries the angle being used.',
      'The round opens with the middle filter lifted clear of the path. After the last filter there are no spokes at all, and the screen is dark.',
      'The middle filter then comes down into the path at a tilt. Spokes appear after the last filter where there were none, and light spreads on the screen.',
      'The middle filter turns to square up with the first. The spokes after it stand upright, the last filter stops them, and the screen goes dark again.',
      'Turning it on further brings the spokes back and the screen brightens once more, and a line beneath says in turn that the light is blocked, that it is faint, and that it has come back.',
      'After every filter the spokes are shorter than before it and point along that filter’s axis, so the passing is seen as a turning and a shortening rather than a simple dimming.',
      'The middle filter is finally lifted out again, the screen goes dark, and the round begins again.',
    ],

    screen: {
      affordances: [
        'A control puts the middle filter into the path or lifts it out, and a second control turns it through any angle from zero to a half turn; taking hold of either stops the automatic round and hands over the current setting.',
        'The round runs on its own until it is touched, going through insertion, ninety degrees, a half turn and removal, so the claim arrives once without anything being pressed.',
        'The filter that is lifted out is kept above the path rather than removed from the picture, so the before and the after are visibly the same filter.',
        'The brightness on the screen is worked out as light itself, which keeps darkness dark whatever the surrounding page looks like.',
        'The ruling on each filter is drawn along the direction it passes, which is what lets the vibration after a filter be checked against the filter it has just come through.',
        'The strong colour is spent on the middle filter alone — its axis, its angle and its control — since that is the one being inserted and turned.',
        'The unpolarised light before the first filter is drawn burst by burst with each burst’s own direction, rather than averaged into a single figure.',
        'The angle of the middle filter is the one figure on screen, with the outer two marked at their fixed settings.',
      ],
    },

    useWhen: [
      'The article has said that two crossed filters block light and that a third one between them lets it through, and the reader takes it for a trick. Watching the spokes appear after the last filter the moment the middle one drops in is what makes it a mechanism.',
      'The point being made is that a filter does not merely dim light but selects a direction of vibration. The spokes turning to lie along each filter’s axis as they pass is that selection drawn.',
      'The reader is invited to work out at which angle the recovered light is brightest; the middle filter can be turned by hand and the screen answers directly.',
      'The article needs light established as a vibration across the direction of travel before anything is calculated about it. The slanted view carries both directions at once.',
    ],

    avoidWhen: [
      'The article works out how much light survives at a given angle, or needs the numbers a quarter, a half and three quarters. No intensity figure and no curve appear here; the screen is bright or dim and a line says which.',
      'The subject is light polarised by bouncing off a surface, glare, or the angle at which reflection does it. The light here is polarised by passing through filters and nothing is reflected.',
      'The subject is a crystal that splits one beam into two, or an image seen doubled. There is one beam here all the way through.',
      'The article is about colour, wavelength, or anything a filter does to particular colours. All the light here is one colour and what changes is the direction of vibration.',
      'The point turns on the magnetic part of the wave, on circular or elliptical polarisation, or on how a filter actually absorbs. Only one vibration direction is drawn and the filters are treated as a choice of axis.',
      'The subject is sound, or a wave that cannot vibrate across its direction of travel. Everything here depends on there being a direction to select.',
    ],

    contrastWith: [
      {
        concept: 'malus-law',
        note: 'One asks whether anything gets through at all once a filter is added, and answers with a vibration that reappears; the other takes passage for granted and asks how much of it survives at each angle.',
      },
      {
        concept: 'brewster-angle',
        note: 'Both end with light vibrating in one direction only, reached differently — one selects it by passing the light through filters, the other finds it already selected in what a surface reflects.',
      },
      {
        concept: 'birefringence',
        note: 'One removes all but one direction of vibration and asks what is left; the other keeps both directions and sends them along different paths.',
      },
      {
        concept: 'transverse-wave',
        note: 'One establishes that the vibration is across the direction of travel; the other exploits that fact, selecting among the directions available across it.',
      },
    ],
  },
};
