/**
 * free-body-diagram 개념 선언.
 *
 * 형제는 `net-force` 와 `newtons-second-law`. **주장을 갈랐다.**
 *   free-body-diagram   힘이 **누구 것인가** — 떼어 내면 받는 힘만 따라 나오고 맞은편은 남는다
 *   net-force           이미 정해진 목록을 **하나로 줄인다**
 *   newtons-second-law  힘 하나와 결과의 **비례**
 * 이쪽만 소속 · 떼어 냄 · 목록 · "이 힘은 저쪽에 남는다" 어휘를 갖는다. 합성·배수라는 말은
 * 쓰지 않는다. `newtons-third-law` 와도 갈린다 — 그쪽은 쌍이 같다는 주장, 이쪽은 쌍이 서로
 * 다른 목록에 들어간다는 주장이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const freeBodyDiagramConcept: Aperi21ConceptSource = {
  id: 'free-body-diagram',
  label: 'Free-Body Diagram',
  canonicalSim: 'aperi21:free-body-diagram',

  surface: {
    definition:
      'The practice of choosing one body out of a stack and keeping only the forces acting on that body, leaving the matching force at the same contact behind with its neighbour.',
    exemplarKeywords: [
      'free-body diagram',
      'which forces act on this object',
      'isolating a single body',
      'drawing only the forces on the chosen object',
      'force diagram for a book on a table',
      'the cup presses on the book, not on the table',
      'forces on it versus forces it exerts',
      'what goes in the diagram and what does not',
      'system boundary for forces',
      'listing the forces on one object',
    ],
  },

  briefing: {
    observable: [
      'A cup stands on a book, the book on a table and the table on the floor, with nine force arrows drawn across the whole stack and each one carrying a written name saying who gives it — Earth pulls, book supports, cup presses, table supports, book presses, floor supports.',
      'One body lifts out of the stack into a space of its own, and a dashed outline is left where it was.',
      'The arrows that go with it are exactly the ones acting on it, redrawn in the accent colour at full strength; the rest stay faintly in place on the stack.',
      'The matching arrow at the same contact stays behind — when the cup leaves, the arrow for the cup pressing on the book stays on the book.',
      'The caption counts the list out loud for whichever body was lifted: the book feels three forces, the cup two, the table four.',
      'For the table the caption also says what is absent and why — the cup does not touch the table, so it is not on the list, even though the cup is plainly sitting up there in the stack.',
      'The arrow lengths follow the sizes of the forces, so the table’s weight reaches far down the screen while the cup’s two arrows are short.',
      'The lifted body is put back and the stack is whole again before the next body is taken out.',
    ],

    screen: {
      affordances: [
        'The cup, the book and the table are each taken out in turn without being asked for, so all three lists come round.',
        'The cup, the book or the table in the stack can be pressed to have that body taken out next, which lets the one the reader doubts be reached directly.',
        'The forces left on the stack stay drawn while a body is out, so the half of a contact that did not travel can be pointed at.',
      ],
    },

    useWhen: [
      'The reader is putting "the book pushes up on the cup" into the cup’s own diagram. Lifting the cup out and seeing that arrow stay behind on the book settles where each half of a contact belongs.',
      'The article is about drawing a diagram before any calculation, and needs the moment where a body is separated from its surroundings and its list of forces becomes finite and nameable.',
      'The claim is that a force absent from a diagram can be absent for a reason — no contact — and the table’s list, which has no cup in it, is the case to write against.',
    ],

    avoidWhen: [
      'The forces have already been chosen and the question is what they add up to. Nothing here is summed; the arrows stay separate and named.',
      'The article is about equal and opposite pairs as such. Both halves of each contact are on screen but they are never laid against each other to be compared in size.',
      'Bodies in motion are the subject, or forces that produce acceleration. The whole stack stands still throughout and no body moves except to be lifted out and put back.',
      'Numbers in newtons are wanted, or the arrows have to be measured. Lengths follow the sizes but no value is written.',
      'The surface and how hard it pushes is the point, or that push changing. Every contact here carries whatever it carries and none of them varies.',
    ],

    contrastWith: [
      {
        concept: 'net-force',
        note: 'One settles which forces belong on a body’s list; the other takes a settled list and reduces it to one arrow.',
      },
      {
        concept: 'newtons-third-law',
        note: 'One separates the two halves of a contact so each goes to its own body; the other holds them together to say they are equal and opposite.',
      },
      {
        concept: 'newtons-second-law',
        note: 'One is about identifying the forces on a body; the other is about what a force, once identified, does to the body’s motion.',
      },
      {
        concept: 'normal-force',
        note: 'One names the support at a contact as one item on a list; the other asks what fixes the size of that support and how it changes.',
      },
    ],
  },
};
