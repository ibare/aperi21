/**
 * huygens-principle 개념 선언.
 *
 * `wavefront-and-ray` 와 짝. 둘 다 파면이 주어라 **주장으로 갈랐다.**
 *   wavefront-and-ray  파면과 진행선의 **관계** — 어느 거리에서나 직각
 *   huygens-principle  다음 파면의 **출처** — 지금 파면 위 점마다 낸 동그란 파의 겹침
 * 이쪽만 점 수를 늘려 간다(1 → 33) · 울퉁불퉁 → 곧게 · 새 파원 어휘를 갖는다.
 *
 * `interference` 도 여러 파원의 겹침을 보이나 저쪽은 파원 **둘**이 만드는 **잠잠한 줄**이고
 * 이쪽은 점 **여럿**이 만드는 **하나의 곧은 파면**이다 — 결과가 무늬인가 파면인가로 갈린다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const huygensPrincipleConcept: Aperi21ConceptSource = {
  id: 'huygens-principle',
  label: 'Huygens’ Principle — Wavelets Making the Next Front',
  canonicalSim: 'aperi21:huygens-principle',

  surface: {
    definition:
      'The rule that every point of a wavefront behaves as a source of its own circular wavelet, and that the crowded wavelets together make up the front a moment later.',
    exemplarKeywords: [
      'Huygens’ principle',
      'secondary wavelets',
      'every point on a wavefront is a new source',
      'how does a wavefront know where to go next',
      'the envelope of the wavelets',
      'Huygens construction',
      'circular wavelets adding into a straight front',
      'a row of point sources on a front',
      'why a flat wave stays flat',
      'wavelets from a wavefront',
    ],
  },

  briefing: {
    observable: [
      'A flat wave comes in from the left, and a faint upright line marks the place its front has reached.',
      'To the right of that line the picture is the sum of circular waves put out by points sitting on the line itself, so everything on that side comes from those points and from nothing else.',
      'The round begins with a single point. One set of circular ripples spreads from it and the whole right-hand side is plainly round — no front has been made.',
      'The number of points then climbs to three, five and nine. The circles overlap and something front-like appears ahead of them, but it stays visibly scalloped, bulging between the points.',
      'At seventeen points the overlapping has straightened out into a flat front that travels away, and at thirty-three it is flat and clean, matching the wave that came in from the left.',
      'The points appear in a fixed order — the middle one first, then the far ends, then filling in between — so each new count is the previous one with points added rather than a fresh arrangement.',
      'The count then drops back to a single point, the straight front moves off on its own, and only the one set of circular ripples is left behind.',
      'The one line of text names the current count of points and says whether the front is still bumpy or has come out flat.',
      'The points are the only thing picked out in colour; the ripples on both sides are shaded in a single tone that deepens with how far the surface is from flat.',
      'No curve is drawn around the outsides of the circles, and nothing is numbered — no wavelength, no spacing, no speed.',
    ],

    screen: {
      affordances: [
        'The round runs by itself, the count of points climbing and then collapsing back to one; nothing has to be pressed.',
        'The right-hand side is worked out from the points as they stand, so the front that appears cannot disagree with the wavelets it is supposed to come from.',
        'Each wavelet is put out weaker the further it has spread and is given a leading edge, so a wavelet has a definite front of its own and the construction is not a set of static circles.',
        'The spacing of the points is what changes, not the wavelength, so the count at which the scalloping disappears can be read as a comparison between spacing and wavelength.',
        'The incoming flat wave on the left is kept on screen throughout, which is what lets the built front on the right be compared with the one it is supposed to reproduce.',
        'One colour is spent on the points alone; everything else is the water.',
      ],
    },

    useWhen: [
      'The article has stated the principle as a rule to accept — that each point of a front is a new source — and the reader cannot see how a crowd of circles would ever come out straight. Watching the scalloping shrink as the count climbs from three to thirty-three is what supplies the missing step.',
      'The point being made is that this is a construction rather than a description: the next front is worked out from the present one. Beginning with a single point, so that no front exists at all, is what makes the construction visible as construction.',
    ],

    avoidWhen: [
      'The article uses the principle to explain bending at a boundary or spreading past an edge. Nothing here obstructs or slows the wave — the flat front is built in an open, uniform surface.',
      'The subject is the geometry between a front and the direction it travels in. No line of travel is drawn here, and no angle is marked anywhere.',
      'The article is about two separated sources and the standing pattern they set up between them. The points here sit in a row along one front and their business is to make a single front.',
      'The claim turns on where the outer boundary of the wavelets lies as a curve. No such curve is drawn; the front appears as the place the overlapping wavelets reinforce.',
      'Values are wanted — wavelength, spacing, speed. Only the count of points is ever named.',
    ],

    contrastWith: [
      {
        concept: 'wavefront-and-ray',
        note: 'Both take a wavefront as the subject, for different questions — one states where the next front comes from at all, the other states the fixed geometry between a front and the direction it advances in.',
      },
      {
        concept: 'interference',
        note: 'Both add up waves from several points, toward opposite ends — one has many points close together conspiring into a single clean front, the other has two far apart leaving lines where nothing happens.',
      },
      {
        concept: 'superposition',
        note: 'One is the rule being used — waves from many places added at every point — and the other is that rule being established, with two waves whose meeting and parting can be watched one at a time.',
      },
    ],
  },
};
