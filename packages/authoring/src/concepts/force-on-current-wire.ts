/**
 * force-on-current-wire 개념 선언.
 *
 * 힘 다섯 가운데 이쪽은 **도선 전체가 움직인다**이다 — 움직이는 것이 전하가 아니라 매달린 도선이고,
 * 바뀌는 것은 각도가 아니라 **전류**(끄기 · 뒤집기 · 키우기)다.
 *   force-on-current-wire              스위치를 닫자 그네 도선이 **튄다**, 전류를 키우면 더 멀리
 *   lorentz-force                      전하 **하나**의 힘 방향 (움직이지 않는다)
 *   charged-particle-in-magnetic-field 자유로운 전하의 한 바퀴 시간
 *   velocity-selector · mass-spectrometer 날아가는 전하의 궤적을 쓰는 쪽
 * 이미 선언된 자기장 쪽과도 갈랐다 — `magnetic-field` 는 자석의 장을 **찾는** 일,
 * `field-of-straight-wire` 는 전류가 장을 **만드는** 일, 이쪽은 있는 장이 전류를 **미는** 일.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const forceOnCurrentWireConcept: Aperi21ConceptSource = {
  id: 'force-on-current-wire',
  label: 'A Wire Thrown Sideways by a Field',
  canonicalSim: 'aperi21:force-on-current-wire',

  surface: {
    definition:
      'The sideways force a magnetic field puts on a wire carrying current, square to both, which throws the hanging wire one way or the other as the current is reversed and further out as the current is raised.',
    exemplarKeywords: [
      'force on a current carrying wire',
      'F equals B I L',
      'the wire jumps when the switch is closed',
      'motor effect',
      'swinging wire between the poles of a magnet',
      'reversing the current reverses which way the wire goes',
      'why does a wire in a magnetic field move',
      'left hand rule for a motor',
      'the push adds up over all the electrons in the wire',
      'twice the current throws the wire twice as far',
    ],
  },

  briefing: {
    observable: [
      'A horseshoe magnet lies on its side with a letter on each arm, and grey arrows in the gap between the arms show the field crossing it.',
      'A swing hangs from a pivot with its wire at the lower end sitting in that gap; the wire is seen end on, as a circle, and a mark inside it says which way the current runs through the page.',
      'To begin with the current is written as nothing and the swing hangs straight down.',
      'The current is switched on and written as a value; at that instant an accent-coloured arrow appears at the rim of the wire pointing sideways, and the swing is thrown that way, overshoots and settles.',
      'The mark inside the wire changes to the other kind, the arrow turns to point the other way, and the swing is thrown to the other side.',
      'The current is written as nothing again, the arrow goes, and the swing returns to hanging.',
      'The current is then written at twice its earlier value: the arrow is twice as long and the swing goes further out, with its resting place at the earlier current left behind as a dotted outline to compare against.',
      'A round inset opens at the top left, joined by a line down to the wire, holding three electrons, and each carries a small arrow of the same accent colour pointing the same way as the big one on the wire.',
      'The letters on the arms are the only marking the magnet carries, with no red and blue.',
      'Nothing is written but the current and those letters; no angle, force or length of wire appears.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the current is switched on, reversed, switched off and doubled, the inset is opened, and the run repeats.',
        'Which way the current runs is shown by the mark inside the wire rather than by the sign of the written value, so the written figure is always read as a size.',
        'The accent colour is kept for the magnetic force alone, and the small arrows on the electrons carry it too because they are the same force; the magnet and its field are in grey as background.',
        'The wire is seen along its own length, so that the field across the gap, the current through the page and the force sideways are all three square to each other on a flat drawing.',
        'The force arrow starts at the rim of the wire rather than at its centre, so it never covers the mark that gives the current direction.',
        'One scale with no ceiling is used for the arrow, so doubling the current doubles the arrow.',
        'The swing is made to move much further than a real one would, so that the throw can be seen at all.',
        'The electrons are shown in an inset rather than inside the wire itself, because at the size of the wire on the screen three specks and their arrows would not be readable.',
      ],
    },

    useWhen: [
      'The article has given the force on a wire as a formula and the reader has no picture of anything happening. A swing that jumps the moment a switch is closed, and jumps the other way when the current is reversed, is where the formula becomes an event.',
      'The prose needs the step from one moving charge to a whole wire, and the inset showing three electrons each pushed the same way as the wire is what carries the reader across it.',
    ],

    avoidWhen: [
      'The article is about a single charge and which way the force on it points. Here the wire is what moves, and the electrons appear only in the inset.',
      'The subject is a coil, a loop that turns, or a motor that goes round. One straight wire hangs here and swings to one side.',
      'The article is about a current making a field of its own. The field here is already present, laid by the magnet.',
      'A number is wanted — a force, a field, a length of wire, an angle. Only the current is written.',
      'The subject is a current brought into being by moving the wire, or a voltage produced by that motion. The current here is put in and the motion comes out.',
      'The reader is meant to turn the current up themselves. The run passes through every setting on its own.',
    ],

    contrastWith: [
      {
        concept: 'lorentz-force',
        note: 'One is the same force totalled over all the carriers of a wire, so what it varies is the current and what answers is the wire; the other is on one charge alone, so what it varies is the angle to the field and the sign.',
      },
      {
        concept: 'field-of-straight-wire',
        note: 'One has a current pushed by a field that was already there; the other has a current laying a field of its own, which is why switching it off is what that picture turns on.',
      },
      {
        concept: 'magnetic-field',
        note: 'One takes the field between two poles as given and is about what it does to a current placed there; the other is about finding the shape of such a field in the first place, with nothing in it that is pushed.',
      },
      {
        concept: 'mass-spectrometer',
        note: 'One has the force move a solid wire that stays hung from its pivot; the other lets free ions fly and reads the paths they take.',
      },
    ],
  },
};
