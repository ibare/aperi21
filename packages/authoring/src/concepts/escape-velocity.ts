/**
 * escape-velocity 개념 선언.
 *
 * 위험한 형제는 `gravitational-potential-energy-general` 이다 — 둘 다 무한대 기준을 말한다.
 * **주어를 갈랐다.**
 *   escape-velocity                         **쏜 속도** — 같은 몫씩 올리는데 꼭대기 간격이 벌어지다 어느 값부터 안 돌아온다
 *   gravitational-potential-energy-general  **가로선의 부호** — 0 아래면 우물 벽에 닿고 위면 안 닿는다
 * 이쪽만 「곧장 위 · km/s · 문턱 · 돌아오지 않는다 · 중력이 줄지 않는다면」 어휘를 갖고,
 * 「음수 · 우물 · 0 을 무한대에」 는 저쪽에 둔다. 옆으로 쏘는 것은 `orbital-velocity` 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const escapeVelocityConcept: Aperi21ConceptSource = {
  id: 'escape-velocity',
  label: 'The Launch Speed Past Which a Body Never Returns',
  canonicalSim: 'aperi21:escape-velocity',

  surface: {
    definition:
      'Raising in equal steps the speed at which a body is sent straight upward buys heights that open out ever further apart, until past one speed it goes on slowing without ever stopping and does not come back.',
    exemplarKeywords: [
      'escape velocity',
      'eleven point two kilometres per second',
      'how fast do you have to go to leave Earth',
      'minimum speed to escape gravity',
      'why is there a cut-off speed at all',
      'throw it hard enough and it never comes down',
      'what goes up must come down, except',
      'launching straight up from a planet',
      'speed needed to break free of a planet',
      'escaping the pull without any more thrust',
    ],
  },

  briefing: {
    observable: [
      'A planet sits at the left and straight up away from it is drawn as rightward across the picture, so the flights run sideways along two parallel lanes.',
      'The upper lane is the real thing; the lower lane is the same launch under a pull that never weakens, and it is named as such and drawn in grey.',
      'Five launches follow one another at seven, eight, nine, ten and then eleven point two kilometres per second, each figure written beside the body that carries it.',
      'In the upper lane the body wears an arrow ahead of it whose length is its speed, so the arrow shortens as it climbs.',
      'For the first four launches the arrow vanishes at the top of the flight, the body turns, the arrow comes back reversed, and a tick mark with the launch figure is left standing at the height reached.',
      'The four ticks are for speeds raised by the same step each time, and the gaps between them widen sharply — the gap from the fourth to the fifth is longer than everything before it.',
      'On the last launch the arrow shortens but never disappears, and the body carries it off the right-hand edge with no tick left behind; the trail simply runs to the edge of the picture and the figure stands at the end of it.',
      'After that launch the upper lane is empty, with only the trail and the ticks remaining.',
      'In the lower lane every one of the five, including the fastest, tops out within a narrow band of heights close to the planet and comes back to rest on the surface.',
      'No figure for the present speed is shown at any moment; the only numbers are the five launch speeds written on the bodies and at the ticks.',
      'The five launches run and repeat by themselves.',
    ],

    screen: {
      affordances: [
        'The five launches happen in order and then begin again; nothing has to be pressed.',
        'Each launch leaves its tick and its figure behind, so by the fourth the widening of the gaps is there to be looked at rather than remembered.',
        'The two lanes share a launch and a clock within each shot, so the comparison lane is not a separate story but the same shot under a different assumption.',
        'The screen time is compressed differently for each launch, since the real flights differ by hours; heights are to be compared across shots, durations are not.',
        'The last figure is the escape speed for this planet, chosen as the value that just crosses, and the escape speed is nowhere computed or printed separately from it.',
        'No accent colour is used, so the launch that gets away is told by its leaving the picture and not by a change of colour.',
        'Speed is carried by the length of the arrow alone, which is what lets slowing without stopping be seen.',
      ],
    },

    useWhen: [
      'The article has given a threshold speed and the reader hears it as merely a very large number — throw harder, go higher, nothing special about any one value. The ticks pulling apart and then a flight with no tick at all is what turns the quantity into a boundary.',
      'The prose needs the threshold to be attributed to the pull weakening with height, and wants the case where it does not weaken standing alongside to show that no such speed exists there.',
    ],

    avoidWhen: [
      'The launch in the article is sideways and the outcome is an orbit. Everything here goes straight out from the planet and nothing ever circles.',
      'The subject is the sign of an energy, a well drawn below a zero line, or the convention that puts the zero infinitely far away. No energies appear; what is shown is speed and height.',
      'The article deals with a rocket under thrust, staging or fuel. Each body here is given all its speed at the instant of launch and is left alone thereafter.',
      'The point is the ordinary rule that height goes as the square of the launch speed. That case is the grey lane, which is present only as the foil.',
      'What is needed is a formula, a derivation from energy, or escape speeds for several bodies compared. One planet is used, and the only figures are five launch speeds.',
      'The article is about something crossing a horizon from which even light cannot return. The fastest launch here leaves freely; nothing is trapped.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-potential-energy-general',
        note: 'One finds the dividing case by trying launch speeds until one of them does not come back; the other states the same division as a sign — a total below the zero at infinity, or above it.',
      },
      {
        concept: 'orbital-velocity',
        note: 'One sends the body straight out and asks whether it returns; the other sends it sideways at one height and asks what shape its path closes into.',
      },
      {
        concept: 'vertical-throw',
        note: 'One is the case where the pull fades with height, so that the rise can fail to end; the other is the everyday case where it does not, and the going up and the coming down mirror each other exactly.',
      },
      {
        concept: 'terminal-velocity',
        note: 'Both name a speed that acts as a limit, but one is a launch value past which the motion never ends, and the other is a value the motion settles into and cannot pass.',
      },
    ],
  },
};
