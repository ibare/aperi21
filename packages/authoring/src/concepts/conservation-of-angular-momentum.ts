/**
 * conservation-of-angular-momentum 개념 선언.
 *
 * `angular-momentum` 과 **누가 건드리는가**로 갈랐다 — 저쪽은 밖에서 치고, 이쪽은
 * 아무도 건드리지 않는다. 주어도 다르다: 저쪽 주어는 「축이 밀린 정도」, 이쪽 주어는
 * 「그대로인 곱」 이다. `moment-of-inertia` 와는 **언제** 질량을 옮기는가로 갈린다 —
 * 저쪽은 멈춘 뒤에만 옮겨 시행을 공평하게 견주고, 이쪽은 도는 중에 옮겨 빠르기가
 * 되받아치게 한다. 이쪽만 팔을 오므린다 · 회전 의자 · 다이빙 턱 · Iω 그대로 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const conservationOfAngularMomentumConcept: Aperi21ConceptSource = {
  id: 'conservation-of-angular-momentum',
  label: 'Conservation of Angular Momentum',
  canonicalSim: 'aperi21:conservation-of-angular-momentum',

  surface: {
    definition:
      'A turning body left to itself keeps the product of its resistance to turning and its rate of turning, so drawing its mass inward speeds it up with nothing pushing it.',
    exemplarKeywords: [
      'conservation of angular momentum',
      'a spinning skater pulls in their arms',
      'why does pulling your arms in make you spin faster',
      'the product I omega stays the same',
      'a diver tucking to spin faster',
      'a collapsing star spins up',
      'trading inertia for rate of turning',
      'speeding up without being pushed',
      'arms out and arms in on a swivel chair',
      'closed system with nothing to turn it',
    ],
  },

  briefing: {
    observable: [
      'A turning body is seen from directly above: a small disc for the trunk, one straight arm across it, and a weight at each hand.',
      'Pinned to each half of the arm is a sector showing exactly the angle that half has swept in the last four tenths of a second; the radius is fixed, so a wider sector means only a faster turn.',
      'The weights are drawn inward and the sectors widen from about eighteen degrees to about eighty — in the same stretch of clock the body now covers four and a half times the angle.',
      'A dotted circle stays where the hands had been, so how far in they have come is on the screen rather than held in mind.',
      'At the right stands a rectangle whose width is the body’s resistance to turning and whose height is its rate of turning, so its area is the quantity in question.',
      'As the weights come in the rectangle grows narrow and tall, and its corner slides along a dashed accent-coloured curve without ever leaving it — the area holds while both sides change.',
      'The arms are then spread again and it all runs the other way: the sectors narrow, the rectangle flattens, and the corner slides back down the same curve.',
      'The only thing that acts on the body is its own arm drawing itself in and spreading itself out again.',
    ],

    screen: {
      affordances: [
        'Spread, draw in, held in, spread again — the four stages run in order by themselves and then come round.',
        'The sector window is fixed at four tenths of a second, so the picture says the same thing when it is paused or printed as it does while it is moving.',
        'Both halves of the arm carry a sector, so neither half can be read as doing something the other is not.',
        'The panel at the right is drawn with two bare axes and no grid or scale, which puts the question on whether the area holds rather than on what the numbers are.',
        'The accent colour is kept for the quantity that holds — its curve and its label — while the sectors and the rectangle share a quieter tone as the things being measured.',
      ],
    },

    useWhen: [
      'The article has made the skater-and-arms claim and the reader half believes it without seeing why. A rectangle keeping its area while both its sides change is what turns the claim into something watched.',
      'The point is that a trade is going on in both directions and not just a speeding up, so the spreading stage is needed as much as the drawing in.',
    ],

    avoidWhen: [
      'The article asks where the extra speed came from in terms of energy, or notes that the arms did work. Nothing on the screen stands for energy, and the quantity shown is not the one that changed.',
      'Something outside is turning the body — a hand, a motor, a torque. The whole claim rests on nothing arriving from outside.',
      'The subject is how far an outside blow can shift a spinning axis. This body’s axis never moves.',
      'Values are wanted for the resistance, for the rate of turning or for their product. The screen carries no number but the four tenths of a second the caption names.',
      'Two arrangements of mass are to be set going from rest and compared. Here the rearranging happens while the body is already turning, which is the whole of it.',
    ],

    contrastWith: [
      {
        concept: 'angular-momentum',
        note: 'One asks what becomes of the quantity when nothing outside touches the body; the other asks how far an outside blow can shift a body that already carries it.',
      },
      {
        concept: 'moment-of-inertia',
        note: 'Both rearrange a body’s mass, but one does it mid-turn so the rate of turning answers back, and the other does it at rest so each arrangement can be started fairly from nothing.',
      },
      {
        concept: 'rotational-kinetic-energy',
        note: 'One follows a quantity that stays the same while a body reshapes itself; the other follows a quantity that is handed over and spent.',
      },
    ],
  },
};
