/**
 * specular-diffuse-reflection 개념 선언.
 *
 * 거울 무리의 곁. `law-of-reflection` 과 가장 가깝고 그래서 가장 조심해 갈랐다.
 *   law-of-reflection            줄기 **하나** · **각 하나** — 같은 값이다. 법선은 하나뿐이다
 *   specular-diffuse-reflection  줄기 **여섯** · 각을 재지 않는다 — **법선이 자리마다 기울어** 나란함이 깨진다
 * 이쪽만 거칠기 · 흩어짐 · 매끈한 면 ↔ 거친 면 · 「법선이 제각각」 어휘를 갖는다.
 * 입사각 · 반사각 · 각도 값은 쓰지 않는다 — 화면에 호도 각도 글자도 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const specularDiffuseReflectionConcept: Aperi21ConceptSource = {
  id: 'specular-diffuse-reflection',
  label: 'Why a Rough Surface Scatters What a Smooth One Keeps Together',
  canonicalSim: 'aperi21:specular-diffuse-reflection',

  surface: {
    definition:
      'Why a smooth surface sends a parallel sheaf of light away still parallel while a rough one throws it in all directions: each spot obeys the same bounce, but the surface tilts its own way there.',
    exemplarKeywords: [
      'specular and diffuse reflection',
      'why you cannot see your face in a sheet of paper',
      'a rough surface scatters light',
      'matte versus glossy finish',
      'why a wet road glares at night',
      'light thrown back in all directions',
      'polished metal against unpolished metal',
      'why paper looks white from every direction',
      'surface roughness decides the reflection',
      'scattering off a wall',
      'magnified view of a rough surface',
    ],
  },

  briefing: {
    observable: [
      'Two panels stand side by side, the left one a flat surface and the right one a sawtooth ridge named as a magnified view of a rough one.',
      'Six beams come down onto each panel from the upper left, evenly spaced and all in the same direction, so both panels are given exactly the same light.',
      'Off the left panel the six leave still evenly spaced and still parallel, a sheaf that has merely changed direction.',
      'Off the right panel the six leave in six different directions — one back up to the left, one nearly straight up, others fanning over to the right until one runs almost flat.',
      'A short dashed line is then raised at every spot a beam landed. On the left panel the six stand upright and parallel; on the right each leans its own way, following the little face it stands on.',
      'Beside each dashed line the beam that left is on the opposite side of it from the beam that arrived — on the rough panel just as plainly as on the smooth one.',
      'The beams fade, come down again and bounce again, so the moment the sheaf comes apart can be watched rather than inferred.',
      'The two panels are drawn in the same colour and the same weight; the only difference between them is that one edge is a straight line and the other is a run of small tilted faces.',
    ],

    screen: {
      affordances: [
        'One round brings the beams down, sends them off, holds the scattered picture, then raises the dashed lines and holds again, before starting over; nothing has to be pressed.',
        'Both panels get the same number of beams from the same direction at the same moment, so anything that differs afterwards is down to the surface.',
        'The outgoing directions are not drawn to a plan — each is worked out by bouncing that beam off the little face it actually landed on, which is what makes the rough panel’s spray evidence rather than decoration.',
        'The rough surface is the same shape every time the screen is opened, so a passage written about a particular beam stays true.',
        'The magnified view is named as magnified, since a genuinely rough surface has bumps far too small to see.',
        'The screen opens on the scattered picture, already bounced, rather than on an empty surface.',
      ],
    },

    useWhen: [
      'The article has told the reader that most things are seen by scattered light while mirrors are the exception, and the reader has taken these as two different kinds of bouncing. Here the sawtooth makes one kind of both: the same bounce at every spot, on faces that point different ways.',
      'The point being made is that smoothness is relative to the light rather than a property one can see, and a magnified picture is what carries it — a surface that looks flat to the eye is a run of tilted faces to the beam.',
    ],

    avoidWhen: [
      'The article needs the angle out named or measured against the angle in. No arcs and no figures appear here; what is shown is which way the beams go, not by how much.',
      'The subject is an image — where a reflection stands, how many there are, or whether it is upright. Nothing is placed in front of either panel and neither forms an image.',
      'The claim is that a rougher surface scatters more than a slightly rough one. Two surfaces are shown, one flat and one rough, and neither changes while the screen runs.',
      'The article is about light being taken in by a surface, about colour, or about why a thing looks the colour it does. Every beam here leaves again, and all of them are drawn alike.',
      'The surface in the article is curved on purpose so as to gather or spread light in an orderly way. The tilts here are irregular and lead nowhere in particular.',
    ],

    contrastWith: [
      {
        concept: 'law-of-reflection',
        note: 'One establishes that the two angles about the line square to the surface match; the other takes that as settled and shows what follows when the direction of that line is not the same from spot to spot.',
      },
      {
        concept: 'plane-mirror-image',
        note: 'One is about a surface too disorderly to send a sheaf anywhere together, and so forms nothing; the other is about the orderly case, where the light kept together is what lets an eye place a reflection somewhere.',
      },
      {
        concept: 'multiple-mirror-images',
        note: 'One has many beams off one surface leaving in many directions with no image at all; the other has two flat surfaces put at an angle and counts the images they make between them.',
      },
    ],
  },
};
