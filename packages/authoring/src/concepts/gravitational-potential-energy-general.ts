/**
 * gravitational-potential-energy-general 개념 선언.
 *
 * 위험한 형제는 `escape-velocity` 다 — 둘 다 무한대 기준이고 「벗어난다」 로 끝난다. **주어를 갈랐다.**
 *   gravitational-potential-energy-general  **가로선의 부호** — 0 아래면 벽에 닿아 갇히고 위면 안 닿는다
 *   escape-velocity                         **쏜 속도의 문턱** — 같은 몫씩 올리다 어느 값부터 돌아오지 않는다
 * 이쪽만 「음수 · 우물 · 0 을 무한대에 둔다 · 묶인 궤도」 어휘를 갖고, 「km/s · 문턱 속도 · 곧장 위」 는
 * 저쪽에 둔다. 지표 근처 mgh 는 `gravitational-potential-energy` 몫이라 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const gravitationalPotentialEnergyGeneralConcept: Aperi21ConceptSource = {
  id: 'gravitational-potential-energy-general',
  label: 'The Negative Well Measured from Infinity, and What Its Sign Decides',
  canonicalSim: 'aperi21:gravitational-potential-energy-general',

  surface: {
    definition:
      'With the zero set infinitely far off, the stored energy is below zero everywhere and deepens inward into a well, and whether a body stays or leaves is settled by whether its total sits below that zero or above it.',
    exemplarKeywords: [
      'why is gravitational potential energy negative',
      'zero at infinity convention',
      'minus GM over r',
      'gravitational potential well',
      'bound or unbound orbit',
      'negative total energy means bound',
      'energy diagram for gravity',
      'turning point where the line meets the curve',
      'the sign of the total energy',
      'what does negative energy even mean',
    ],
  },

  briefing: {
    observable: [
      'A well fills the left of the picture: two identical curves, one on each side of the centre, running down from a grey horizontal line at the top and deepening without end toward the middle.',
      'The grey line at the top is named as the zero, belonging to a place infinitely far away, and the whole of both curves lies beneath it.',
      'A red horizontal line stands for the total energy, marked with its sign, and a dark ball rides on the right-hand curve at the height belonging to the present distance, climbing and descending as the run goes on.',
      'The stretch of curve the ball has already travelled in this shot is left behind as a thick coloured band.',
      'While the red line is below the zero it ends at two red dots where it meets the two walls, and the ball never goes beyond them.',
      'To the right, drawn at the same horizontal scale, sits the orbit itself — a central body, a traced path, and a dashed circle at the radius where the red line meets the wall; the width between the two red dots is the diameter of that circle.',
      'Between shots the ball halts at its lowest point while the red line is raised, and the two wall dots and the dashed circle move outward together as it rises.',
      'The second shot, still below zero, has the ball climb higher up the wall and the traced orbit come back round a longer ellipse, well inside the enlarged dashed circle.',
      'When the line is raised past the zero, the wall dots run off the edge and the dashed circle disappears, the red line now reaching from one side of the panel to the other.',
      'In that last shot the ball climbs the curve to the edge of the panel and the orbiting body leaves along an open path, and afterwards only the traces are left with nothing on them.',
      'No energy values and no distances are written; the line carries only a mark of its sign, and the curve carries its expression as a name.',
      'The three shots run and repeat by themselves.',
    ],

    screen: {
      affordances: [
        'The three shots and the two raisings of the energy line happen in order and then begin again; nothing has to be pressed.',
        'The well and the orbit are drawn at one horizontal scale, so that the line meeting the walls and the orbit being penned inside the dashed circle are the same fact seen twice.',
        'The ball turns back a little short of the wall, which is true: the orbit is also moving sideways at that point, so what the wall marks is the distance beyond which it cannot go, not the place where it turns.',
        'The gap between the ball and the red line above it is left to stand for the motion the body still has, with no separate bar drawn for it.',
        'Both walls are drawn although the curve depends only on distance, because a single wall reads as a barrier rather than a well.',
        'No accent colour is used, so whether a shot escapes is told by the line and the path rather than by a change of colour.',
      ],
    },

    useWhen: [
      'The article has written the potential with a minus sign and the reader is treating that as a bookkeeping oddity. Seeing that the zero belongs to infinity, and that everywhere nearer is therefore below it, is what makes the sign the point rather than a convention.',
      'The prose has to explain why a body with more than a certain energy never returns while one with less is penned in, and wants the two cases as one picture with the line raised between them.',
    ],

    avoidWhen: [
      'The article works near a surface with a constant pull and a height times weight. The zero here is at infinity, not at the ground, and the curve is not a straight slope.',
      'The question is how fast something has to be thrown to get away, or a threshold speed in kilometres per second. Speeds are never shown here; what is raised is a horizontal line standing for energy.',
      'The subject is the shape of the orbit itself — how stretched it is, where the central body sits within it. The orbit panel is a small companion, and the shots are not laid over one another for comparison.',
      'What is needed is a general potential curve with hills and hollows, several equilibria, or a local minimum. This curve has one shape only: it deepens toward the centre and approaches the zero from below.',
      'The article needs figures — joules, escape energy, a worked total. Nothing carries a value; the only writing is the sign of the line and the name of the curve.',
      'The point is kinetic and potential energy trading places in a fixed total. No accounting of the two is drawn, and what changes between shots is the total itself.',
    ],

    contrastWith: [
      {
        concept: 'escape-velocity',
        note: 'One asks about the sign of the total and answers whether a body is penned in or free; the other asks about the launch speed and finds the one value that divides the two outcomes.',
      },
      {
        concept: 'gravitational-potential-energy',
        note: 'One measures from infinitely far away, so every store is negative and gets deeper inward; the other measures from a chosen ground and grows straight upward with height, which holds only where the pull can be taken as constant.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'One deals with a single curve of one shape and asks only whether the level line clears the top of it; the other reads a general landscape for its hollows, hills and the places where a body turns around.',
      },
      {
        concept: 'circular-orbit',
        note: 'One says which distances a body is allowed into and which it is shut out of; the other says nothing about allowed distances and is about why the path bends at all.',
      },
      {
        concept: 'conservation-of-mechanical-energy',
        note: 'One is about where the zero of the store is put and what the resulting sign decides; the other is about the total holding steady while the store and the motion trade.',
      },
    ],
  },
};
