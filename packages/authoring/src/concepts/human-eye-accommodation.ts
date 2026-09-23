/**
 * human-eye-accommodation 개념 선언.
 *
 * 눈 둘 가운데 **정상 눈이 스스로 바꾸는 것**을 말하는 쪽이다. 짝과는 「무엇이 바뀌느냐」 로 갈랐다.
 *   human-eye-accommodation  눈알 길이는 그대로 · **수정체 두께**가 바뀐다 — 먼 것에서 가까운 것으로
 *   myopia-hyperopia         수정체는 그대로 · **눈알 길이**가 다르다 — 안경이 상을 망막으로 옮긴다
 * 이쪽만 그대로인 수정체–망막 거리(치수선) · 두꺼워짐 · 먼 산 ↔ 25 cm 앞 책 어휘를 갖는다.
 * 안경 · 근시 · 원시는 쓰지 않는다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const humanEyeAccommodationConcept: Aperi21ConceptSource = {
  id: 'human-eye-accommodation',
  label: 'How the Eye’s Lens Changes Thickness',
  canonicalSim: 'aperi21:human-eye-accommodation',

  surface: {
    definition:
      'How an eye whose lens and retina are a fixed distance apart focuses near things: the lens thickens, shortening its own focal length, so that light from close by meets on the retina again.',
    exemplarKeywords: [
      'accommodation of the eye',
      'how does the eye focus on near and far objects',
      'the lens changes shape',
      'ciliary muscle and the crystalline lens',
      'near point twenty five centimetres',
      'the eyeball cannot change length like a camera',
      'a camera moves its lens, the eye bends its lens',
      'focusing on a book held close',
      'the image has to land on the retina',
      'why your eyes get tired reading',
      'looking up from a page at a distant hill',
    ],
  },

  briefing: {
    observable: [
      'A single eye is drawn in cross-section, with its lens at the front and the retina as a thick arc across the back. A measured line runs between them and reads seventeen millimetres, and it is there from beginning to end.',
      'Light from a far hill arrives as five parallel beams, passes through a thin lens, and meets at a single point on the retina, where a filled dot stands.',
      'Those beams drain away and a new set arrives from a book held twenty-five centimetres in front, spreading apart as it comes rather than running parallel.',
      'With the lens still thin, those spreading beams reach the retina before they have met. Where they land, the retina carries a wide smear instead of a point.',
      'Dashed lines continue the beams past the retina and draw together at a place outside the back of the eye, which is where they would have met had nothing stopped them.',
      'The lens then swells, thickening at its middle while staying in the same place. The beams are turned more sharply, the dashed lines shorten and the smear narrows.',
      'When the lens has finished thickening, the book’s light meets at a single point on the retina and a filled dot stands there, with no smear and no dashed lines left.',
      'Throughout all of this the retina has not moved and the measured line still reads seventeen millimetres — the only thing that has changed shape is the lens.',
      'The lens then thins again and the round repeats from the far hill.',
      'What is written on screen is the naming of the lens and the retina, which thing is being looked at, and the one measurement between lens and retina.',
    ],

    screen: {
      affordances: [
        'The eye looks from far to near and back in a fixed round, with nothing to press.',
        'Each beam is turned by the lens according to the focal length it has at that instant, so where the light meets is a consequence of the thickening rather than a point drawn in.',
        'The one measurement kept on screen is the distance that does not change, which is what makes the changing of the lens the only available explanation.',
        'The beams drawn are solid where light travels and dashed where the path is continued past the retina, since nothing carries light beyond there.',
        'The far source and the near one are told apart by the shape of the arriving light — parallel or spreading — and by which thing is named, rather than by colour.',
        'The place the light lands is drawn as a filled dot when it is a point and as a thickened stretch of the retina when it is spread out.',
        'The eye is drawn as a single bending surface with a lens and a retina and nothing else, so that thickness and distance are the only two things in play.',
        'The change of the lens and the spread of the near light are both drawn larger than life, since at true scale neither would be visible at the size of an eye.',
        'The screen opens with the far light already meeting on the retina.',
      ],
    },

    useWhen: [
      'The article has said that the eye focuses by changing the shape of its lens and the reader’s model is a camera that moves its lens back and forth. Here the measured distance from lens to retina is kept on screen and never budges while the lens visibly swells.',
      'The point being made is why near work is effort — that seeing something close is an active change and seeing far away is the relaxed state. The round here begins at rest with the far hill and ends with the lens thickened.',
      'The reader has been told that an out-of-focus image lands in front of or behind the retina and would like to see what that means in an eye that is otherwise healthy. The near light misses first and is brought back by the lens alone.',
    ],

    avoidWhen: [
      'The eye in the article is short-sighted or long-sighted, or the subject is spectacles. The eye here has the proportions it should and nothing is put in front of it.',
      'The article wants the focal lengths in figures, the power in dioptres, or how much of an amplitude of accommodation is left at a given age. The only number on screen is the fixed distance between lens and retina.',
      'The subject is the parts of the eye — the cornea, the iris, the pupil or the muscle that pulls on the lens. The eye here is reduced to one bending surface and a retina, and no muscle is drawn.',
      'The point is how large something looks or the angle it takes up at the eye. Nothing here compares apparent sizes; the question is only whether the light meets on the retina.',
      'The article is about the image itself — its size, its way up, or whether it is real. No image is drawn here, only where the light of one point ends up.',
      'The subject is an instrument held in front of the eye, or the naked-eye viewing distance as a standard for magnification. The book at twenty-five centimetres is here a thing being looked at, not a yardstick.',
    ],

    contrastWith: [
      {
        concept: 'myopia-hyperopia',
        note: 'Both ask whether light lands on the retina; one has a sound eye change its own lens to make that happen, the other has an eye of the wrong length that cannot, and needs glass in front of it.',
      },
      {
        concept: 'magnifying-glass',
        note: 'Both take twenty-five centimetres as the distance at which something is held to be read; one asks how the eye manages to focus at that distance, the other takes the focusing for granted and asks how much wider an angle a lens can offer.',
      },
      {
        concept: 'lens-combination',
        note: 'One has a single lens change its own strength from moment to moment, the other has a second lens laid against a fixed one to change the strength of the pair.',
      },
    ],
  },
};
