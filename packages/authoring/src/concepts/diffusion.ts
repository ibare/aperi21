/**
 * diffusion 개념 선언.
 *
 * 무작위 걸음 삼형제 중 하나. 주어를 **무리와 구간마다의 수**로 잡았다 —
 * `brownian-motion` 은 알갱이 하나의 까닭, `random-walk` 는 걸음 수와 거리의 관계다.
 * 이쪽만 「진한 · 옅은 · 고르게 된다 · 휘젓지 않는다」 어휘를 갖는다.
 *
 * 되돌아오지 않음(`second-law-of-thermodynamics`)과도 갈랐다 — 저쪽은 **방향**,
 * 이쪽은 **농도 차이가 메워지는 과정**이다. 다만 주제 설명이 말하는 「흐름」 자체를
 * 화면이 그리지 않아(순 흐름 화살표 없음) definition 을 고르게 됨으로 좁혔다(간극 장부).
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const diffusionConcept: Aperi21ConceptSource = {
  id: 'diffusion',
  label: 'Diffusion as an Evening Out',
  canonicalSim: 'aperi21:diffusion',

  surface: {
    definition:
      'Spreading that needs no stirring: a dense clump in a still liquid thins while the sparse parts fill, until every region holds about the same amount and stops changing.',
    exemplarKeywords: [
      'diffusion',
      'a drop of ink spreads through water on its own',
      'why does a smell fill the whole room',
      'from where it is concentrated to where it is not',
      'nobody stirred it and it still spread',
      'dye evening out in a glass',
      'concentration difference',
      'perfume reaching the far corner',
      'spreading until it is uniform everywhere',
      'why sugar spreads through tea without a spoon',
    ],
  },

  briefing: {
    observable: [
      'Ink grains appear bunched in the middle of a tank of still water, and a row of bars below, sharing the tank’s own horizontal axis, counts how many grains stand in each vertical strip — at the start only the middle two or three strips rise.',
      'Faint dividing lines inside the tank show which strip each bar counts, and the bars are drawn in the same colour as the grains, because they are those grains counted.',
      'The peak collapses first and slowest: over a drawn-out stretch the middle bars come down while the bars beside them grow.',
      'One grain in the highlight colour is followed, and the short path trailing it doubles back and turns aside rather than heading outward, so the crowd’s spreading and the single grain’s aimlessness are on the screen together.',
      'The grains reach both ends of the tank and the bars pass through a low, broad hill on the way to being nearly flat.',
      'At the end the bars stand at about the same height — not exactly, since they are counts of a finite crowd — and the grains carry on walking: the evening out is not the walking having stopped.',
      'Everything fades and a fresh clump is dropped in the middle for the next round.',
      'Nothing is numbered anywhere: no count per strip, no measure of how far it has spread, no line drawn in advance at the level the bars will end up.',
    ],

    screen: {
      affordances: [
        'One round carries the ink from a clump, through the collapse of the peak, to a nearly level row of bars that keeps stirring within itself, and then drops a fresh clump; nothing has to be pressed.',
        'The first stretch after the drop runs slowly because that is where the peak falls apart — left at one pace the reader would arrive to find the tallest bar already halved.',
        'The bars are the grains on the screen counted strip by strip at that moment, not a smooth curve worked out separately, so a bar cannot disagree with what the tank shows.',
        'The highlight colour carries a single meaning, this one grain: only the followed grain and its recent path wear it, and the path keeps just the last stretch so the tank is not covered in scribble.',
      ],
    },

    useWhen: [
      'The article has said that a substance spreads out by itself with nothing stirring it, and the reader pictures a current carrying it. Watching one grain double back and turn aside while the bars nonetheless flatten is what shows there is no current to be found.',
      'The point being made is that the end state is not stillness — that once it is evenly shared the coming and going carries on and simply no longer changes anything.',
    ],

    avoidWhen: [
      'The subject is how far a wandering body gets from where it started, or how that distance depends on how long it has been wandering. Nothing here is measured from a starting point.',
      'The article is about why a single suspended particle jitters in the first place. What does the pushing is never drawn here; the grains are simply given as walking.',
      'The point is heat or matter carried along by a moving fluid — a current, a rising plume, something stirred. The water here never moves.',
      'The article turns on a gas that fills what it is given and never gathers itself back, or on the direction of time. Nothing is let loose from a compartment here, and the tank has no barrier.',
      'Values are wanted — how many grains, how fast it spreads, a coefficient. Nothing on the screen is written as a number.',
    ],

    contrastWith: [
      {
        concept: 'brownian-motion',
        note: 'One is about what a crowd amounts to when every member walks aimlessly; the other is about why any one of them walks aimlessly to begin with.',
      },
      {
        concept: 'random-walk',
        note: 'Both watch aimless stepping, but one asks how a substance ends up shared out and the other asks how far a single walker has got after a given number of steps.',
      },
      {
        concept: 'second-law-of-thermodynamics',
        note: 'One is about the difference in concentration being filled in until it is gone; the other is about the same spreading never running backwards, which is a claim about direction rather than about sharing.',
      },
      {
        concept: 'thermal-convection',
        note: 'One has the medium perfectly still and the spreading done entirely by the aimless walking of what is in it; the other has the medium itself travel and carry its load along.',
      },
    ],
  },
};
