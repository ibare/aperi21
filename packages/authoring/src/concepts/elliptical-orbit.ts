/**
 * elliptical-orbit 개념 선언.
 *
 * 위험한 형제는 `keplers-first-law` 다 — 둘 다 타원 · 두 초점이다. **주장을 갈랐다.**
 *   elliptical-orbit   빈 초점을 **손잡이로 쓴다** — 벌리면 원이 길쭉해지고 근점은 안으로 원점은 밖으로
 *                      같은 만큼 간다. 긴반지름이 그대로라 한 바퀴 시간도 그대로
 *   keplers-first-law  모양은 처음부터 하나 — **중심 천체가 어디 앉는가**와 두 거리의 합이 늘 같다는 것
 * 이쪽만 「이심률 · 벌린다 · 길쭉해진다 · 근점/원점이 원 안팎으로」 어휘를 갖고, 「끈 · 두 핀 · 합이
 * 일정 · 한가운데가 아니다」 는 저쪽에 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const ellipticalOrbitConcept: Aperi21ConceptSource = {
  id: 'elliptical-orbit',
  label: 'Stretching a Circle by Drawing the Second Focus Away',
  canonicalSim: 'aperi21:elliptical-orbit',

  surface: {
    definition:
      'Drawing the second, empty focus away from the central body turns a circular path into a longer and longer one, its near end coming in by as much as its far end goes out, with the lap taking as long as before.',
    exemplarKeywords: [
      'eccentricity of an orbit',
      'what makes an orbit stretched instead of round',
      'how elongated is this orbit',
      'nearest point and furthest point of an orbit',
      'the other focus is empty',
      'a comet’s long thin orbit against a planet’s round one',
      'from a circle to an ellipse',
      'why some orbits are nearly circular',
      'pulling the foci apart',
      'the orbit gets longer but the lap takes the same time',
    ],
  },

  briefing: {
    observable: [
      'A central body sits still at one place for the whole run, and a planet travels round it; at the start the path is a circle with the central body at its middle and a small reading above it saying that the eccentricity is zero.',
      'A hollow circle — the second focus, holding nothing — then separates from the central body and moves outward, with a bar in the accent colour drawn between the two.',
      'As that bar lengthens, the path stretches out the same way, and the circle it used to be stays behind as a faint dashed outline.',
      'At each resting value that reading gives the eccentricity, and the near end of the path lies inside the dashed circle while the far end lies outside it.',
      'The further the bar is drawn out, the closer the near end comes to the central body and the further the far end goes; the words for those two ends stand above the two tips of the path.',
      'Between resting values the reading is blank while the stretching is going on, so no figure is ever shown for a shape the run is passing through.',
      'A second, ghostly point keeps going round the dashed circle at an even rate while the planet races through its near end and dawdles at its far end, and the two of them come back level on the same line twice a lap.',
      'At the end the empty focus returns to the central body, the bar and the dashed outline are taken away, and the path is a circle again.',
      'The central body never moves; what moves is the empty focus, and the path, its near end and its far end all follow from that.',
      'No distances, no periods and no formula for the ends are written — only the eccentricity readings and the names of the two ends.',
      'The whole cycle runs and repeats by itself.',
    ],

    screen: {
      affordances: [
        'The stretchings and the pauses at each eccentricity happen in order and then begin again; nothing has to be pressed.',
        'The central body is held fixed and the empty focus is the thing that moves, so that the near end approaching it reads as the path coming in rather than the body sliding over.',
        'The circle of the same size is kept on screen as a dashed ghost, which is what lets the near end coming in and the far end going out be seen as equal amounts.',
        'The accent colour is kept for the bar between the two foci alone, so the one quantity being changed is present on screen as a length.',
        'Eccentricity figures appear only at the resting shapes and are blank while the shape is changing, so no number is ever read off a shape in transit.',
        'The ghost going round the dashed circle keeps step with the planet lap for lap, which is how the lap time being unchanged is shown without a clock or a figure.',
      ],
    },

    useWhen: [
      'The article has given orbits an eccentricity and the reader has no sense of what changing it does. Watching the empty focus draw out and the path follow, with the old circle left as a ghost, gives the number something to be.',
      'The prose needs the near end and the far end to move by equal amounts in opposite directions, or needs the lap time to be independent of how stretched the path is.',
    ],

    avoidWhen: [
      'The point is where the central body sits within the path, or that the sum of the distances to the two foci does not change. Here the foci are a handle for the shape; no string is drawn and no distances are added.',
      'The article is about the launch — a body fired too fast or too slow and the path that results. Nothing is launched here and no speed is ever shown.',
      'The subject is the body going quickly near and slowly far, or equal areas in equal times. The planet does move that way, but nothing marks, sweeps or measures it.',
      'What is needed is a relation between the size of an orbit and its period. The size is deliberately held fixed here and only the stretching changes.',
      'Distances are wanted for the nearest and furthest points, or a formula for them. Only the eccentricity values appear, and there are no scales or measuring marks.',
      'The article is about two bodies going round a shared centre, or the central body being moved by its companion. The central body here is planted at one place for the whole run.',
    ],

    contrastWith: [
      {
        concept: 'keplers-first-law',
        note: 'One treats the second focus as the handle that sets how stretched the path is; the other treats the two foci as fixed places and asks which one the star occupies and what stays constant between them.',
      },
      {
        concept: 'circular-orbit',
        note: 'One is about the whole family of shapes a bound path can take, with the circle as the one where the two foci coincide; the other stays with that one case and explains what keeps it going round.',
      },
      {
        concept: 'orbital-velocity',
        note: 'One changes the shape directly and never mentions how the body was launched; the other changes the launch speed and lets the shape come out of it.',
      },
      {
        concept: 'gravitational-potential-energy-general',
        note: 'One stretches the path while keeping its size, which leaves the lap time alone; the other changes what the body has to spend, which moves the limit of how far out it may go.',
      },
    ],
  },
};
