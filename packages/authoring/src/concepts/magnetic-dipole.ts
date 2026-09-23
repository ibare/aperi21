/**
 * magnetic-dipole 개념 선언.
 *
 * 짝인 `magnetic-materials` 와는 **주어**로 갈랐다.
 *   magnetic-dipole     고리 전류 하나와 막대자석 하나가 **같은 것**이다 (멀리서 겹친다)
 *   magnetic-materials  같은 자석 앞에서 재료마다 **응답이 다르다** (끌림 · 밀림)
 * 이쪽만 「멀리서 · 겹친다 · 고리가 곧 자석 · 고리의 N 쪽」 어휘를 갖고, 저쪽만
 * 「강자성 · 상자성 · 반자성 · 정렬」 어휘를 갖는다. 고리를 여러 개 겹쳐 코일이 되는 쪽은
 * `field-of-loop-and-solenoid`, 전기 쌍극자의 모양은 이미 선언된 `field-of-dipole` 이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const magneticDipoleConcept: Aperi21ConceptSource = {
  id: 'magnetic-dipole',
  label: 'A Current Loop and a Bar Magnet as One Dipole',
  canonicalSim: 'aperi21:magnetic-dipole',

  surface: {
    definition:
      'That a single current loop and a bar magnet, whose fields differ close up, settle onto exactly the same pattern of lines once both are viewed from far enough away, the loop having a north side of its own.',
    exemplarKeywords: [
      'magnetic dipole',
      'a current loop acts like a bar magnet',
      'far field of a current loop',
      'magnetic moment of a loop',
      'which face of a current loop is north',
      'right-hand rule for a loop of current',
      'bar magnet field pattern',
      'loop and magnet make the same field at a distance',
      'dipole field shape',
      'the magnet as a loop of circulating current',
    ],
  },

  briefing: {
    observable: [
      'Two panels stand side by side at the same scale, the axis running up the page: on the left a loop cut through its axis, on the right a bar magnet with its north end uppermost.',
      "The loop appears as two wires — a ringed dot on the left, a crossed circle on the right — with a faint flat oval between them and a small current arrow along the near side of that oval.",
      'Close up the two patterns plainly differ: the loop\'s lines wrap tightly round each wire and funnel through the narrow opening, while the magnet\'s run straight up through its body and fan out from the rims of its end faces.',
      'Letters for north and south rise above and below the loop, on the same sides as the magnet\'s own, with the caption putting them down to the way the current goes round.',
      "The magnet's lines and its outline are then copied, at the same scale, onto the loop panel as dashed lines, and near the sources the dashed and solid lines are visibly apart.",
      'Both panels shrink together about their own centres, the sources dwindling and lines that had been off the edge coming into view, which is what stepping back amounts to.',
      'Far back, the dashed lines and the solid lines have closed onto one another almost exactly, and the two panels carry the same pattern.',
      'The small lines that huddle against each source fade away as the panels shrink, so what survives from a distance is only the outer pattern.',
      'The dashed and solid lines are told apart by being dashed and solid, not by colour, since both are the same thing; the wire marks and the pole letters keep their size while everything else shrinks.',
      'The dashed lines and the loop\'s pole letters then disappear and the panels swell back to close range, and it starts over.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the two panels are shown close up, the poles are named, the magnet\'s lines are laid over the loop, and both are stepped back from.',
        'The copying goes one way only, from magnet onto loop, so the two panels do not become identical and the side-by-side comparison keeps its point.',
        'Stepping back is done by shrinking both panels by the same factor about their sources, which is the same thing as moving away from them, and the lines are simply redrawn smaller rather than traced again.',
        'Lines are placed at reaches in a fixed ratio rather than at equal steps, so the texture of the spacing survives the shrinking and the far view is not left bare.',
        'The same set of reaches is used for both sources, which is what makes coincidence at a distance a result rather than an arrangement; the magnet is given the same dipole strength as the loop.',
        'North and south are told by letters alone, with no conventional red and blue, and the letters sit directly on the axis without a backing plate that would break the lines behind them.',
        'The magnet\'s body is a faint translucent block drawn beneath the lines, so the lines passing through it can be compared with the lines passing through the loop.',
      ],
    },

    useWhen: [
      'The article has claimed that a loop of current is a magnet, or that a magnet is at bottom circulating current, and the reader has nothing to attach that to. The dashed lines drifting onto the solid ones as the panels shrink is the claim being made good, and it also shows exactly where it fails — close up.',
      'The prose needs the north face of a coil or a loop to be something read off the way the current goes, rather than assigned; the poles appear on the loop while the current arrow is still on view.',
    ],

    avoidWhen: [
      'The article is about what happens inside a coil of many turns, or about making the field stronger by winding more. One loop stands here against one magnet.',
      'The magnetic moment is being computed, or the fall-off of a dipole field with distance is to be quantified. No strength, distance or expression appears.',
      'The subject is a magnet acting on something — attracting iron, turning a compass, exerting a torque. Nothing is placed in either field.',
      'The article needs the inside of the magnet to be explained by its material — domains, alignment, what makes it magnetic in the first place. The magnet here is simply given.',
      'The point is a pair of opposite electric charges and the field they share. These two sources have no ends that can be separated.',
      'The reader is meant to move closer or further at will. The two distances are fixed and gone through in turn.',
    ],

    contrastWith: [
      {
        concept: 'magnetic-materials',
        note: 'One says that a loop of current and a magnet are the same kind of thing; the other takes a magnet as given and asks what different materials do when it is brought near.',
      },
      {
        concept: 'field-of-loop-and-solenoid',
        note: 'One is about one loop being indistinguishable from a magnet once its insides are too small to see; the other is about the insides of a stack of loops being exactly what matters.',
      },
      {
        concept: 'field-of-dipole',
        note: 'Both are about the pattern a two-ended source makes, but one has two charges that could in principle be pulled apart, while the other has a circulating current with no ends to separate.',
      },
      {
        concept: 'inverse-square-law',
        note: 'One is about a shape agreeing at a distance, whatever the strength; the other is about a strength falling off at a definite rate, whatever the shape.',
      },
    ],
  },
};
