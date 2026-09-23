/**
 * exchange-particles 개념 선언.
 *
 * 「닿지 않고 어떻게 미는가」 의 답 둘 가운데 **주고받음** 쪽이다. 이미 선언된
 * `electric-field` · `coulombs-law` 는 같은 밀어냄을 **장과 법칙**으로 답한다 — 자리마다
 * 값이 있고, 거리에 따라 세기가 정해진다. 이쪽은 그 자리에 **건너가는 알갱이 하나**를
 * 놓는다. 세기 · 거리 의존은 말하지 않는다(화면에도 없다).
 *
 * 이미 선언된 `spacetime-diagram` 과 그림이 닮았다(세로 시간 · 가로 공간) — 그쪽은
 * **기준계를 바꾸면 지금이 기운다** 를 주장하고, 이쪽은 좌표를 한 번도 바꾸지 않는다.
 * 기준계 · 동시 · 기울어진 지금 어휘를 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const exchangeParticlesConcept: Aperi21ConceptSource = {
  id: 'exchange-particles',
  label: 'A Force Passed by Trading a Particle',
  canonicalSim: 'aperi21:exchange-particles',

  surface: {
    definition:
      'Force pictured as a trade: one electron gives off a photon and recoils, the other is pushed when it takes it, and a gluon does the same between quarks.',
    exemplarKeywords: [
      'exchange particles',
      'force carriers',
      'Feynman diagram',
      'how do two electrons push each other without touching',
      'virtual photon',
      'gluons carry the strong force',
      'gauge bosons',
      'action at a distance replaced by something being passed',
      'reading a Feynman diagram for the first time',
      'the photon is the messenger of the electromagnetic force',
      'what actually carries a force between particles',
    ],
  },

  briefing: {
    observable: [
      'The drawing has time running up the picture and space running across it, with both axes named.',
      'A dotted line marked “now” rises from the bottom, and only what lies below it has been drawn — the diagram is built up as that line climbs.',
      'Two straight lines lean toward each other from below, each ending at a dot marked as an electron, so they are two electrons closing in.',
      'When the rising line reaches the first meeting point, the left line kinks outward at that point and a wavy line begins growing from it, upward and to the right at a slope of exactly forty-five degrees.',
      'The meeting point itself is marked in the strike colour, and while the wavy line is crossing, the right-hand electron keeps coming on straight — nothing whatever has happened to it yet.',
      'The wave then reaches the second meeting point, the right line kinks outward there too, and from that moment the two are moving apart.',
      'The dotted line lifts away and the finished drawing stands on its own: two straight lines that never meet at any height, joined only by the single wavy line between them.',
      'The straight lines lean less far across the picture than the wavy one does, which is a way of saying that the thing passed between them travels faster than either of them.',
      'The wavy line then turns, in place, into a line of small coils, and the marks on the two straight lines change from electron to quark; nothing else about the drawing changes and no colour changes.',
      'The mark naming what was passed appears beside it only once it has arrived, so while it is crossing it is known by the look of the line alone.',
      'The straight lines and the passed line are told apart by their shape — plain against wavy or coiled — and never by colour.',
      'Nothing is given a figure: no energy, no strength of the force, no distance across.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The exchange is swept out once, the finished drawing is held, the passed particle is changed, and the round starts over.',
        'It opens with the two already approaching and the line of now low in the picture, so the first thing seen is the drawing being made rather than a finished figure.',
        'The picture is built up by a rising line rather than shown complete, because the whole point is that the two kinks happen at different times, with the crossing in between.',
        'The passed line is drawn at forty-five degrees because in these drawings that slope is the speed of light, so the two straight lines are made steeper than it.',
        'The two meeting points are placed symmetrically about the middle, so the legs coming in and the legs going out are of equal length and neither electron is made the special one.',
        'The second force is shown by changing the same drawing where it stands instead of starting a fresh one, since the claim is that the grammar is unchanged and only what is passed differs.',
        'The caption says nothing about a push for the quark pair, because which way that force goes is not something this drawing settles.',
        'The straight lines carry no arrowheads; the direction of travel is given by the line of now moving upward.',
      ],
    },

    useWhen: [
      'The article has said that a force acts across empty space and the reader wants a mechanism rather than a restatement. Something leaves one and arrives at the other, and in between there is a gap in time.',
      'The article is about to use Feynman diagrams and the reader has never read one: time upward, space across, a meeting point where lines join, a different kind of line for what is passed.',
      'The point is that the same account covers more than one force. The same figure is kept and only the line between the two is redrawn.',
      'The reader imagines the two must be in contact at some moment. The finished drawing is two lines that are never at the same place at the same height, joined by one line that is.',
    ],

    avoidWhen: [
      'The subject is how strong a force is, how it falls off with distance, or how far it reaches. Nothing here is measured or compared in size.',
      'The article is about a particle turning into a different kind of particle, or about the force responsible for that. Both lines here come out as they went in.',
      'The subject is matter and antimatter meeting, or particles being made out of energy.',
      'The point is gravity being carried the same way. Only the two forces actually drawn are claimed.',
      'The article wants the field picture — a value or a direction filling the space between the two. Here the space between them holds one line and nothing else.',
      'A calculation is wanted from the diagram: an amplitude, a rule for each part, or a probability.',
      'The subject is how motion looks from one observer or another, or what counts as happening at the same moment.',
    ],

    contrastWith: [
      {
        concept: 'electric-field',
        note: 'Both answer how two charges that never touch affect each other; one fills the space between them with a value belonging to each place, the other sends a single particle across it.',
      },
      {
        concept: 'coulombs-law',
        note: 'One says how much the push is and how it weakens with separation; the other says what the push is made of, and settles no amount at all.',
      },
      {
        concept: 'spacetime-diagram',
        note: 'Both put time upward and space across, but there the drawing is redrawn for a second observer to show what changes, while here one set of axes stands throughout and what is being read is an event between two particles.',
      },
      {
        concept: 'pair-production',
        note: 'Both have a photon meeting matter at a point in such a drawing, but one is about a photon becoming two particles and the other about a photon merely being handed from one particle to another.',
      },
    ],
  },
};
