/**
 * roche-limit 개념 선언.
 *
 * 위험한 짝은 `tidal-force` — 둘 다 중력의 차이다. **주장을 갈랐다.**
 *   tidal-force  늘어남이 **왜 양쪽으로** 일어나는가 — 함께 떨어지는 눈에서 본 모습
 *   roche-limit  그 늘림이 붙잡는 힘을 **이기는 거리** — 두 화살표가 같아지는 문턱, 안쪽은 고리
 * 이쪽만 문턱 · 제 중력 · 풀림 · 고리 어휘를 갖고, 두 기준틀 · 먼 쪽이 처진다 · 두 번의 만조는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rocheLimitConcept: Aperi21ConceptSource = {
  id: 'roche-limit',
  label: 'Roche Limit — The Distance a Moon Comes Apart',
  canonicalSim: 'aperi21:roche-limit',

  surface: {
    definition:
      'The grip a loose body has on its own pieces does not change with distance while the pull removing them grows steeply, so inside one distance it cannot stay whole.',
    exemplarKeywords: [
      'Roche limit',
      'why Saturn has rings instead of a moon',
      'how close can a moon get before it breaks up',
      'a satellite torn apart by tides',
      'Shoemaker-Levy 9 broke into a chain of fragments',
      'ring material cannot clump together',
      'the distance where tides beat self-gravity',
      'tidal disruption of a rubble pile',
      'why no moon orbits inside the rings',
      'breakup distance of a moon',
    ],
  },

  briefing: {
    observable: [
      'A clump of many loose grains orbits a planet while slowly spiralling inward, leaving a trail behind it, and one dashed circle marks the distance that the whole piece is about.',
      'A magnified panel keeps the clump large enough to read, drawn from alongside it so the planet is always off to the same side.',
      'In that panel a single outer grain on the planet-facing side carries two opposed arrows: one naming the hold of the clump’s own gravity, pointing back into the clump, and one naming the pull that would remove it, pointing toward the planet.',
      'As the clump comes inward the inward-naming arrow never changes length while the other lengthens quickly, so the contest is watched as two lines of unequal growth rather than asserted.',
      'While outside the dashed circle the clump stays round — holding together is half of what is being shown.',
      'Exactly on the dashed circle the two arrows are the same length, and the moment is slowed so it can be looked at.',
      'Once inside, the clump lets go: each grain keeps its own orbit, the inner ones running faster than the outer, so the group draws out along the path.',
      'The drawn-out group keeps spreading until it wraps the whole way round, and what is left inside the dashed circle is a ring of grains around the planet that never regathers.',
      'The two arrows carry the same colour and are told apart only by their names and their directions; the grains look the same before and after, because a ring is the same material as the clump was.',
      'No distance, force or density is written anywhere.',
    ],

    screen: {
      affordances: [
        'One approach carries the whole argument by itself, sweeping through every distance from safely outside to well within, and then begins again; nothing has to be pressed.',
        'The threshold marked by the dashed circle and the length of the growing arrow come from a single declared distance, so the arrows becoming equal and the clump reaching the circle are one fact rather than two that happen to coincide.',
        'The magnified panel says in words that it is drawn from beside the clump, since a change of viewpoint cannot be read from a picture alone.',
      ],
    },

    useWhen: [
      'The article asks why a planet has rings rather than another moon, and the reader needs the answer to be a place rather than an event. Watching the clump survive outside the circle and come apart inside it makes the limit a location on the picture.',
      'The prose has claimed that tides can destroy a body and the reader wants to know against what. The two opposed arrows, one fixed and one growing, are the comparison the claim is short of.',
    ],

    avoidWhen: [
      'The point is why a tide raises a bulge on both sides of a body, or what stretching looks like from the perspective of the thing being stretched. The clump here is watched from outside and stays round until it simply lets go.',
      'The article is about a body held together by its material strength — rock, ice, tensile limits. The only thing resisting here is the clump’s own gravity.',
      'A distance in kilometres, a density ratio or the coefficient in the formula is needed. Nothing numerical appears on screen.',
      'The subject is how rings settle into a thin sheet, or how ring particles collide and grind. The grains here never touch one another after they separate.',
      'The article is about a spacecraft or a body being captured or deorbited. Nothing manoeuvres here and no engine is involved.',
    ],

    contrastWith: [
      {
        concept: 'tidal-force',
        note: 'One asks at what distance the stretch overcomes what holds a body together; the other asks why a difference in pull produces a stretch at all, and why it appears at both ends.',
      },
      {
        concept: 'keplers-third-law',
        note: 'One uses the fact that inner material circles faster to explain why a broken clump smears into a ring; the other is that fact itself, stated as a relation between the size of an orbit and the time for a lap.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'One is a threshold where two opposed pulls momentarily match and the body then loses; the other is the ordinary balanced case where matching opposed pulls is what keeps a thing as it is.',
      },
    ],
  },
};
