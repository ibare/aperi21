/**
 * statistical-fluctuation 개념 선언.
 *
 * 위험한 짝 — `maxwells-demon` 과 섞으면 둘 다 「확률과 2법칙」 으로 수렴한다.
 * **주어와 주장을 갈랐다.**
 *   statistical-fluctuation  주어 = **이미 고른 것의 흔들림**. 주장 = 입자 수가 늘면 흔들림이 준다
 *   maxwells-demon           주어 = **문을 지키는 이**. 주장 = 가를 수는 있으나 재고 적는 일이 따라붙는다
 * 이쪽만 「N 이 작다 · 널뛴다 · 50% 선」 어휘를 갖는다. 퍼지는 과정 · 속력 분포는 없다.
 *
 * `random-walk` 와도 갈랐다 — 저쪽은 걸음 수가 늘면 거리가 늘고, 이쪽은 입자 수가 늘면
 * 흔들림이 준다. 재는 양이 다르다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const statisticalFluctuationConcept: Aperi21ConceptSource = {
  id: 'statistical-fluctuation',
  label: 'Statistical Fluctuation and the Size of the Crowd',
  canonicalSim: 'aperi21:statistical-fluctuation',

  surface: {
    definition:
      'The wobble left over in a quantity that is already evenly shared, wide when only a handful of particles are involved and narrowing toward nothing as their number grows large.',
    exemplarKeywords: [
      'statistical fluctuation',
      'why small samples are noisy',
      'how many molecules before an average settles down',
      'roughly half on each side, but only roughly',
      'a gas of ten molecules is not smooth at all',
      'departures from the even share',
      'random wobble around the mean',
      'why thermodynamics needs huge numbers',
      'noise shrinks as the count rises',
      'the average is steady only because there are so many',
    ],
  },

  briefing: {
    observable: [
      'Three boxes are stacked on the left holding ten, a hundred and a thousand particles, and in every one of them the particles are already evenly spread and moving from the first moment — nothing is being let loose or filling up.',
      'A single graph beside them traces, for each box, the share of its particles that happens to lie left of the box’s dashed midline, so all three are read against one and the same fifty-per-cent line.',
      'The curve for ten particles leaps far above and far below that line, ranging between roughly a tenth and four fifths; the curve for a hundred keeps to a narrower band; the curve for a thousand lies almost on the line throughout.',
      'The three curves are told apart by the style of the line rather than by colour — the wildest one solid so its leaps stay unbroken, the flattest one dotted and thickened enough not to vanish into the midline.',
      'Each curve carries its count at its head, preceded by a short sample of its own line style, so that when the three heads crowd together near the middle there is still no doubt which is which.',
      'The only percentages written are the three marks on the axis; the value at this instant is never written out, because the height of the curve’s head is that value.',
      'The particles in the crowded box are drawn as smaller dots than those in the sparse one, so that a thousand of them do not merge into a solid block, and all three boxes use the same colour.',
      'The curves grow across the panel as the round goes on and then fade, and the next round draws them afresh.',
    ],

    screen: {
      affordances: [
        'One round has the three boxes moving and the three curves growing together, with the longest stretch given to the comparison, since what has to be seen is the width the curves have built up; nothing has to be pressed.',
        'Putting all three on one axis is what makes the comparison possible — the eye judges three widths about one line instead of measuring three separate panels against each other.',
        'The highlight colour carries a single meaning, the share at this instant: only the moving head of each curve wears it.',
        'The particles never collide with one another and bounce only off the walls, which is enough, because what is being claimed concerns how many happen to be on one side, not what they do to each other.',
      ],
    },

    useWhen: [
      'The article has said that the laws of heat hold only because the numbers involved are enormous, and the reader has no sense of what few would look like. Three curves on one axis, one leaping and one lying flat, is what puts a size to the claim.',
      'The point being made is that an evenly shared state is not a motionless one — that the even share is what it hovers around rather than what it sits at — and the thousand-particle curve is flat without ever being exactly on the line.',
    ],

    avoidWhen: [
      'The article is about a gas released into an empty space and filling it, or about something that spreads and never comes back. All three boxes here start evenly filled and stay that way.',
      'The subject is how molecular speeds are spread over a range, or how that range changes with warming. Nothing here sorts or counts particles by speed.',
      'The point is how far aimless stepping carries a body from where it began. Nothing is measured from a starting position here.',
      'The article is about error in a measurement, or the accuracy of an instrument. What wobbles here is the thing itself, not the reading taken of it.',
      'Figures are wanted — a standard deviation, a formula for how the wobble falls with the count. The only numbers on the screen are the three particle counts and the axis marks.',
    ],

    contrastWith: [
      {
        concept: 'random-walk',
        note: 'Both hinge on the same square root, pointing opposite ways: more steps take a walker further from the start, while more particles pull a share closer to its average.',
      },
      {
        concept: 'second-law-of-thermodynamics',
        note: 'One accepts the even share as already reached and asks how tightly it is held; the other asks how a lopsided start gets to that share and why it does not go back.',
      },
      {
        concept: 'maxwells-demon',
        note: 'One says that chance alone keeps producing small departures from the even share, larger the fewer the particles; the other asks whether a departure could be produced on purpose, and what that costs.',
      },
      {
        concept: 'kinetic-theory-of-gases',
        note: 'One is about the steady push that emerges when enough molecular events are added together; the other is about how far from steady that sum still is when there are not enough of them.',
      },
    ],
  },
};
