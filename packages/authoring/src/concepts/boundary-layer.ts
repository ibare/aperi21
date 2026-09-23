/**
 * boundary-layer 개념 선언.
 *
 * 흐름의 결 이웃과 **점성의 영향이 어디까지 미치는가**로 갈랐다.
 *   boundary-layer   빠른 흐름에서 그 영향이 **벽에 붙은 얇은 띠**에 갇히고, 내려갈수록 두꺼워진다
 *   reynolds-number  두 흐름이 **같은 결**인지를 한 수가 가른다
 *   drag-in-fluid    느려진 유체가 몸에서 **떨어져 나간 뒤**의 값
 * 이쪽만 미끄럼 없음 · 속도 분포 · 얇은 띠 · 앞전 어휘를 갖는다. 벽 마찰 · 천이는 화면에 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const boundaryLayerConcept: Aperi21ConceptSource = {
  id: 'boundary-layer',
  label: 'The Thin Slowed Layer Against a Surface',
  canonicalSim: 'aperi21:boundary-layer',

  surface: {
    definition:
      'The thin sheet of fluid beside a surface within which the speed climbs from nothing at the wall up to the free stream, and which thickens the further downstream one looks.',
    exemplarKeywords: [
      'boundary layer',
      'no-slip condition',
      'the fluid touching a wall is not moving',
      'velocity profile near a surface',
      'how far from a wall does viscosity actually matter',
      'the layer grows along a flat plate',
      'flow over a flat plate',
      'outside the layer the fluid behaves as if it had no viscosity',
      'why friction on a wing acts only in a thin sheet',
      'the layer is thinnest at the leading edge',
    ],
  },

  briefing: {
    observable: [
      'A hatched plate lies flat across the picture and fluid flows over it from left to right, drawn as rows of small points each trailing a tail whose length is its speed.',
      'The rows well above the plate keep long, even tails all the way along. The row just above the plate has tails that shorten the further back they go, and its points bunch up where they are slowest.',
      'At three places along the plate — spaced so that the third is much further from the leading edge than the first — an upright stack of speed arrows grows, one arrow at each height.',
      'In every stack the arrows well above the plate are all the same length, and only the few closest to the plate are short.',
      'A curve drawn through the arrow tips bends down to nothing at the plate and stands straight above a certain height.',
      'The number of shortened arrows grows from a couple at the first stack to seven or so at the last, so the slowed part is plainly taller further downstream while the arrow spacing stays the same at all three.',
      'A faint band in the accent colour, with a dotted upper edge, then spreads from the leading edge along the flow, starting from no thickness at all and opening into a wedge.',
      'Where that dotted edge crosses each stack, it passes through the height at which that stack’s curve has straightened out.',
      'The picture holds with the band full-length and then takes the arrows and the band away, while the flowing points carry on.',
      'The points inside the band and the points above it are drawn in the same colour, and no thickness, distance or speed is written anywhere.',
    ],

    screen: {
      affordances: [
        'One round runs by itself: the flow alone, then the arrow stacks growing, then the band spreading, then both removed — and it starts again.',
        'The arrows come before the band on purpose. A band laid down first would read as a promise that the coloured part is the slow part; arriving second, it can only trace a height the arrows have already shown.',
        'The arrow spacing is identical at all three stacks, so the thickening can be read simply by counting how many arrows are short.',
        'The vertical scale is not exaggerated — the wedge is drawn at the proportion a genuinely slow, smooth flow would give, which keeps the layer thin while leaving the arrows inside it readable.',
        'The accent colour carries one meaning only, the layer itself, and the flowing points are not recoloured on crossing into it, because it is the same fluid throughout.',
      ],
    },

    useWhen: [
      'The article has stated that fluid in contact with a wall is at rest, and the reader cannot square that with a stream going past at full speed. One stack of arrows, all equal above and short only at the bottom, is the reconciliation.',
      'The article has said the layer grows along the surface, or given its growth as a square root, and what is wanted is the wedge opening from nothing at the leading edge rather than the formula for it.',
      'The reader has taken “viscous” as a property that colours the whole flow, and the point to make is that beyond a certain height the stream behaves as though there were no viscosity at all.',
    ],

    avoidWhen: [
      'The fluid in question fills its channel and is dragged across the whole of it — a gap between two plates, or a profile that spans a pipe. Everything here happens beside a single plate with undisturbed flow above it.',
      'The subject is the layer going turbulent, or the flow coming away from a body and leaving a wake. The flow here stays smooth and attached from the leading edge to the end of the plate.',
      'A friction or a force is wanted — the drag the fluid exerts on the surface. Nothing in this picture is a force, and no arrow is drawn on the plate.',
      'Values are needed: a thickness in millimetres, a distance along the plate, a speed. Not one number appears, and the three stations are placed by ratio without that ratio being written.',
      'The point is that the plate is pressed on by the flow, or that pressure varies along it. No pressure is drawn.',
      'The article compares two whole flows and asks whether they are of the same kind. Only one flow runs here, over one plate.',
    ],

    contrastWith: [
      {
        concept: 'reynolds-number',
        note: 'One is about how deep into a single stream the wall’s influence reaches; the other is about when two different streams can be called the same flow at all.',
      },
      {
        concept: 'drag-in-fluid',
        note: 'One follows the slowed fluid while it still clings to the surface; the other is about what it costs once that fluid comes away from the body and leaves a churning trail behind.',
      },
      {
        concept: 'viscosity',
        note: 'One asks what a fluid’s own friction amounts to, weighed as the force it takes to shear it; the other takes that friction as given and asks how far out from a surface its effect reaches before the stream behaves as though there were none.',
      },
    ],
  },
};
