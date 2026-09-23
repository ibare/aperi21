/**
 * twin-paradox 개념 선언.
 *
 * 시간 넷 중 「**누가**」 를 맡는다 (`time-dilation` = 얼마나 · `light-clock` = 왜 ·
 * `muon-decay-evidence` = 정말인가). 이 조각만 **재회**가 있다 — 한 번 지나가는 것이
 * 아니라 갔다가 돌아와, 두 사람의 햇수가 영구히 갈린다. 비대칭의 출처를 묻는다.
 * `spacetime-diagram` 과도 갈랐다 — 저쪽은 동시선이 **기우는** 것(속도를 고르면 기울기가
 * 바뀐다)이고, 이쪽은 돌아서는 순간 동시선이 **도는** 것이다.
 *
 * 조각에 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const twinParadoxConcept: Aperi21ConceptSource = {
  id: 'twin-paradox',
  label: 'Why Only One Twin Comes Back Younger',
  canonicalSim: 'aperi21:twin-paradox',

  surface: {
    definition:
      'Two people who part and meet again have aged differently, the one who turned around having lived fewer years, because turning is what only one of them did.',
    exemplarKeywords: [
      'twin paradox',
      'one twin comes back younger',
      'who is actually younger when they meet again',
      'the travelling twin turns around',
      'why is the situation not symmetric after all',
      'the astronaut and the twin who stayed home',
      'each says the other should be the slow one',
      'twenty years against sixteen',
      'the paradox is resolved by the turnaround',
      'the one who changes frames is the one who loses time',
    ],
  },

  briefing: {
    observable: [
      'Time runs up the picture and distance runs across it. Two paths are laid out faintly from the start, one straight and upright for the one who stays, one bent into a wide inverted V for the one who goes out and comes back.',
      'As the story runs, the part of each path already lived turns solid, and a dot is stamped on it for every year of that person\'s own life.',
      'Beside each of the two moving heads a running count of years is written, so who has reached what age is readable at any moment.',
      'Faint slanted lines reach from the traveller\'s head across to the other path, one left behind at every birthday of the traveller\'s, fanning out as the outward leg goes on.',
      'Those lines meet the straight path at intervals visibly closer together than the years stamped along it, so the stay-at-home\'s years look slow from out there.',
      'At the far corner both heads stop. The traveller\'s slanted line, and only that one, swings around that corner from tilting one way to tilting the other, sweeping a wedge across a stretch of the straight path.',
      'That swept stretch stays marked on the straight path afterwards — a run of the other person\'s years crossed over in the instant of turning.',
      'On the way home the fan of slanted lines piles up above that marked stretch, and the traveller\'s line now meets the straight path higher up than the stay-at-home\'s own head.',
      'The two heads come together again at the top, where the counts thicken and read twenty years against sixteen, with twenty-one dots on the straight path and seventeen on the bent one.',
      'The bent path is plainly the longer of the two to look at on the page, and it carries the fewer dots.',
      'The speed of the traveller is the only other figure written, changing which way it points between the outward and the homeward leg.',
    ],

    screen: {
      affordances: [
        'The outward leg, the turn, the return and the reunion run through by themselves on a loop; nothing has to be pressed.',
        'While the turn is happening the picture\'s own clock is held still and only the traveller\'s slanted line moves, so the turn is idealised as instant and what changes at it is isolated.',
        'Both people are drawn in the same colour with the same kind of dot, so what tells them apart is the shape of the path and nothing else.',
        'Ages are counted stamped dots rather than read-off numbers, and the only other figure on screen is the stated speed.',
        'There are no ruled squares on the picture, which keeps the bent path from being read as though its length on the page were the years lived.',
      ],
    },

    useWhen: [
      'The reader has been told that each of two observers finds the other\'s clock slow and cannot see how that ever yields a definite answer. Watching one line and only one line swing at the turn is what locates the asymmetry in something the two did not share.',
      'The article has given the outcome — one twin ages less — and needs the resolution rather than the statement, without dropping into algebra.',
    ],

    avoidWhen: [
      'The point is how much a moving clock slows, or the factor involved. Only counted years appear, and the factor is never written.',
      'The article is about acceleration, g-forces, or what the traveller feels at the turn. The turn here is instantaneous and nothing about force is drawn.',
      'What is wanted is how to read a diagram of this kind in general — the meaning of a slope, or how the line of now tilts with speed. Only one speed is used and no axis is labelled.',
      'The question is whether one event can affect another, or which regions are reachable. No boundary of reach is marked.',
      'The subject is light signals sent between the two, or the changing rate at which those signals arrive. No signals are drawn.',
    ],

    contrastWith: [
      {
        concept: 'time-dilation',
        note: 'One has the two meet again, which forces a single answer about who aged less; the other has them pass once, where each may hold that the other is the slow one and nothing settles it.',
      },
      {
        concept: 'spacetime-diagram',
        note: 'One asks what changes when a single observer switches which account is theirs partway through; the other is the general way of drawing such accounts, where choosing a speed tilts the line of now.',
      },
      {
        concept: 'relativity-of-simultaneity',
        note: 'One is the fact that two observers can disagree about which things are happening now; the other is what happens to a person who holds first one of those opinions and then the other.',
      },
      {
        concept: 'reference-frame',
        note: 'One turns on the two accounts being equally good and interchangeable; the other turns on one of them not being available throughout, which is what leaves a lasting difference.',
      },
    ],
  },
};
