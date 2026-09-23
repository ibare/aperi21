/**
 * keplers-first-law 개념 선언.
 *
 * 위험한 형제는 `elliptical-orbit` 이다 — 둘 다 타원 · 두 초점이다. **주장을 갈랐다.**
 *   keplers-first-law  모양은 처음부터 하나 — **태양이 한가운데가 아니라 한 초점에 앉고** 반대쪽은 비었다.
 *                      두 거리는 주고받지만 **합은 늘 같다**(끈과 두 핀)
 *   elliptical-orbit   빈 초점을 **손잡이로 써서** 원을 길쭉하게 바꾼다 — 이심률이 주인공
 * 이쪽만 「한가운데가 아니다 · 끈 · 두 핀 · 합이 일정」 어휘를 갖고, 「이심률 · 벌린다 · 길쭉해진다」 는
 * 저쪽에 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const keplersFirstLawConcept: Aperi21ConceptSource = {
  id: 'keplers-first-law',
  label: 'The Star at One Focus and the Unchanging Sum of Two Distances',
  canonicalSim: 'aperi21:keplers-first-law',

  surface: {
    definition:
      'The central star stands not at the middle of the path but at one of two focal points, the other holding nothing, and the two distances from the planet to them trade length while their total never changes.',
    exemplarKeywords: [
      'Kepler’s first law',
      'the Sun is at a focus, not at the centre',
      'planets move in ellipses',
      'the two foci of an orbit',
      'drawing an ellipse with a string and two pins',
      'the sum of the distances to the foci is constant',
      'the other focus has nothing in it',
      'where exactly is the Sun in the orbit',
      'why is the Sun off to one side',
      'the centre of the orbit is empty space',
    ],
  },

  briefing: {
    observable: [
      'A planet travels an oval path, and at the middle of that oval there is a small cross with the word for the centre beside it — nothing occupies it.',
      'The star sits away from that cross, off toward one end, so that the place everything goes around and the place at the middle are visibly not the same place.',
      'A hollow circle then rises at the position mirroring the star across the centre, and a dashed line joins the two through the cross; the star is filled and the other is only an outline, marking them as the same kind of place with one of them empty.',
      'A single accent-coloured string is then strung from the star to the planet and on to the empty point, bending at the planet as it travels.',
      'Beside the path, that same string is laid out straight: its left end is a filled copy standing for the star, its right end a hollow copy standing for the empty point, and a planet dot between them sits as far from the left end as the planet is from the star.',
      'As the planet goes round, the two lengths of the bent string trade — one grows exactly as the other shrinks — while on the straight version the dot slides from one end toward the other and the two ends never move.',
      'The string is drawn as one piece in one colour, so which part belongs to which end is told by the copies at its ends and not by a change of colour.',
      'The star and the empty point are the same grey and the same size, with the star filled and the other left hollow, so the star is not made to look special.',
      'The names of the star, the centre and the empty point each sit on a small patch of background, since the string passes over them as it travels.',
      'No lengths, no distances and no letters for the axes are written anywhere.',
      'The run goes nearly twice round and then repeats by itself.',
    ],

    screen: {
      affordances: [
        'The circling, the appearance of the second point, the stringing and the fading happen in order and then begin again; nothing has to be pressed.',
        'The straight-laid string is what does the measuring: its two ends stay put while the dot slides between them, so a constant total is seen without any number or ruler.',
        'The centre is marked separately from the star, which is what makes being off-centre a stated fact rather than an accident of the drawing.',
        'The accent colour is kept for the string alone, and the two parts of it are not distinguished, since they are one string.',
        'The star and the empty point are drawn alike apart from the fill, so that the empty one reads as a real place of the same kind rather than as decoration.',
        'The shape of the path never changes during the run, so nothing here competes with the question of where the star is within it.',
      ],
    },

    useWhen: [
      'The article has stated that orbits are ellipses with the Sun at a focus and the reader pictures it near the middle anyway. The marked centre with nothing in it, and the star sitting away from it, is what makes the off-centring a fact of the picture.',
      'The prose wants the string-and-two-pins construction carried over to an orbit, and needs the constant total shown as something that stays put while the parts move.',
    ],

    avoidWhen: [
      'The article changes how stretched the orbit is, compares a round orbit with a long one, or turns on eccentricity. The path here keeps one shape for the whole run.',
      'The point is the planet going faster when near and slower when far, or sweeping equal areas in equal times. The planet does move that way here, but nothing sweeps, marks or times it.',
      'What is needed is a relation between the size of an orbit and how long a lap takes. Only one orbit appears and no lap is timed.',
      'The subject is how an orbit comes about — a launch, a speed, a pull doing the turning. No forces and no speeds are drawn; the path is simply there.',
      'The article needs the geometry named in symbols — semi-major axis, the distance to a focus, a value for the eccentricity. Nothing here carries a letter or a figure.',
      'The two bodies in the article go round a point between them, or the star is moved by its companion. The star here is planted at its focus.',
    ],

    contrastWith: [
      {
        concept: 'elliptical-orbit',
        note: 'One keeps the shape fixed and asks which point in it the star occupies and what holds constant as the planet travels; the other uses the second point as a handle and changes the shape with it.',
      },
      {
        concept: 'circular-orbit',
        note: 'One is about where the central body is within a path that is not round; the other is about the one path where that question has no bite, since the two focal points are the same place.',
      },
      {
        concept: 'center-of-gravity',
        note: 'Both are about a particular point being singled out inside a shape, but one is a point of the geometry that the path is drawn from, and the other is a point that mass decides.',
      },
      {
        concept: 'trajectory-equation',
        note: 'Both describe a path with the time taken out of it, but one writes it as a relation between coordinates and the other as a property two fixed points share with every point of the curve.',
      },
    ],
  },
};
