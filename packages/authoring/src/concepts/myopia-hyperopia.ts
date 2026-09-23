/**
 * myopia-hyperopia 개념 선언.
 *
 * 눈 둘 가운데 **눈알이 잘못된 길이라 안경이 필요한** 쪽이다. 짝과는 「무엇이 바뀌느냐」 로 갈랐다.
 *   myopia-hyperopia         수정체는 그대로 · **눈알 길이**가 다르다 — 상이 망막 앞 · 뒤, 안경이 옮긴다
 *   human-eye-accommodation  눈알 길이는 그대로 · **수정체 두께**가 바뀐다 — 정상 눈이 스스로 맞춘다
 * 이쪽만 긴 눈 ↔ 짧은 눈 · 오목 안경 ↔ 볼록 안경 · 망막 앞 ↔ 뒤 어휘를 갖는다.
 * 조절 · 두꺼워짐 · 17 mm 치수선은 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const myopiaHyperopiaConcept: Aperi21ConceptSource = {
  id: 'myopia-hyperopia',
  label: 'Eyes That Focus Short or Long, and Their Glasses',
  canonicalSim: 'aperi21:myopia-hyperopia',

  surface: {
    definition:
      'Why an eyeball of the wrong length puts light in front of or behind the retina, and how a lens thin or thick in the middle, held before it, slides that place onto the retina.',
    exemplarKeywords: [
      'short sight and long sight',
      'myopia and hyperopia',
      'near-sighted and far-sighted',
      'why do I need glasses',
      'the image forms in front of the retina',
      'a concave lens corrects short sight',
      'a convex lens corrects long sight',
      'the eyeball is too long',
      'blurred vision at a distance',
      'what a prescription lens actually does',
      'spectacles move the focus onto the retina',
    ],
  },

  briefing: {
    observable: [
      'One eye is drawn in cross-section at a time, and the picture shows two of them in turn, with the same lens in both. What differs is the shape of the eyeball — one stretched long from front to back, the other short.',
      'In the long eye, parallel light from far away is gathered at a filled point that stands well short of the retina; past that point the beams open out again and land on the retina as a wide smear.',
      'A lens thin in the middle then appears in front of that eye. The arriving light is made to spread a little before it enters, the gathering point slides back toward the retina, and the smear closes up.',
      'When it settles, the light meets at a single filled point on the retina itself and there is no smear left.',
      'The short eye then takes its place, and light from a book twenty-five centimetres away arrives spreading apart.',
      'That light reaches the retina before it has gathered, leaving a smear again; dashed lines continued past the retina draw together at a hollow point outside the back of the eye.',
      'A lens thick in the middle then appears in front of that eye. The dashed lines shorten, the hollow point moves forward toward the retina, and the smear narrows.',
      'When it settles, the light meets at a filled point on the retina, with no dashed lines and no smear.',
      'A point where light has really gathered is drawn filled, and one where only the continued lines meet is drawn hollow, so the two ways of missing the retina are told apart at sight.',
      'Only one retina is drawn in each half, so front, behind and on are read against that one arc rather than against a second, healthy eye laid over it.',
    ],

    screen: {
      affordances: [
        'The two eyes take turns in a fixed round, each going uncorrected and then corrected, with nothing to press.',
        'Each beam is followed through the spectacle lens and then through the eye’s own lens, so where the light gathers is a consequence of the pair rather than a point placed by hand.',
        'The spectacle lens gains its strength as it appears rather than being slid in from the side, which is what turns correction into the gathering point sliding onto the retina.',
        'The two eyes are told apart by the width of the eyeball and by what is named, and the two kinds of arriving light by whether the beams are parallel or spreading, rather than by colour.',
        'The difference in eyeball length is drawn larger than life, as is the spread of the near light, since at true scale neither would be visible.',
        'No focal lengths or strengths are written anywhere, because what the picture measures is not a distance but which side of the retina the light is on.',
        'The screen opens with the long eye already gathering its light short of the retina.',
      ],
    },

    useWhen: [
      'The article has stated the rule that short sight focuses in front of the retina and long sight behind it, and the reader can recite it without picturing it. Here both are drawn against the same retina, one after the other, with the eyeball shape as the visible difference.',
      'The point being made is what a prescription lens actually does, rather than that it "corrects" something. The gathering point can be watched sliding onto the retina as the glass takes effect, in one direction for one eye and the other for the other.',
      'The reader wonders why one condition needs a lens thin in the middle and the other a lens thick in the middle. The two appear in the same round, each in front of the eye that needs it, and the light is made to spread a little or to close a little before entering.',
    ],

    avoidWhen: [
      'The eye in the article is sound, and the subject is how it focuses on things at different distances by itself. Neither eye here can do that; the lens inside them never changes.',
      'The article wants a prescription in dioptres, a far point or near point in figures, or the real difference in eyeball length. No numbers of that kind are on screen, and the lengths shown are drawn larger than life.',
      'The subject is astigmatism, cataract, colour blindness or any condition other than the eye being too long or too short. Only those two are drawn.',
      'The point is the parts of the eye — the cornea, the pupil, the muscle around the lens. The eye here is reduced to one bending surface and a retina.',
      'The article is about contact lenses, surgery, or how a prescription is arrived at. What is shown is a piece of glass held in front of the eye and what it does to the light.',
      'The subject is the image itself — its size, its way up, or whether it could be caught on a screen. Nothing here follows more than the light of a single point.',
    ],

    contrastWith: [
      {
        concept: 'human-eye-accommodation',
        note: 'Both ask whether light lands on the retina; one has an eye of the wrong length that cannot manage it and needs glass in front, the other has a sound eye changing its own lens to manage it.',
      },
      {
        concept: 'lens-combination',
        note: 'Both put a second lens in the path of a first; one is interested in the eye being put right and keeps the retina as its measure, the other in how the strengths of two touching lenses combine.',
      },
      {
        concept: 'real-vs-virtual-image',
        note: 'Both distinguish a place light truly reaches from one that only the continued lines agree on; one uses the difference to say how an eye is failing, the other to say what an image is.',
      },
    ],
  },
};
