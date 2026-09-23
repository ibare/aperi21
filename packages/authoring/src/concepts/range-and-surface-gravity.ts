/**
 * range-and-surface-gravity 개념 선언.
 *
 * 「무엇이 사거리를 바꾸는가」 를 다루는 셋 중 **하늘의 중력**이 이쪽 몫이다. 셋은
 * 고정해 두는 것으로 갈린다 —
 *   range-and-surface-gravity   표면 중력만 바꾼다 (각도 · 속력은 그대로)
 *   projectile-range            쏘는 각도만 바꾼다 (속력 · 중력 · 공기는 그대로)
 *   projectile-in-wind          공기의 움직임만 바꾼다 (각도 · 중력은 그대로)
 * 이쪽만 두 하늘 · 표면 중력의 값 · 떠 있는 시간 어휘를 갖는다. 가로 속력이 두
 * 하늘에서 같다는 것이 이 개념의 논거이지 주장이 아니다 — 주장은 **떠 있는 시간**이
 * 사거리를 가른다는 것이다.
 *
 * 화면에 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const rangeAndSurfaceGravityConcept: Aperi21ConceptSource = {
  id: 'range-and-surface-gravity',
  label: 'Range and Surface Gravity',
  canonicalSim: 'aperi21:range-and-surface-gravity',

  surface: {
    definition:
      'How far one and the same launch carries on worlds of different surface gravity, the sideways speed being unchanged and a weaker pull keeping the body up longer, so the reach grows.',
    exemplarKeywords: [
      'range on the Moon compared with Earth',
      'surface gravity and how far you can throw',
      'golf shot on the Moon',
      'why things go further where gravity is weak',
      'hang time depends on gravity',
      'g equals 1.62 on the Moon',
      'same throw on a smaller planet',
      'low gravity long jump',
      'six times as far',
      'how gravity changes the distance of a throw',
    ],
  },

  briefing: {
    observable: [
      'Two grounds are stacked, one above the other, each with its own sky and its own launch point at the same place along the ground. The upper one is named Earth and carries g = 9.8 m/s² beside its name, the lower one Moon with g = 1.62 m/s².',
      'At each launch point stands a launch arrow with a small sector marking its angle, and the two arrows are the same length at the same angle — the one thing that differs between the two skies is the number written beside the name.',
      'Both balls leave at the same moment, drawn in the same ink and flying paths drawn in the same colour, so the two skies are told apart by their names rather than by colour.',
      'Along each ground a band in the accent colour grows to show how far across the ball has come so far, and while both are flying the two band ends stay level with each other — the sideways speed is the same in both skies.',
      'Tick lines run vertically through both grounds and turn them into one ruler. A cell is the distance the Earth throw covers, and the ticks are named R, 2R, up to 6R.',
      'The Earth ball lands on the first tick; its mark is left there and its band stops growing at one cell. The Moon ball is still in the air and keeps dragging its band on, so a stopped band and a growing band lie one above the other.',
      'The Moon ball comes down just past the sixth tick, leaving its own mark, and the closing picture holds a one cell band against a six cell band, a small arc against a large one, on the same ruler.',
      'The closing line says the Moon ball landed past that many cells, with the count taken from what the screen was set up with, and adds that both moved sideways at the same speed.',
      'The Moon arc rises far higher as well as reaching further, since the same upward launch is pulled back much more gently.',
    ],

    screen: {
      affordances: [
        'The cycle runs and repeats on its own — both balls flying, the Earth ball landing, the Moon ball flying on alone, the finished picture held to be read, and a fade back to the launch.',
        'Both flight stretches run at the same rate, so the Moon ball does not appear to speed up at the moment the Earth ball lands; the whole difference is left to be read as time spent in the air.',
        'The screen is arrived at with both balls already in the air, the Earth one coming down off its peak and the Moon one still rising.',
        'The two flights are laid out one above the other and share one ruler, so the comparison is made by counting cells across rather than by remembering a previous run.',
      ],
    },

    useWhen: [
      'The article says a throw carries further where gravity is weaker and needs the reason to be visible: not a faster ball, but a ball that stays up longer. The stopped band beside the growing band is that reason.',
      'A claim is being made about a named world — the Moon against the Earth — and the two are wanted side by side with the strengths of gravity written on them.',
      'The reader is to be held to one launch while the world beneath it is changed, so that nothing about the aim or the throw can be blamed for the difference in reach.',
    ],

    avoidWhen: [
      'The point is which angle throws furthest, or that two aims can reach the same distance. The angle is one fixed value in both skies and it is not the forty five degrees such an article would want to talk about.',
      'The article is about air, wind or resistance. Both flights here are through nothing at all, and the two arcs are exact mirrors.',
      'How far, how high or how long are wanted as figures. The only numbers written are the two strengths of gravity and the cell names on the ruler; the reach is counted in cells.',
      'The subject is gravity as a force varying with distance from a mass, or as something that falls off above a surface. Each sky here has one strength that never changes during a flight.',
      'The article is about whether heavy and light bodies fall alike. One ball flies in each sky and no weight is written on either.',
      'A world with no gravity at all is wanted, or a body that never comes back down. Both flights land, and landing is what the whole comparison is made of.',
    ],

    contrastWith: [
      {
        concept: 'projectile-range',
        note: 'Both ask what sets how far a launch carries. One holds the aim and varies the gravity of the world; the other holds the world and varies the aim.',
      },
      {
        concept: 'projectile-in-wind',
        note: 'One changes the world a flight happens in from beneath, by how hard it pulls; the other leaves the pull alone and changes what the air around the flight is doing.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One treats the strength of gravity as a property of a world, read off how far a throw carries there; the other holds it at one value and reads it off how a single velocity changes from instant to instant.',
      },
      {
        concept: 'free-fall',
        note: 'One says a weaker pull lets the same launch travel further; the other says that, whatever the pull is, it makes no difference how heavy the body it acts on happens to be.',
      },
      {
        concept: 'gravitational-field',
        note: 'One takes the pull at a surface as a single number that decides how long a flight lasts there; the other takes it as an arrow assigned to every place around a mass, longer near it and shorter far out.',
      },
    ],
  },
};
