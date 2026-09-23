/**
 * gravitational-slingshot 개념 선언.
 *
 * 위험한 짝은 `orbital-transfer` — 둘 다 속도를 바꿔 궤도를 옮긴다. **주장을 갈랐다.**
 *   gravitational-slingshot  엔진을 **한 번도 켜지 않는다** — 늘어난 빠르기는 보는 틀을 바꾼 데서 온다
 *   orbital-transfer         **두 번 민다** — 그런데 처음보다 느리게 돈다
 * 이쪽만 스침 · 두 틀 · 행성에서 빌려 옴 어휘를 갖고, 밀기 · Δv · 호만 · 비용은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gravitationalSlingshotConcept: Aperi21ConceptSource = {
  id: 'gravitational-slingshot',
  label: 'Gravity Assist — Speed Gained Without Firing Anything',
  canonicalSim: 'aperi21:gravitational-slingshot',

  surface: {
    definition:
      'A craft swinging past a moving planet leaves at the same speed relative to the planet but faster relative to the Sun, having taken a share of its travel.',
    exemplarKeywords: [
      'gravity assist',
      'gravitational slingshot',
      'how Voyager gained speed from Jupiter',
      'flyby manoeuvre without using fuel',
      'free speed from passing a planet',
      'why doesn’t gravity take back what it gave',
      'planetary swing-by',
      'speed depends on who is watching',
      'borrowing momentum from a planet',
      'getting to the outer solar system without more fuel',
    ],
  },

  briefing: {
    observable: [
      'The same single flyby is drawn twice side by side, on one clock, with each panel named for where it is being watched from — alongside the planet, and from the Sun.',
      'In the panel drawn alongside the planet, the planet sits still and the craft curves around behind it and away, its direction turned well over a right angle.',
      'Dots are left along both paths at the same ticks of the clock, so the two panels carry the same number of dots and differ only in how far apart they lie.',
      'Alongside the planet the outgoing dots are spaced exactly as the incoming ones were, and the arrows drawn at the two ends of the flight are the same length and carry the same name — only the direction has changed.',
      'In the panel drawn from the Sun the planet is running steadily across the picture, and the incoming dots are crowded while the outgoing ones open out ever wider.',
      'The two end arrows in that panel differ plainly in length, the outgoing one well over twice the incoming one, and each carries its own name.',
      'At the end the construction is assembled at both ends of the Sun-side flight: the planet’s own velocity is laid down first, the turned velocity from the other panel is added to its tip as a dashed arrow, and the pair reaches exactly the tip of the arrow already drawn there.',
      'The same planet velocity is added at both ends; what differs is that the turned velocity points against it on the way in and along it on the way out, and that is where the extra length comes from.',
      'The closing sentence says the gain was borrowed from the planet’s own travel, and that the planet slows by a share too small to be drawn.',
      'The planet’s engine is never involved: nothing fires, nothing is expelled, and no push appears anywhere on the craft.',
      'Nothing is numbered — the names on the arrows are bare symbols and every comparison is made by length and by spacing.',
    ],

    screen: {
      affordances: [
        'The approach, the swing, the departure, the comparison and the construction run in order and then begin again; nothing has to be pressed.',
        'Both panels are driven by one clock, which is what makes them the same flight rather than two similar ones — the dots correspond one to one.',
        'The closest passage is slowed, because that is where the turning happens and at ordinary speed it would be over before it could be followed.',
        'The borrowed velocity is drawn dashed in the construction, marking it as a quantity carried over from the other panel rather than something measured in this one.',
      ],
    },

    useWhen: [
      'The article has said a probe gained speed by passing a planet and the reader objects that gravity must give back on the way out. Setting the panel where nothing was gained beside the panel where a great deal was gained is the answer, and the two are the same flight.',
      'The prose needs a case where a change of observer is not a matter of bookkeeping but produces the physically useful quantity, and the construction at the ends shows exactly what was added.',
    ],

    avoidWhen: [
      'The craft in the article fires an engine, changes orbit by burning propellant, or a fuel cost is being reckoned. Nothing is fired here and the whole gain comes from the planet’s motion.',
      'The point is an orbit that closes and repeats. This path comes in from far away and leaves for good.',
      'Speeds, gains or turning angles are needed as numbers. Only bare symbols are written and everything is compared by length.',
      'The article is about the planet being slowed in exchange, or about the bookkeeping of the pair. The planet’s share is deliberately not drawn because it would be too small to be honest.',
      'The subject is a craft that passes in front of a planet and is slowed instead. Only the case that gains is shown here.',
      'The reader needs the shape of the encounter itself — how close it passes, how the turning angle depends on that. The encounter is fixed and shown once.',
    ],

    contrastWith: [
      {
        concept: 'orbital-transfer',
        note: 'Both change how fast a craft travels. One does it by burning propellant at chosen moments and ends up going round more slowly; the other burns nothing and the gain exists only relative to the Sun.',
      },
      {
        concept: 'relative-velocity',
        note: 'One is a case where the difference between two observers is the whole payoff; the other is the general rule for converting between them.',
      },
      {
        concept: 'elastic-collision',
        note: 'One is the same bookkeeping worked out for a body far too heavy to be visibly affected, which is why the exchange looks like a gift; the other has two comparable bodies and the transfer can be followed on both.',
      },
      {
        concept: 'conservation-of-momentum',
        note: 'One follows one light body through an encounter and shows what it carries away; the other watches the total across all the bodies involved and finds it unchanged.',
      },
    ],
  },
};
