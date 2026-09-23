/**
 * stellar-luminosity 개념 선언.
 *
 * 밝기 넷 중 하나. 이쪽만 **방향이 거꾸로다** — 받은 것에서 낸 것을 되짚는다.
 *   stellar-luminosity   같아 보이는 두 별 → 깔았다가 되모으면 **아홉 배**가 드러난다
 *   apparent-brightness  한 별이 거리마다 **얼마나 옅어지는가**
 *   inverse-square-law   퍼짐 자체의 기하 — 왜 제곱인가
 *   magnitude-scale      보이는 밝기에 **수를 매기는** 방식
 * 이쪽만 두 별 · 되모음 · 「받은 것은 같고 낸 것이 다르다」 어휘를 갖는다. 칸 · 창 ·
 * 등급이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stellarLuminosityConcept: Aperi21ConceptSource = {
  id: 'stellar-luminosity',
  label: 'Luminosity Recovered from Apparent Brightness and Distance',
  canonicalSim: 'aperi21:stellar-luminosity',

  surface: {
    definition:
      'The total output of a star, recovered by taking what an observer receives and laying it over the whole shell that the star’s remoteness defines.',
    exemplarKeywords: [
      'luminosity of a star',
      'how much light a star really gives off',
      'two stars that look equally bright are not the same star',
      'absolute versus apparent brightness',
      'working back from what we receive to what is emitted',
      'solar luminosities',
      'a faint nearby star and a blazing distant one',
      'intrinsic brightness of a star',
      'is it dim or is it just far',
      'the standard-candle idea',
    ],
  },

  briefing: {
    observable: [
      'On a sky panel two stars are drawn the same size and carrying the same amount of light, so on that panel they cannot be told apart.',
      'A side view beside it lays the same two stars, with Earth between them, along a single line, and a small patch on either side of Earth shows what each star delivers — the two patches are identically lit.',
      'A measuring line then appears under each star and states its remoteness in light years; the two figures differ by a factor of three.',
      'A dashed shell is drawn around each star through Earth, and from Earth it fills round in both directions with exactly the brightness of that star’s patch — the farther star’s shell is far wider and fills to the same level.',
      'The two filled shells then shrink back toward their stars and brighten as they shrink, stopping when the light in them is packed full.',
      'At that point the disc gathered from the far star covers nine times the area of the one gathered from the near star, and a tag over each names its output against the Sun.',
      'The patches beside Earth are left untouched throughout, so what was received stays equal while what was gathered comes out unequal.',
      'The sky panel is still showing two identical stars at the moment the tags appear, which is the line the closing caption takes.',
      'Both stars are drawn in the same colourless light, so nothing but the amount is available to compare.',
    ],

    screen: {
      affordances: [
        'The remoteness, the laying out, the gathering and the reveal run in that order on their own and then start again.',
        'Both panels are dark behind the light, so a fully lit disc still reads as light rather than as a dark blot.',
        'The shells are drawn as filled discs whose area grows in step with the area of a real shell, so that area times brightness stands for an amount of light on screen.',
        'What each star delivers is worked out from its declared output and remoteness rather than typed in, so a set of figures that broke the relation would show up on the sky panel as two unequal stars.',
        'The only numbers written are the two remoteness figures and the two output figures; the ratios between them are left to the lengths and areas.',
        'Nothing names an amount of light in physical units and no equation is shown.',
      ],
    },

    useWhen: [
      'The article separates how bright a star looks from what it actually produces, and the reader keeps collapsing the two. Watching identical patches gather into discs of nine to one is what pries them apart.',
      'A reader is ready to accept that remoteness matters but has no sense of how a measurement is turned back into a property of the object itself.',
    ],

    avoidWhen: [
      'The point is that one star gets fainter as it recedes. Neither star here moves and neither changes; what varies is which star is being looked at.',
      'The article needs the geometric reason that the weakening carries an exponent of two. That reason is used here, not argued for.',
      'A rank on the astronomers’ numbering scale, whether the seen kind or the standardised kind, is what the text works in. No such number appears.',
      'The size, surface conditions or colour of a star are involved. The gathered disc stands for an amount of light and not for how large the star is, and both stars are given the same neutral tone.',
      'The reader should set the separation themselves and see what follows. Holding the two stars equal in the sky requires their outputs to move with it, which would leave it unclear what had been changed.',
      'The text works with a measured flux and an equation relating it to output. Nothing here is written as a formula.',
    ],

    contrastWith: [
      {
        concept: 'apparent-brightness',
        note: 'One asks what a body must be producing given a reading and a remoteness; the other asks what reading a given body produces at each remoteness. Same relation, opposite unknown.',
      },
      {
        concept: 'inverse-square-law',
        note: 'One uses the spreading as a tool to undo a measurement; the other puts the spreading itself on trial and shows where its exponent comes from.',
      },
      {
        concept: 'magnitude-scale',
        note: 'One is about the quantity a star owns wherever it is seen from; the other is about a notation applied to how bright it happens to look.',
      },
      {
        concept: 'hr-diagram',
        note: 'One establishes the quantity for a single object; the other takes it as already known for a thousand of them and asks what shape they make together.',
      },
    ],
  },
};
