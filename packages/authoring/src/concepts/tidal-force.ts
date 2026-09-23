/**
 * tidal-force 개념 선언.
 *
 * 위험한 짝은 `roche-limit` — 둘 다 중력의 차이다. **주장을 갈랐다.**
 *   tidal-force  왜 **반대쪽도** 부푸는가 — 함께 떨어지는 눈에서 보면 양쪽으로 늘어난다
 *   roche-limit  그 늘림이 이기는 **문턱 거리** 는 어디인가 — 안쪽에서 덩어리가 풀려 고리가 된다
 * 이쪽만 두 기준틀 · 먼 쪽이 처진다 · 두 번의 만조 어휘를 갖고, 문턱 · 부서짐 · 고리는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const tidalForceConcept: Aperi21ConceptSource = {
  id: 'tidal-force',
  label: 'Tidal Force — Stretching in Both Directions',
  canonicalSim: 'aperi21:tidal-force',

  surface: {
    definition:
      'Because gravity pulls the near side of a falling body harder than the far side, an observer falling with it sees it stretched at both ends, not one.',
    exemplarKeywords: [
      'tidal force',
      'why there are two high tides a day',
      'why the far side of Earth also bulges',
      'difference in gravity across a body',
      'the near side is pulled harder than the far side',
      'stretched out by gravity',
      'spaghettification near a black hole',
      'tidal stretching of a falling cloud',
      'differential gravity across a diameter',
      'the Moon raises a bulge on both sides',
    ],
  },

  briefing: {
    observable: [
      'A round cloud of many separate dust specks falls toward a massive body; the specks never pull on one another, so anything that happens to the cloud’s shape comes only from the body it is falling toward.',
      'Shading around the body shows how gravity fades with distance, dense close in and thinning outward, so the near and far sides of the cloud are plainly sitting in different strengths of pull.',
      'The same falling cloud is shown twice side by side: on the left as it looks from a standing observer, on the right magnified and drawn from a viewpoint falling along with the cloud’s centre.',
      'From the standing view the whole cloud simply rushes inward and its change of shape is hard to catch.',
      'From the falling view the motion of the centre has been taken out, and what is left is the cloud drawing out along the line to the body — the near end running ahead, the far end lagging behind.',
      'A dashed outline marks where the cloud would still be if every speck had been pulled alike, and the two end specks are marked so how far each has left that outline can be seen.',
      'A flowing pattern of short strokes fills the picture, indicating which way each part of the cloud is being carried once the shared falling is set aside — outward at both ends, inward at the sides.',
      'The most stretched moment is held at reduced speed before the whole fall restarts, so the drawn-out shape can be looked at rather than glimpsed.',
      'The sentence under the picture changes when both ends have genuinely left the dashed outline, so the wording is decided by what the specks have actually done.',
    ],

    screen: {
      affordances: [
        'The fall runs, slows at its most stretched, fades and begins again on its own; nothing has to be pressed and no distance is chosen.',
        'The positions of every speck are computed from gravity alone rather than drawn in, so the stretching is an outcome of the fall and not an illustration of it.',
        'The label on the magnified view states that it is seen falling with the cloud, because a change of viewpoint cannot be read from a picture by itself.',
      ],
    },

    useWhen: [
      'The article has explained the tide facing the Moon and the reader is stuck on the bulge on the opposite side. Setting the standing view beside the falling view is what makes the far bulge a lagging rather than a pushing.',
      'The prose needs the general form of a tide — that a difference in pull across a body becomes a stretch once the common fall is subtracted — before applying it to oceans, moons or an infalling astronaut.',
    ],

    avoidWhen: [
      'The article is about the distance at which stretching wins and a body is torn apart, or about rings and rubble. Nothing here breaks, and no threshold or limiting distance is marked.',
      'Ocean tides as such are the subject — coastlines, twice-daily timings, spring and neap. What falls here is dust toward a bare body, with no water, no Earth and no clock.',
      'The point is that a freely falling person feels no weight. The two ends do part from each other here, which is the opposite of the uniform fall that argument rests on.',
      'The Sun and the Moon have to be weighed against each other, or the inverse-cube dependence has to be quantified. No numbers, no axes and no comparison of sources appear.',
      'The subject is a body in orbit and how the tide it raises feeds back on the rotation or the orbit. The cloud here simply falls inward, once.',
    ],

    contrastWith: [
      {
        concept: 'roche-limit',
        note: 'One explains why a difference in pull stretches a body at both ends; the other takes that stretch as given and asks at what distance it overcomes whatever is holding the body together.',
      },
      {
        concept: 'weightlessness',
        note: 'Both subtract a shared fall to see what is left. One finds that a body large enough to span different pulls is left being drawn apart; the other finds that a body small enough to feel one pull is left pressing on nothing.',
      },
      {
        concept: 'free-fall',
        note: 'One is what falling looks like once the sameness is assumed — different weights arriving together; the other is what falling leaves behind once that sameness fails across a body’s own width.',
      },
      {
        concept: 'reference-frame',
        note: 'One is a physical effect that only appears once a particular observer is chosen; the other is the general business of choosing observers and asking what each of them is entitled to say.',
      },
    ],
  },
};
