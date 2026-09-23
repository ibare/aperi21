/**
 * lorentz-force 개념 선언.
 *
 * 힘 다섯 가운데 이쪽은 **한 순간의 방향**이다 — 전하가 움직이지 않고, 궤적도 자취도 없다.
 *   lorentz-force                      F 가 v · B **양쪽에 직각**이고, 나란하면 0, 부호를 뒤집으면 반대
 *   charged-particle-in-magnetic-field 그 힘이 낳는 **한 바퀴 시간**이 속력에 매이지 않는다
 *   velocity-selector                  전기력과의 **크기 경쟁**이 속력을 고른다
 *   mass-spectrometer                  속력이 같을 때 **질량**이 반지름을 가른다
 *   force-on-current-wire              같은 힘이 **도선 전체**에 모여 도선이 튄다
 * 이쪽만 「직각 · 벡터곱 · 나란하면 0 · 부호를 뒤집으면 반대」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const lorentzForceConcept: Aperi21ConceptSource = {
  id: 'lorentz-force',
  label: 'Direction of the Force on a Moving Charge',
  canonicalSim: 'aperi21:lorentz-force',

  surface: {
    definition:
      'The force on a charge moving through a magnetic field, standing square to the velocity and to the field at once, dwindling to nothing when the two line up and reversing when the sign of the charge is changed.',
    exemplarKeywords: [
      'magnetic force on a moving charge',
      'F equals q v cross B',
      'which way does the magnetic force point',
      'right hand rule for a moving charge',
      'why is the magnetic force sideways to the motion',
      'no force when the charge moves along the field',
      'a negative charge is pushed the opposite way',
      'cross product of velocity and magnetic field',
      'the force is neither along the motion nor along the field',
      'working out the direction of a magnetic force',
    ],
  },

  briefing: {
    observable: [
      'Three arrows meet at a single charge in a tilted view: the field standing straight up, the velocity, and the force.',
      'The velocity swings once round a dotted circle lying flat, the plane square to the field, and the force follows a quarter turn behind it on that same circle.',
      'A faint triangle spanning the charge, the velocity tip and the field tip, together with two small square corner marks, show that the force stands square to both.',
      'The velocity then tilts upward toward the field, and the force holds its direction while growing shorter.',
      'At the moment the velocity lies along the field the force, the triangle and the corner marks all go, and a note appears beside the charge saying the force is nothing.',
      'The velocity lies back down and the force comes back.',
      'The mark cut into the charge changes from plus to minus in a single instant, and the force jumps to the far end of the same line with the previous one left behind as a dotted ghost.',
      'The velocity swings round again with the charge now negative, still square to it but a quarter turn ahead rather than behind.',
      'At the matching point of the two swings the velocity stands in exactly the same place and the force points the opposite way.',
      'The charge never leaves its place and no path or trail is drawn.',
      'The force is the only thing in the accent colour, and nothing is written but the note that the force is nothing.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the velocity is swung round, tilted up to the field, laid back down and the sign of the charge is flipped, and then the run repeats.',
        'The force is drawn to one scale with no ceiling, so its shortening as the velocity tilts up is in proportion rather than merely suggested.',
        'The sign of the charge is cut into the disc as a stroke in the background colour rather than shown by a colour, so nothing suggests that two colours mean two different forces.',
        'The corner marks fade as the force shortens and are gone once it is nothing, so they never claim an angle where there is no arrow.',
        'The direction the velocity is stood up in is set well off the line of sight, so that its shortening cannot be taken for foreshortening.',
        'The charge is held in one place throughout, so what is shown is the force at an instant rather than what the charge goes on to do.',
        'The field is one arrow rather than a pattern filling the picture, because what is being read here are the angles between three arrows at one point.',
      ],
    },

    useWhen: [
      'The article has given the rule as a cross product or a hand rule and the reader cannot make the direction come out. Watching the force ride a quarter turn behind a velocity that is itself turning is where the rule stops being a recipe to be applied.',
      'The prose needs the two cases the rule is usually stated with — nothing when the motion is along the field, and reversed for a negative charge — and both are reached in one run without anything being rearranged.',
    ],

    avoidWhen: [
      'The article is about the path a charge takes, its circle, its radius or how long a lap takes. The charge here never leaves its place.',
      'An electric force is acting as well, or two forces are to be weighed against one another. One force is drawn.',
      'The subject is a wire carrying a current rather than one charge on its own.',
      'Numbers are wanted — a charge, a speed, a field, a size of force. Nothing is labelled but the note that the force is nothing.',
      'The article needs the field drawn as a region with a pattern filling it. One arrow stands for the field here.',
      'The reader is meant to swing the velocity themselves and watch the force answer. The swing runs on its own.',
    ],

    contrastWith: [
      {
        concept: 'charged-particle-in-magnetic-field',
        note: 'One holds the charge still and is about where the force points at an instant; the other lets it go and is about the lap that results, whose time turns out not to depend on the speed.',
      },
      {
        concept: 'force-on-current-wire',
        note: 'One is the force on a single charge, so what it varies is the angle to the field and the sign; the other is the same force gathered over all the carriers in a wire, so what it varies is the current and what moves is the wire.',
      },
      {
        concept: 'velocity-selector',
        note: 'One is about which way the magnetic force points and never sets it against anything; the other keeps that direction fixed and is entirely about its size against an electric force.',
      },
      {
        concept: 'centripetal-force',
        note: 'One arrives at a force square to the motion from the way a magnetic field acts on a charge; the other takes such a force as given and is about what taking it away does to the path.',
      },
      {
        concept: 'motional-emf',
        note: 'One varies the angle and the sign to settle where the force points and lets it do nothing further; the other has the same force acting along a conductor until the two ends stand at different potentials, which is what a voltage is made of.',
      },
    ],
  },
};
