/**
 * charge-in-uniform-field 개념 선언.
 *
 * 힘 셋 가운데 이쪽은 **길**이다 — 옆에서 들어온 전하가 그리는 포물선.
 *   charge-in-uniform-field   가로는 같은 걸음, 세로는 걸음마다 더 — 그리고 **무거우면 덜 휜다**
 *   coulombs-law              두 전하의 거리와 힘의 크기
 *   superposition-of-forces   원천 여럿의 몫이 따로 더해진다
 * 이미 선언된 `projectile-motion` · `free-fall` 과도 갈랐다 — 저쪽 둘은 **질량이 지워지는**
 * 자리이고, 이쪽은 힘이 전하로 정해져 **질량이 남는다**(배수의 역수만큼 덜 내려온다).
 * 판 사이 장이 고르다는 것은 uniform-field 몫이라 전제로만 둔다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const chargeInUniformFieldConcept: Aperi21ConceptSource = {
  id: 'charge-in-uniform-field',
  label: 'Charge Sent Sideways Between Charged Plates',
  canonicalSim: 'aperi21:charge-in-uniform-field',

  surface: {
    definition:
      'The path of a charge fired in sideways between charged plates: its steps along the plates stay equal while its drop toward one grows at every step, and a charge of several times the mass drops only that fraction as far.',
    exemplarKeywords: [
      'charge deflected between charged plates',
      'parabolic path of a charge in an electric field',
      'deflecting a beam of electrons',
      'cathode ray tube deflection plates',
      'sideways entry into a uniform field',
      'does a heavier ion get deflected less',
      'equal steps along and growing drops across',
      'how far a charge is pushed aside before it leaves the plates',
      'sorting particles by mass with charged plates',
      'steering drops in an inkjet head',
    ],
  },

  briefing: {
    observable: [
      'A positive charge runs in level and straight from a region beyond the plates where nothing acts on it, and enters the gap parallel to them.',
      'While it crosses, a mark is dropped every equal interval of time, so the record is laid down in beats rather than in distance.',
      'Above the marks runs the straight dotted path it would have kept had the plates been uncharged, carrying ticks made at the very same instants.',
      'From each tick a short segment in the accent colour drops to the mark below it, and these segments grow as one, four, nine, sixteen — while the spacing of the ticks along the dotted path never changes.',
      'An arrow labelled as the electric force points straight down from the charge and keeps one length the whole way across.',
      'At the far end of the plates the charge goes, leaving nine marks, eight segments and the curve they trace.',
      'A second charge of a stated multiple of the mass then enters at the same height and the same speed, and the first record dims but stays on screen.',
      'Its marks stand directly beneath the same ticks — the steps along are unchanged — while its accent segments stop partway down the faint ones, at one over that multiple of their length.',
      'Its force arrow is drawn exactly as long as the first, so the difference between the two records is not in what pushes them.',
      'At the close two curves and two ladders of segments stand together, each record named at its end by the mass it belongs to, and the closing line calls the path that of a thrown ball and states the fraction.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the light charge crosses, is held, the heavy one follows, and the two are set side by side before the run begins again.',
        'Both records use the same ticks and the same lines, so the dark part of a segment stopping partway up the faint one is itself the ratio, with nothing to measure.',
        'The two charges are not told apart by colour but by a mass mark at the end of each record and by the earlier record dimming.',
        'The accent colour is kept for one meaning only — how far below the undisturbed path the charge has got.',
        'The charge is drawn away at the end of the plates rather than followed further, so the record ends where the field does.',
      ],
    },

    useWhen: [
      'The article says the path is a parabola like a thrown ball and the reader takes the likeness on trust. A straight dotted path with evenly spaced ticks, and drops from them growing as the squares, is the likeness taken apart into its two halves.',
      'The prose needs the point that here, unlike a falling body, the mass does not drop out — the push is set by the charge, so the heavier one is deflected less and the two records make the fraction readable.',
    ],

    avoidWhen: [
      'The subject is what the charge does after leaving the plates. It is taken off screen at the plate end and the straight run afterwards is never drawn.',
      'The article is about whether the field between the plates really is the same everywhere. That is assumed here; no field lines are drawn at all.',
      'A charged particle in a magnetic field, or a circular path, is wanted. The push here holds one direction and one size throughout.',
      'Values are needed — a voltage, a speed, how far it was deflected, an angle on leaving. Nothing is numbered but the mass ratio named in the closing line.',
      'Gravity on the charge is part of the article. Only the electric push is drawn and nothing is said about weight.',
      'The reader is meant to vary the mass or the entry speed. Both records are fixed and run through once each cycle.',
    ],

    contrastWith: [
      {
        concept: 'projectile-motion',
        note: 'Both split a curved path into an unchanging run along and a growing drop across, but one is about bodies under gravity, where what is thrown makes no difference to the fall; the other is about charges, where the push is set by the charge so the heavier one falls behind.',
      },
      {
        concept: 'free-fall',
        note: 'One is the case where a heavier body is not left behind, because what pulls it also resists being moved; the other is the case where it is, because what pushes it is its charge and not its mass.',
      },
      {
        concept: 'uniform-field',
        note: 'One establishes that the push is the same wherever the charge happens to be; the other takes that as given and asks what path follows from it.',
      },
      {
        concept: 'coulombs-law',
        note: 'One has a push that changes steeply with separation and is measured at rest; the other has a push that never changes during the crossing and is read from the shape of a path.',
      },
    ],
  },
};
