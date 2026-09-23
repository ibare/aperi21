/**
 * law-of-reflection 개념 선언.
 *
 * 거울 넷 + 곁의 둘 가운데 가장 앞. **무엇을 주장하는지로 갈랐다.**
 *   law-of-reflection            줄기 **하나**의 **각** — 법선을 사이에 두고 같은 값. 상이 없다
 *   specular-diffuse-reflection  줄기 **여럿**의 **방향** — 법선이 자리마다 기울면 갈라진다
 *   plane-mirror-image           상의 **자리** — 거울 뒤 같은 거리
 *   multiple-mirror-images       상의 **개수** — 두 거울 사이 각이 정한다
 *   concave-mirror               상의 **종류가 뒤바뀐다** — 물체 자리에 따라
 *   convex-mirror                상의 종류가 **바뀌지 않는다** + 시야의 넓이
 * 이쪽만 입사각 · 반사각 · 법선 · 각도 값 어휘를 갖는다. 상 · 허상 · 거리 · 개수는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lawOfReflectionConcept: Aperi21ConceptSource = {
  id: 'law-of-reflection',
  label: 'Equal Angles Either Side of the Normal',
  canonicalSim: 'aperi21:law-of-reflection',

  surface: {
    definition:
      'The rule fixing which way light leaves a mirror: it departs on the far side of the line drawn square to the surface, making the same angle with it that it arrived at.',
    exemplarKeywords: [
      'law of reflection',
      'angle of incidence equals angle of reflection',
      'the normal to a mirror surface',
      'aiming a laser pointer at a mirror',
      'which way will the beam go after it hits',
      'measuring the two angles with a protractor',
      'a beam striking at a glancing angle leaves at one too',
      'light bouncing off a flat surface',
      'incident ray and reflected ray',
      'the angle is measured from the normal, not the surface',
    ],
  },

  briefing: {
    observable: [
      'A flat mirror lies across the picture with a dashed line standing square to it at the middle; a beam comes down from the upper left to that spot and another leaves toward the upper right.',
      'Each beam carries an arrowhead partway along it, so which one is arriving and which one departing is read off rather than guessed.',
      'Two arcs of the same radius sit either side of the dashed line, one spanning the gap between it and the incoming beam, the other the gap to the outgoing beam.',
      'While the picture holds still, a figure stands beside each arc, and the two figures are the same — twenty and twenty, then forty-five and forty-five, then seventy and seventy.',
      'The incoming beam then lies down further toward the mirror. The outgoing beam lies down with it on the other side, and the two arcs open by the same amount at the same time.',
      'The figures disappear while anything is moving and come back only once the beams have settled.',
      'At seventy the two beams lie almost along the mirror and the two arcs are wide, yet the whole picture is still a mirror image of itself about the dashed line.',
      'The beams rise back toward the dashed line and the arcs close together, and the round begins over.',
    ],

    screen: {
      affordances: [
        'The incoming beam tilts down through three settled angles and rises back, over and over, with nothing to press.',
        'The mirror never moves — it is only the arriving beam that changes, so whatever the departing beam does is the mirror’s doing.',
        'The departing beam is not drawn to a plan: it is worked out by reflecting the arriving one, and the two arcs are read off that result, so the equality on screen is an outcome rather than a promise.',
        'Both beams are drawn in the same colour, because they are the same light; the arrowheads and the names beside them are what tell arriving from departing.',
        'The dashed line is drawn over the arcs rather than under them, so the two arcs are plainly separate rather than one wide fan.',
        'The screen opens with the beams already in place at the first angle.',
      ],
    },

    useWhen: [
      'The article has written down that the angle of incidence equals the angle of reflection and the reader has taken it as a formula to be applied. Watching the departing beam lie down in step with the arriving one, at three quite different angles, is what makes the equality something seen.',
      'The reader is measuring angles from the mirror surface instead of from the line square to it, and the article needs that corrected. Everything here is read from the dashed line, and both arcs start there.',
    ],

    avoidWhen: [
      'The point is where the reflection of an object appears to stand, or how far behind the glass it sits. Nothing is placed in front of this mirror and no image is formed.',
      'The article is about what a rough or matte surface does to a beam. This surface is flat and one beam arrives.',
      'The claim is that turning the mirror by some angle turns the departing beam by twice as much. The mirror here is fixed and only the arriving beam moves.',
      'The mirror in the article is curved, or the question is where beams come back together. This surface is flat throughout.',
      'The article is about light crossing into a new material and changing direction there. Everything here happens on one side of the surface.',
      'Angles other than twenty, forty-five and seventy are wanted, or a reading while the beam is swinging. Figures appear only at the three settled angles.',
    ],

    contrastWith: [
      {
        concept: 'specular-diffuse-reflection',
        note: 'One establishes the rule on a single beam with one angle to name; the other keeps the rule untouched and lets the line square to the surface point differently from spot to spot, which is enough to break a parallel sheaf apart.',
      },
      {
        concept: 'plane-mirror-image',
        note: 'One is about the direction reflected light takes; the other is about where that light appears to have started once some of it has reached an eye.',
      },
      {
        concept: 'convex-mirror',
        note: 'One holds the surface flat, so a single line square to it serves the whole of it; the other curves the surface, so that line swings from end to end — which is what both spreads the beams and widens what can be seen in it.',
      },
      {
        concept: 'snells-law',
        note: 'One has light thrown back from a surface at an angle that matches the one it came in at; the other has light carried on through a surface at an angle that does not.',
      },
    ],
  },
};
