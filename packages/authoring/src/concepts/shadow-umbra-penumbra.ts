/**
 * shadow-umbra-penumbra 개념 선언.
 *
 * 빛의 직진 셋 가운데 하나. **주장이 갈린 자리** —
 *   rectilinear-propagation  점광원 · 가림판 자리 → 그림자의 **끝이 어디인가**
 *   shadow-umbra-penumbra    거리는 고정, 광원의 **크기** → 그림자가 **몇 겹인가**
 *   pinhole-camera           구멍 → **상**의 밝기와 또렷함
 * 이쪽만 크기 있는 광원 · 두 겹 · 부드러운 가장자리 · 「광원이 얼마나 보이는가」 어휘를 갖는다.
 * 가림판을 옮기는 일도, 배수를 재는 일도 없다 — 그것은 이웃의 몫이다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const shadowUmbraPenumbraConcept: Aperi21ConceptSource = {
  id: 'shadow-umbra-penumbra',
  label: 'The Two Layers of a Shadow Cast by a Source with Size',
  canonicalSim: 'aperi21:shadow-umbra-penumbra',

  surface: {
    definition:
      'The two-layered shadow a source with size casts — a core from which none of the source can be seen, ringed by a band from which part of it still can — and how a larger source narrows that core.',
    exemplarKeywords: [
      'umbra and penumbra',
      'why shadow edges are fuzzy',
      'soft shadow',
      'an extended light source',
      'a long strip light makes a blurred outline',
      'partial shadow around the dark middle',
      'how much of the lamp is still in view from here',
      'total and partial darkness',
      'fluorescent tube versus a bare filament',
      'the dark core of a shadow',
      'gradual edge instead of a sharp line',
    ],
  },

  briefing: {
    observable: [
      'In a dark room an upright glowing bar stands on the left, a plate in the middle and a screen on the right; the bar is what lights everything.',
      'Four straight lines run from the ends of the bar past the edges of the plate. Two are solid and two are dashed, and between them they cut the screen into three: a black middle, a graded band above and below it, and full light beyond.',
      'The black middle is as dark as the room, and the graded bands really are graded — the screen brightens by degrees from the edge of the black middle out to where the light is complete.',
      'Behind the plate a solid black wedge tapers away, and around it a paler flare spreads from each edge of the plate, so the shadow in mid-air is two things rather than one.',
      'A curve stands upright beside the screen, ruled against the same heights: it reads zero across the black middle, climbs through the graded band, and reaches one where the screen is fully lit.',
      'Beyond the curve, brackets measure the black middle and the band above it, and the two are named.',
      'The bar then grows taller. The solid lines swing inward and the dashed ones outward, the black middle narrows as the graded bands widen, and the curve’s climb slackens from a near-cliff into a long slope.',
      'At the largest bar only a narrow black strip is left in the middle of the screen while the graded bands cover nearly all of it, and the curve has become a shallow V.',
      'The bar shrinks back and the black middle spreads again, and the round begins over.',
    ],

    screen: {
      affordances: [
        'The bar grows in two steps, holds at each, and shrinks back, over and over, with nothing to press.',
        'The plate, the screen and every distance between them stay exactly as they are — across a whole round the one thing that changes is how long the glowing bar is.',
        'The four lines, the wedge behind the plate, the graded brightness across the screen and the upright curve are all worked out from the same quantity — how much of the bar can be seen from each point — so the place where the curve leaves zero is the place where the solid line lands.',
        'The two layers are told apart by line style rather than colour: solid for the edge of the black core, dashed for the outer edge of the graded band.',
        'The writing on screen is names and two marks: source, plate, screen, umbra, penumbra, and a zero and a one on the curve.',
        'The screen opens with the smallest bar already lit and its shadow already cast.',
      ],
    },

    useWhen: [
      'The article has said that real shadows have soft edges and the reader is likely to file it under imperfection. Here the softness is built out of straight lines: it is the region from which part of the source is still in view, and the curve beside the screen says exactly how much.',
      'The point being made is that a small source gives a crisp outline and a broad one gives a washed-out one, and the article wants that traced to a cause rather than stated. Growing the bar narrows the core and widens the graded band in one motion.',
    ],

    avoidWhen: [
      'The article is about how large a shadow is, or about moving the object between lamp and wall. Every distance here is pinned down and only the source changes size.',
      'The claim concerns an image — something recognisable thrown onto a surface. The plate is a plain rectangle, and what lands is a shadow in two layers.',
      'The subject is the Sun, the Earth and the Moon, or why an eclipse is rare. The bodies here are a lamp, a plate and a wall, and nothing orbits.',
      'The article wants the size of the source, the distances, or the width of either band in figures. No quantity is written anywhere; the bands are shown by brackets and by shape.',
      'The point is what happens when light passes an edge in a way straight lines cannot explain — the spreading that comes of light being a wave. Every edge here is built from straight lines only.',
    ],

    contrastWith: [
      {
        concept: 'rectilinear-propagation',
        note: 'One asks why a shadow has two layers at all, and answers with the size of the source; the other allows the source no size and asks instead where the single sharp edge falls.',
      },
      {
        concept: 'eclipse',
        note: 'One is the two-layered shadow itself, watched at leisure as the source grows; the other takes that shadow as given and asks how rarely the bodies line up for it to land.',
      },
      {
        concept: 'pinhole-camera',
        note: 'One has a source of some size blocked by an object, which is what blurs the edge of what is missing; the other has an object of some size seen through a gap, which is what blurs the edge of what is formed.',
      },
    ],
  },
};
