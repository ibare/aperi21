/**
 * electrostatic-shielding 개념 선언.
 *
 * 도체 셋 가운데 이쪽은 **남의 장이 들어오지 못한다** 가 주장이다. 도체는 중성이다.
 *   electrostatic-shielding       바깥 고른 장 속의 **중성** 속 빈 도체 — 겉면에 −/+ 가 모여 안을 **비운다**
 *   field-of-charged-sphere       도체가 **제 전하**를 가졌을 때의 밖과 안
 *   charge-on-conductor-surface   **전하끼리** 밀어 정하는 겉면 위 자리 (뾰족한 곳)
 * 이쪽만 「유도 전하 · 장선이 겉면에서 끝남 · 안이 비워짐 · 도체를 치우면 돌아온다」 어휘를 갖는다.
 * 놓는 단계와 모이는 단계가 갈려 있어 「물건이 막는다」 가 아니라 「모인 전하가 지운다」 가 된다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const electrostaticShieldingConcept: Aperi21ConceptSource = {
  id: 'electrostatic-shielding',
  label: 'How a Hollow Conductor Keeps an Outside Field Out',
  canonicalSim: 'aperi21:electrostatic-shielding',

  surface: {
    definition:
      'That a neutral hollow conductor standing in an outside field gathers charge of opposite sign on its two faces, and that the gathered charge exactly wipes out the field in the space enclosed within it.',
    exemplarKeywords: [
      'electrostatic shielding',
      'Faraday cage',
      'why is there no field inside a hollow conductor',
      'a metal box keeps an outside field out',
      'induced charge on a conductor placed in a field',
      'safe inside a car during a lightning strike',
      'screening a sensitive instrument with metal',
      'field lines end square on a conductor surface',
      'the cavity inside a conductor is free of field',
      'does metal block an electric field',
    ],
  },

  briefing: {
    observable: [
      'Straight evenly spaced lines run left to right across the screen, each carrying a small arrowhead near either end to show the way along it.',
      'A small charge named +q sits in the middle of them carrying a thick arrow in the accent colour, pointing along the lines.',
      'A thick ring — the section of a hollow conductor — appears around that charge, and at first the lines run straight through it exactly as before and the thick arrow is unchanged.',
      'Then minus marks darken along the inside of the left wall and plus marks along the right, crowded toward the middle heights of the ring and sparse toward its top and bottom.',
      'As they darken, the lines outside bend toward the ring and stop on its outer edge, meeting it square on; on the far side they start again from that edge and run on.',
      'At the same time the lines crossing the enclosed space spread apart from one another and are pushed out past the edge one by one until none is left inside.',
      'The thick arrow on the charge shortens in step with all this and reaches nothing.',
      'It is then held: every line ends square on the surface, the enclosed space holds no line at all, the charge carries no arrow, and the outermost pair of lines passes by without ever touching the ring.',
      'The ring and its marks then fade, the lines straighten and cross the space again, the arrow comes back at its first length, and the run begins over.',
      'Nothing is written but the plus and minus marks and the name +q; no strength, charge or distance is given.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the conductor is placed, the charge gathers, the enclosed space empties, and the conductor is taken away again.',
        'Placing the conductor and letting the charge gather are two separate steps, so that putting the metal there is seen to do nothing by itself.',
        'The gathering is stretched over a couple of seconds, and what is drawn partway is the correct picture for that much charge gathered rather than a blend of the before and after pictures.',
        'Each mark stands for the same amount of charge, so where the marks crowd is where the charge crowds.',
        'The spacing of the lines carries the strength, so the enclosed space empties by lines spreading and being pushed out rather than by anything fading.',
        'The line starts are offset by half a spacing, so no line runs through the place the charge sits and the emptying can be read before the very last moment.',
        'The accent colour is kept for the force the charge inside is feeling, and the conductor itself is drawn in a quiet tone.',
        'The conductor is drawn round, so the lines meet it exactly square on rather than nearly so.',
      ],
    },

    useWhen: [
      'The article names a Faraday cage or says that a conductor screens, and the reader takes the metal itself to be the barrier. Lines running straight on through the newly placed ring, and stopping only once charge has gathered, is what moves the cause from the material to the charge.',
      'The prose needs the exactness rather than a weakening: lines ending square on the surface with the enclosed space holding nothing at all, instead of a field that merely gets smaller inside.',
    ],

    avoidWhen: [
      'The conductor carries charge of its own and the question is about the field that charge makes. This one stays neutral throughout; the marks are only pushed to opposite faces.',
      'The question is where charge settles on an awkwardly shaped conductor, or why it crowds where the shape is sharp. This body is round, and the crowding drawn is the crowding the outside field causes.',
      'A charge is put inside the cavity and the question is whether the outside is shielded from it. The charge inside here disturbs nothing; only the outside field is at issue.',
      'The subject is a screened cable, radio waves getting in or out, or a changing field. Everything here is still.',
      'Values are wanted — a field strength, how much charge gathers, the law for surface density.',
      'The claim wanted is that the metal of any conductor carries no field within its solid bulk. What is emptied here is the hollow space, drawn as a cavity with a wall around it.',
    ],

    contrastWith: [
      {
        concept: 'field-of-charged-sphere',
        note: 'One keeps the conductor neutral and puts the field outside it; the other puts the charge on the conductor and asks about the field that is its own.',
      },
      {
        concept: 'charge-on-conductor-surface',
        note: 'One lets an outside field decide which faces the charge gathers on; the other has no outside field, and the charges alone decide, on a shape with a point.',
      },
      {
        concept: 'uniform-field',
        note: 'One takes an even field as its setting and puts something in it that ruins that evenness; the other is about the evenness itself and has nothing put in the way.',
      },
      {
        concept: 'field-lines',
        note: 'One relies on where the lines stop and how their spacing changes as its evidence; the other asks whether spacing is entitled to mean strength at all.',
      },
      {
        concept: 'gausss-law',
        note: 'One shows lines ending on a surface so that nothing is left crossing the space beyond it; the other counts crossings of a boundary drawn anywhere at all and finds the count settled by what is enclosed.',
      },
    ],
  },
};
