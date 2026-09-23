/**
 * total-internal-reflection 개념 선언.
 *
 * 전반사 셋 가운데 **문턱 자체**를 다루는 쪽이다. 형제와는 주어를 갈랐다.
 *   total-internal-reflection  경계면 **하나**에서 각을 돌려 문턱을 찾는다 — 나가는 빛의 몫이 주장
 *   optical-fiber              문턱은 정해 두고 휜 길 위 **여러 되튐**에 대 본다 — 갇힘 / 샘이 주장
 *   mirage                     경계면이 없다. 층이 쌓인 **기울기**가 휘게 한다
 * 이쪽만 임계각 · 되돌아오는 몫 · 물 ↔ 유리 ↔ 다이아몬드 어휘를 갖는다. 코어 · 클래딩 · 휨,
 * 뜨거운 공기 · 길은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const totalInternalReflectionConcept: Aperi21ConceptSource = {
  id: 'total-internal-reflection',
  label: 'The Angle Past Which Light Stops Getting Out',
  canonicalSim: 'aperi21:total-internal-reflection',

  surface: {
    definition:
      'The angle, inside a denser material, past which none of the light gets out: as it is approached the escaping beam flattens and fades while the returning beam takes up its share.',
    exemplarKeywords: [
      'total internal reflection',
      'critical angle',
      'why the underside of a water surface acts as a mirror',
      'light cannot leave past a certain tilt',
      'sine of the critical angle is the ratio of the indices',
      'why diamond sparkles so much',
      'going from a dense medium out to a thin one',
      'Snell’s window seen from below the water',
      'the share of light reflected climbs to all of it',
      'reflecting prisms in binoculars instead of mirrors',
    ],
  },

  briefing: {
    observable: [
      'The picture is split: on the left a dark scene with a horizontal boundary, the denser material below and air above; on the right a graph.',
      'A lamp sits below the boundary and sends a bright band up to one point on it. From that point two bands leave — one out into the air and one back down into the material — and a dashed upright line and a highlighted dashed line mark the square direction and the critical direction.',
      'A small arc at the meeting point carries the current angle, written beside it, and the critical angle for the material in force is written on the highlighted dashed line.',
      'As the angle grows, the band going out into the air swings toward lying flat along the boundary, narrows and dims, while the band going back down brightens by as much; brightness is what carries the share, not thickness alone.',
      'At the moment the angle passes the critical value the outgoing band is gone entirely, and the band going back down is as bright as the one that arrived.',
      'The angle then eases back below the critical value and a faint outgoing band reappears, so the crossing is shown in both directions each round.',
      'The graph on the right plots the share of light returned against the angle of arrival. A curve rises gently, then steeply, and reaches the top at a vertical line standing at the critical angle; a dot rides the curve at the angle in force.',
      'Naming the other material re-draws the highlighted direction, the critical figure and the vertical line on the graph all at once: diamond puts them at a much smaller angle than water does.',
      'A line of words below changes between three statements according to where the angle stands — far from the critical angle, within ten degrees of it, or past it.',
    ],

    screen: {
      affordances: [
        'The angle sweeps up and back on its own, slowing near the critical angle so that the crossing can be watched rather than caught.',
        'The lamp can be taken hold of and swung, which sets the angle by hand and lets the reader sit just below the critical value; about five seconds after letting go the sweep resumes.',
        'A row of buttons names the denser material — water, glass or diamond — and each one moves the critical angle, so the threshold is shown to be a property of the pair of materials rather than a fixed number.',
        'The graph and the scene are driven by the same angle, so the dot arriving at the vertical line and the outgoing band vanishing happen in the same instant.',
        'All three bands are drawn in the same colourless light, which leaves brightness free to mean the share of light and nothing else.',
        'The screen opens partway up the sweep, at an angle below the critical one and rising.',
      ],
    },

    useWhen: [
      'The article has stated that reflection becomes total beyond a certain angle and the reader pictures a switch being thrown. Watching the outgoing band lie down and fade over several degrees before it disappears replaces that picture with a gradual handover that ends abruptly.',
      'The reader is being asked to accept that the threshold depends on the two materials rather than on the light. Naming diamond in place of water moves the critical mark a long way without anything else on screen changing.',
      'The article carries the graph of reflected share against angle as a figure and the reader cannot connect its steep rise to anything they would see. Here the dot on that curve and the dimming band move together.',
    ],

    avoidWhen: [
      'The light in the article is going into the denser material rather than trying to leave it. Every beam here starts below the boundary.',
      'The subject is keeping light inside a thread or a pipe along its length, or how sharply such a guide may be bent. There is one flat boundary here and one meeting point.',
      'The point is that light bends gradually through air of changing density. Nothing gradual happens here; the turn is at a single face.',
      'The article is about colours separating, or about a beam of one colour bending by a measured amount into a new material. One colourless beam is shown and no refracted angle is written.',
      'The subject is where an object under water appears to be. There is no object below the surface here, only a lamp aimed at it.',
      'Partial reflection at small angles is the point, or the exact percentages at particular angles are wanted. The graph is read as a shape, and only the angles are written as figures.',
    ],

    contrastWith: [
      {
        concept: 'snells-law',
        note: 'One follows the light that crosses a surface and asks by how much it turns; the other pushes that same crossing to the angle at which there is nothing left to cross, and what is left is the light sent back.',
      },
      {
        concept: 'optical-fiber',
        note: 'One establishes the threshold by hunting for it at a single face; the other holds the threshold fixed and asks whether a bent path can meet it at every bounce along its length.',
      },
      {
        concept: 'mirage',
        note: 'Both end with light turned back rather than let through, but one needs a sharp face between two materials and a definite angle, while the other has no face at all and the turn is spread over a thickness of air.',
      },
      {
        concept: 'law-of-reflection',
        note: 'One asks under what condition all of the light is sent back; the other takes the sending back for granted and fixes the direction it leaves in.',
      },
    ],
  },
};
