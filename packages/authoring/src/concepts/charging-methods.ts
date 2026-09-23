/**
 * charging-methods 개념 선언.
 *
 * 전하 둘 가운데 이쪽은 **부호가 생기는 과정**이다. **주장을 갈랐다.**
 *   charging-methods   옮겨 다니는 것은 전자뿐이고, **가는 곳**이 남는 부호를 정한다
 *   electric-charge    이미 부호를 가진 둘이 **밀거나 당긴다**
 * 이쪽만 「전자 · 마찰 · 접촉 · 유도 · 접지 · 몰림」 어휘를 갖는다. 밀고 당김 · 힘 · 장은
 * 화면에 없으므로 검색어에도 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const chargingMethodsConcept: Aperi21ConceptSource = {
  id: 'charging-methods',
  label: 'How a Body Ends Up Charged — Rubbing, Touching, Inducing',
  canonicalSim: 'aperi21:charging-methods',

  surface: {
    definition:
      'Why three ways of charging a body leave different signs behind: in all of them only electrons travel, and where they end up decides whether the two bodies finish opposite, alike, or opposite to the one that never touched.',
    exemplarKeywords: [
      'charging by friction, contact and induction',
      'how objects become charged',
      'rubbing a rod with fur',
      'charging by contact between two conductors',
      'charging by induction with earthing',
      'why does a balloon stick to the wall after rubbing it',
      'electrons move but protons do not',
      'earthing a conductor and then removing the wire',
      'electrons pushed to the far side of a conductor',
      'static electricity in dry weather',
    ],
  },

  briefing: {
    observable: [
      'Three panels stand side by side, one for each way, and they are worked through in turn while the others hold what they have reached.',
      'Every body carries the same number of nuclei written as plus signs, fixed in place, and its electrons are separate grains each written as e minus, so the grain and the body-wide sign are never the same character.',
      'In the rubbing panel a rod is worked back and forth over a piece of fur, drawn with a hatched texture, and two electrons climb from the fur into the rod; lifted apart, the rod is tagged negative and the fur positive.',
      'In the touching panel a conductor already tagged negative is brought up to a neutral one and made to touch, one of its spare electrons crosses the join, and on parting both are tagged negative.',
      'In the inducing panel a rod comes close but keeps a clear gap, and the electrons in the conductor crowd toward the far side while the tag still reads neutral and the near half shows only plus signs.',
      'A wire then links the conductor to a ground mark, the crowded electrons file down it one behind the other, the wire fades away, the rod withdraws, the electrons that stayed spread out evenly again, and the tag reads positive.',
      'The electrons that went to ground are still drawn, resting below the ground mark, rather than vanishing.',
      'Each tag changes at the moment a transfer finishes, so in the inducing panel the conductor already reads positive while the rod is still held nearby.',
      'At the close the three results stand together — opposite signs, the same sign, and the sign opposite to the rod that never touched.',
      'Everything is drawn in one colour; the electrons that moved are not marked out from the ones that stayed.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the three panels are worked through in order and the run begins again.',
        'The tag on each body is decided by counting the electrons it holds against its nuclei, so it states an outcome rather than naming the step that produced it.',
        'The rod in the inducing panel never closes the gap, which is the only thing that keeps that panel from being the touching panel.',
        'The crowding is drawn wider than it really is so that the grains do not overlap; the point it carries is which half of the conductor is left showing plus.',
        'The three panels share one screen so that the three outcomes can be set against one another at the end rather than remembered in turn.',
      ],
    },

    useWhen: [
      'The article has listed the three ways and the reader can repeat the names but not say why induction ends up opposite while contact ends up alike. Watching named electrons cross, or leave down a wire, makes the sign an outcome of a route rather than a rule to memorise.',
      'The prose needs to stop a reader from thinking positive charge flows. Nothing here moves except the electrons, and the plus signs stay where they are drawn.',
    ],

    avoidWhen: [
      'The article is about what two charged bodies then do to each other. The panels finish at the tags; nothing is attracted or repelled.',
      'The question is which materials give up electrons to which — a triboelectric list. That the rod gains and the fur loses is simply set here.',
      'An electroscope, or any way of testing whether something is charged, is the subject. Nothing here is used to detect a charge; the tags state it.',
      'The article is about current, circuits or a lasting flow. The wire to ground carries a couple of electrons once and is then broken.',
      'Amounts are wanted — coulombs, how much charge was moved, how many electrons in a real case. Nothing is numbered.',
      'The subject is charge inside an atom, ionisation, or why some materials conduct at all. Conductor and insulator are simply how the bodies behave here.',
    ],

    contrastWith: [
      {
        concept: 'electric-charge',
        note: 'One asks how a body comes to have a sign at all; the other takes two bodies whose signs are given and asks which way they move.',
      },
      {
        concept: 'coulombs-law',
        note: 'One follows the carriers that leave a sign behind; the other never asks where the charge came from and works only with what the separation does to the force.',
      },
      {
        concept: 'electric-field',
        note: 'One keeps the account inside the bodies — which body holds which grains; the other leaves the bodies alone and describes the space around a charge.',
      },
    ],
  },
};
