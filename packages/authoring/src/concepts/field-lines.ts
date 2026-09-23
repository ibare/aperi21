/**
 * field-lines 개념 선언.
 *
 * 장 다섯 가운데 이쪽은 **규약이 참인가**를 묻는다 — 선이 몰린 곳이 정말 센가를,
 * 선과 **독립된 두 번째 표현**(떠밀리는 알갱이의 빠르기)으로 확인한다.
 *   field-lines      **선 밀도 = 세기** 라는 그림 규약의 참 · 거짓
 *   electric-field   자리마다의 값과 **단위 전하**
 *   field-of-dipole  반대 전하 한 쌍의 **모양과 떨어짐**
 *   gausss-law       닫힌 경계를 지나는 **알짜 수**
 * 이쪽만 「규약 · 촘촘함 · 빠르기 · 끌어 옮기면 함께 따라간다」 어휘를 갖는다.
 * 화면에 + 와 − 가 함께 있지만 쌍극자의 모양은 주장하지 않으므로 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const fieldLinesConcept: Aperi21ConceptSource = {
  id: 'field-lines',
  label: 'Whether Crowded Lines Really Mean a Strong Field',
  canonicalSim: 'aperi21:field-lines',

  surface: {
    definition:
      'Whether the drawing rule that crowded lines mark a strong field is honest: specks drifting in the same field run fastest exactly where the lines bunch, and the fast channel travels with the bunching when a charge is moved.',
    exemplarKeywords: [
      'electric field lines',
      'why do crowded field lines mean a stronger field',
      'line density and field strength',
      'how to read a field line diagram',
      'are field lines real or just a drawing convention',
      'lines begin on positive and end on negative',
      'how many lines to draw for each charge',
      'sketching the field around charges',
      'what the spacing of the lines tells you',
      'field map drawn with lines',
    ],
  },

  briefing: {
    observable: [
      'Two dozen lines run out of a positive charge; about half of them curve round into a negative charge nearby and the rest leave the picture, and the number drawn on each charge is in proportion to how much charge it carries.',
      'Roughly a thousand tiny specks drift through the same field, each drawn as a streak whose length is its own speed, so how fast a speck is going can be read from a frozen picture.',
      'Where the lines bunch together the streaks are long and drawn out; out in the open where the lines are far apart the specks are nearly stationary dots.',
      'The negative charge travels slowly round the positive one over about a quarter of a minute, so the bunched channel of lines moves across the picture, and the region of long streaks moves with it rather than staying put.',
      'Following one speck with the eye, it crawls through the open field and then lengthens as it enters the bunched channel.',
      'Specks fade in at scattered places and fade out again after a few seconds, so no part of the picture empties out or silts up.',
      'A single line of text stays the same throughout, because the claim holds in every arrangement rather than at one moment.',
      'The picture has no scale, no grid, no arrowheads on the lines and no colour key; the only two things drawn are the lines and the specks.',
    ],

    screen: {
      affordances: [
        'The negative charge can be dragged anywhere by a ring handle, and the bunching and the fast streaks rearrange together as it is moved.',
        'On release it eases back onto its slow circuit over about half a second rather than snapping back.',
        'The lines are traced afresh from the actual positions every moment, and the specks are pushed by the same field, so the two pictures cannot drift out of agreement.',
        'Speed is shown by streak length rather than by colour, which is what lets it be read without a legend and in a still picture.',
        'The field drawn is the two-dimensional one, in which line spacing and strength fall off together, so that the crowding claim is exact rather than nearly right.',
      ],
    },

    useWhen: [
      'The article states the convention that crowded lines mean a strong field and the reader has no reason to trust it, since the lines were drawn by a person. A second, independent showing of strength that agrees with the crowding everywhere is what turns the convention into a finding.',
      'The prose invites the reader to try an arrangement of their own, and the handle on the negative charge lets the agreement be tested rather than accepted.',
    ],

    avoidWhen: [
      'The article needs the field at one named place, or the force a particular charge would feel there. The specks are a great many and none of them is singled out.',
      'The subject is the shape of the pattern made by two equal and opposite charges, or how such a pair’s field dies away with distance. The two charges here are unequal and the interest is in crowding.',
      'A closed boundary is drawn and lines crossing it are counted.',
      'Numbers are wanted — a strength, a spacing, a count of lines per charge. Nothing is labelled.',
      'The article is about the direction of the field. The lines carry no arrowheads and the specks show only how fast, not which way matters.',
      'The article is about magnetism. What is drawn here begins and ends on charges.',
    ],

    contrastWith: [
      {
        concept: 'electric-field',
        note: 'One asks whether a drawing convention can be trusted and answers with a second measurement; the other asks what the value at a place means and answers by changing what is put down there.',
      },
      {
        concept: 'field-of-dipole',
        note: 'One uses a pair of charges as a convenient arrangement and claims nothing about it; the other makes the pair itself the subject — how its lines close and how fast its field dies away.',
      },
      {
        concept: 'gausss-law',
        note: 'One is about how closely lines lie together in a region; the other ignores spacing entirely and counts how many cross a boundary, which is why any shape of boundary gives the same answer.',
      },
      {
        concept: 'uniform-field',
        note: 'One shows crowding varying from place to place and ties that to strength; the other shows an arrangement built so that neither the crowding nor the strength varies.',
      },
    ],
  },
};
