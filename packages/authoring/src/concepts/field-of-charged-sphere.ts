/**
 * field-of-charged-sphere 개념 선언.
 *
 * 도체 셋 가운데 이쪽은 **제 전하가 만드는 장이 겉면을 경계로 갈린다** 가 주장이다.
 *   field-of-charged-sphere       밖은 **가운데 한 점**과 똑같고, 겉면을 넘으면 **사라진다**
 *   charge-on-conductor-surface   그 전하가 겉면 **어디에** 앉는가 (뾰족한 곳에 몰린다)
 *   electrostatic-shielding       **남의 장**이 속 빈 도체 안으로 못 들어온다 (도체는 중성)
 * 이쪽만 「밖과 안 · 1/r² · 겉면에서의 낙하 · 한 점으로 모아도 밖은 그대로」 어휘를 갖는다.
 * 닫힌 경계를 세어 까닭을 푸는 것은 gausss-law 의 몫이라 검색어에도 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const fieldOfChargedSphereConcept: Aperi21ConceptSource = {
  id: 'field-of-charged-sphere',
  label: 'Field Outside and Inside a Charged Sphere',
  canonicalSim: 'aperi21:field-of-charged-sphere',

  surface: {
    definition:
      'That a charged hollow conducting sphere makes outside itself exactly the field a single point holding the same charge would make, while across its surface the field falls to nothing and stays nothing within.',
    exemplarKeywords: [
      'field of a charged sphere',
      'charged hollow conducting sphere',
      'why is there no field inside a charged sphere',
      'outside a sphere the field is that of a point charge',
      'treating a ball of charge as if it were all at the centre',
      'shell of charge on a conductor',
      'field just outside the surface against just inside',
      'does a charged ball pull on something sitting inside it',
      'the field jumps as you cross a charged surface',
      'field against distance for a charged ball',
    ],
  },

  briefing: {
    observable: [
      'A hollow sphere is drawn with plus marks spread evenly over its surface, and at some three dozen places around it a thin arrow points straight outward, long close in and short far out.',
      'At four places inside the sphere there is no arrow but a dot, so those places read as measured and found to be nothing rather than as places nobody looked at.',
      'Below the picture runs a pair of axes named E and r, sharing the same horizontal positions as the picture above it, so that 0 falls directly under the centre of the sphere and R directly under its surface, joined by a dotted guide dropping from the surface.',
      'A small test charge named +q comes in from the right along the middle line, and as it approaches, the thick arrow it carries in the accent colour lengthens while a curve is drawn on the axes below, rising from the right.',
      'A faint connector runs from the test charge down to the end of the curve, so the two are read as the same distance.',
      'At the instant the test charge crosses the surface its arrow disappears, and at the same instant the curve drops vertically at R to the horizontal axis and continues inward along it.',
      'The plus marks then gather from the surface toward the centre along a shrinking shell, the original surface staying behind as a dotted circle; arrows appear at the inside places as the shell passes inward of them, and the test charge regains an arrow once the shell has gone past it.',
      'With all the charge at one point in the middle, the arrows outside the sphere are exactly as they were at the start.',
      'A dark dotted curve for that single point then appears on the axes: outside R it lies exactly on the curve already drawn, and inside R it climbs away and off the top of the panel.',
      'Nothing bears a number — the only writing is the plus marks, the name +q, and the letters E, r, R and 0.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the arrows are laid, the test charge comes in and crosses, the charge is gathered to a point, and the run begins again.',
        'The graph shares its horizontal axis with the picture above, so the place where the curve falls is directly under the surface and needs no lettering to be matched up.',
        'Every arrow outside the sphere is drawn in strict proportion; only those near the gathered point are cut to one length, and the curve rising off the panel there says their strength instead.',
        'The accent colour is kept for what the test charge is feeling right now — its arrow, the curve being drawn, and the point at the end of it.',
        'The single point’s curve is separated from the drawn one by being a dark dotted line laid over it rather than by taking a colour of its own, so that lying on top reads as agreement.',
        'There is no distance grid, since what is to be read is the shape of the curve — nothing inside, a step at the surface, a fall outside — and not a length.',
      ],
    },

    useWhen: [
      'The article has stated that a charged conductor has no field within it and the reader is taking it on trust. An arrow that vanishes at the exact moment of crossing, with the curve below dropping at the same instant, is where the statement stops being an assertion.',
      'The prose needs the other half — that from outside, the sphere may be replaced by a point at its centre. Gathering the charge and finding the outside arrows and the outside curve unmoved is that replacement carried out rather than claimed.',
    ],

    avoidWhen: [
      'The body is a solid insulating sphere with charge spread through its volume, where the field rises from the centre outward. Here the charge sits on the skin and the inside is flatly nothing.',
      'The argument is to be made by drawing a closed boundary and counting what crosses it. No boundary is drawn; a charge is carried in and what it feels is recorded.',
      'A value is wanted — a field strength, the constant in the law, a distance in metres. Nothing on screen bears a quantity.',
      'More than one sphere is present, or something else stands nearby and the two fields are to be combined.',
      'The subject is where on a conductor the charge comes to rest, or why it sits on the surface at all. Here it is drawn on the surface from the first frame.',
      'The subject is gravity inside a planet, or any field whose source is spread through the body rather than over its skin.',
    ],

    contrastWith: [
      {
        concept: 'charge-on-conductor-surface',
        note: 'One takes the charge as already settled evenly on a round surface and asks what field that leaves inside and outside; the other asks where on the conductor the charge settles, and finds it does not settle evenly.',
      },
      {
        concept: 'electrostatic-shielding',
        note: 'One charges the conductor and finds its own field absent within it; the other leaves the conductor neutral and finds somebody else’s field kept out of it.',
      },
      {
        concept: 'shell-theorem',
        note: 'Both end with a body of finite size standing in for a point, but one reaches it by measuring what a charge feels at each distance, and the other by the geometry of how the pulls from a shell cancel.',
      },
      {
        concept: 'gausss-law',
        note: 'One asks how strong the field is at each distance and plots the answer; the other never asks how strong it is and only counts what crosses a boundary of any shape.',
      },
      {
        concept: 'inverse-square-law',
        note: 'One is about a source with a size, so it has an inside where the rule stops holding; the other is about the spreading itself and has no inside to enter.',
      },
    ],
  },
};
