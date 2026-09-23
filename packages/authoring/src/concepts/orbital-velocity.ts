/**
 * orbital-velocity 개념 선언.
 *
 * 궤도 넷 중 하나. **네 주장을 각각 다른 것에 건다.**
 *   orbital-velocity  **속도를 바꿔 본다** — 다섯 자취가 한 그림에 쌓이고 원은 그중 하나뿐이다
 *   circular-orbit    속도를 바꾸지 않는다 — **왜 떨어지지 않는가**(직각 · 유령 · 끌어내림)
 *   elliptical-orbit  속도가 아니라 **빈 초점을 벌린다** — 원이 길쭉해진다
 *   keplers-first-law 모양은 이미 타원 — **중심 천체가 어디 앉는가**와 거리 합
 * 이쪽만 「대포 · 모자라면 떨어진다 · 넘치면 벗어난다 · 배수 · 딱 한 속도」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const orbitalVelocityConcept: Aperi21ConceptSource = {
  id: 'orbital-velocity',
  label: 'The One Sideways Speed That Closes a Circle',
  canonicalSim: 'aperi21:orbital-velocity',

  surface: {
    definition:
      'Of all the speeds a body can be given sideways from one height, exactly one brings it round to where it began at the same height: slower ones reach the ground, slightly faster ones bulge outward, and far faster ones never close.',
    exemplarKeywords: [
      'orbital speed',
      'Newton’s cannonball',
      'how fast must a satellite travel',
      'why does the speed have to be just right',
      'too slow and it falls, too fast and it leaves',
      'fire it sideways from a mountain top',
      'speed needed to stay up',
      'what happens if a satellite goes slightly faster',
      'first cosmic velocity',
      'only one speed gives a circle',
    ],
  },

  briefing: {
    observable: [
      'A planet fills the middle of the picture with a tall mountain standing on top of it, and every shot is fired sideways from that same summit.',
      'Five shots go off in turn, each with an arrow at the summit whose length is the speed given, and a figure at its tip saying how many times the circular speed that is.',
      'The slowest shot curves down and strikes the ground almost at once; the next, only a little faster, comes down much further round the planet.',
      'The middle shot never reaches the ground: it holds the same height all the way round and closes on itself as a circle.',
      'The shot just above it swings out beyond that circle into a bulging closed path and comes back to the summit, which is its nearest point.',
      'The shot below the circle and the shot above it run close on either side of it, so that a small departure from the one speed is already not a circle.',
      'The fastest shot draws a path that never comes back and leaves by the right-hand edge.',
      'While one shot is in flight the earlier paths are faded, and at the end all five stand together at equal strength in a single picture — two arcs into the ground, the circle, the bulge around it, and the open curve leaving the frame.',
      'Speeds are written as multiples of the circular speed and never in kilometres per second, and the figure for a shot appears once its projectile has reached the place where it stands.',
      'No arrow rides with the projectile after launch, so nothing is claimed about speeding up and slowing down along the way.',
      'All five run and repeat by themselves.',
    ],

    screen: {
      affordances: [
        'The five shots happen in order and then begin again; nothing has to be pressed.',
        'The paths accumulate rather than replacing one another, so that the circle being one case among five is a thing on the screen rather than a thing remembered.',
        'The circle is never drawn in advance — it appears only as the track a projectile has left, so a closed circle is an outcome and not a guide.',
        'All five shots share one screen-time scale, so a faster shot is also visibly faster; this is what lets their speeds be compared with one another.',
        'The mountain is drawn far taller than any real one, which is why the speeds are labelled as multiples rather than in real units.',
        'No accent colour is used, so which path is the circle is told by its shape and not by its colour.',
      ],
    },

    useWhen: [
      'The article gives a figure for orbital speed and the reader takes it as "fast enough to stay up", as though anything faster would also do. The bulging path just above the circle, and the open one further up, is what shows faster to be a different outcome and not a safer one.',
      'The prose is building the argument from a cannon on a mountain and needs the whole family of outcomes — striking the ground, circling, bulging, leaving — in a single accumulated picture.',
    ],

    avoidWhen: [
      'The question is why an orbiting body does not fall in the first place, or what keeps turning it. No force arrows follow the projectiles here; what changes between shots is only the launch speed.',
      'The launch in the article is straight up and the issue is whether it returns. Every shot here goes sideways and four of the five come back round or down.',
      'The subject is how stretched an orbit is, or where the central body sits inside it. The bulging path is one shot among five, and nothing here marks foci or measures elongation.',
      'The article needs a real speed in kilometres per second, or a value computed for a given altitude. Speeds are written only as multiples of the circular one.',
      'The point is that an orbiting body speeds up when it comes close and slows when far. Nothing here reports the speed anywhere except at the moment of firing.',
      'What is wanted is the energy view — a well, a sign, a bound or unbound total. Nothing here is drawn as energy.',
    ],

    contrastWith: [
      {
        concept: 'circular-orbit',
        note: 'One varies the speed and finds that only one value closes a circle; the other fixes that value and asks why a steady pull produces a circle instead of a fall.',
      },
      {
        concept: 'escape-velocity',
        note: 'Both find that a path stops coming back past some speed, but one fires sideways and is about what shape the path takes, while the other fires straight out and is about whether the body returns at all.',
      },
      {
        concept: 'elliptical-orbit',
        note: 'One gets a stretched path by launching a little too fast from a fixed point; the other takes the stretching itself as the subject and changes it directly, with the launch never mentioned.',
      },
      {
        concept: 'projectile-motion',
        note: 'One lets the ground curve away beneath the flight so that the fall can miss; the other keeps the ground flat and the pull constant, which is what makes every flight land.',
      },
    ],
  },
};
