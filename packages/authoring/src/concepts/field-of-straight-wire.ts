/**
 * field-of-straight-wire 개념 선언.
 *
 * 자기장 넷 가운데 이쪽은 **전류가 만든 장**이다 — 끄면 바늘이 북으로 돌아오고, 거꾸로 흘리면
 * 반대로 감긴다. 그 껐다 켬이 「전류가 만들었다」 의 근거다.
 *   field-of-straight-wire 전선을 **감는다** + 멀수록 덜 돌아선다 + 끄고 뒤집을 수 있다
 *   magnetic-field         자석의 장, 끌 수 없고 **드러남**이 주장이다
 *   magnetic-field-lines   한 가닥에 **끝이 있는가**
 *   biot-savart-law        한 점의 장이 조각들의 **합**이다
 * 주제 설명의 「거리에 반비례하는 세기」 는 화면이 「멀수록 덜 돌아선다」 까지만 한다 —
 * 장부에 올리고 정량으로 읽는 쓰임은 avoidWhen 으로 되돌렸다.
 * `canonicalSim` 은 topics.yaml 의 `sim` 값 그대로라 개념 id 와 다르다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const fieldOfStraightWireConcept: Aperi21ConceptSource = {
  id: 'field-of-straight-wire',
  label: 'Field Wrapping a Straight Current',
  canonicalSim: 'aperi21:current-magnetic-field',

  surface: {
    definition:
      'The field a straight current lays around itself, wrapping the wire rather than pointing at it, swinging compass needles further round the nearer they stand and the opposite way round when the current is reversed.',
    exemplarKeywords: [
      'magnetic field around a straight wire',
      'compass needles beside a current carrying wire',
      'Oersted and the twitching needle',
      'the field goes round the wire',
      'which way does a compass point next to a wire',
      'the effect fades further from the wire',
      'reversing the current swings the needles back the other way',
      'B equals mu nought I over two pi r',
      'right hand grip rule',
      'a current behaving like a magnet',
    ],
  },

  briefing: {
    observable: [
      'A wire is seen end on, as a mark at the middle of the picture, with a mark inside it saying which way the current goes through the page.',
      'Forty-odd compass needles stand on four rings at four distances from the wire, each on its own pin.',
      'With no current running, every needle points the same way, up the page.',
      'When the current is switched on, the needles on the two inner rings swing until they lie close to along their own rings, so those rings read as loops going round the wire.',
      'The needles on the two outer rings turn far less, so how far a needle has come round falls away with distance from the wire.',
      'The turning spreads from the inside outward: the inner needles swing across almost at once and the outer ones follow about a second behind.',
      'When the current is switched off every needle returns to pointing up the page, and all of them return at the same rate whatever their distance.',
      'The current is then run the other way, the mark inside the wire changes to the other kind, and the needles swing round the opposite way.',
      'Every cycle holds a stretch with no current, so the resting direction is shown rather than remembered.',
      'Each needle is a filled triangle at one end and an outlined one at the other, so its two ends are told apart without colour; the wire is the only thing in the accent colour and how strong the current is shows only in how strongly its mark is drawn.',
      'No ring, field line or north arrow is drawn in advance, so the loops exist only in what the needles do.',
      'Needles that would be cut off by the edge of the picture are left out, so no needle is drawn half and made to lie about its direction.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the current is switched on, off, reversed and off again in a cycle of about eleven seconds, and the needles answer each time.',
        'The needles stand on rings rather than on a grid, so needles at one distance are already grouped and swing together by the same amount.',
        'How strong the current is shows only in how strongly the mark for the wire is drawn, and is never written as a figure.',
        'The two ends of a needle are told apart by one being filled and the other only outlined, so no colour is asked to carry a meaning.',
        'The stretch with no current is kept in every cycle, because a needle has to be seen at rest before it can be said to have swung.',
        'Each needle answers the sum of the field of the wire and a steady background field, which is why the far needles are held back toward the resting direction instead of lying along their rings too.',
        'The wire is drawn end on, so that the whole of its field lies in the plane of the picture and a loop appears as a loop.',
      ],
    },

    useWhen: [
      'The article says that a current makes a magnetic field and the reader cannot picture a field that goes round something rather than out from it. Two rings of needles coming nearly into line with their own rings is where round becomes something seen.',
      'The prose is about the discovery itself, or about a compass set beside a wire, and needs the switching off and the reversal in one run so that the needles are answering a current rather than merely sitting in a pattern.',
    ],

    avoidWhen: [
      'The article is about a permanent magnet, or about how the shape of a field can be found at all. The field here is switched on and off.',
      'The subject is how the field at a point is built out of contributions from the separate lengths of the wire.',
      'A strength is wanted in numbers, or halving the distance is to be shown as doubling the strength. The needles show only how far round they have come, with no scale of distance and no figure for strength.',
      'The article is about a loop, a coil or a solenoid rather than a single straight wire.',
      'The subject is what a field does to a current placed in it. Nothing here is pushed; the needles only turn.',
      'The reader is meant to carry a compass about or to change the current. The needles are fixed on their rings and the cycle runs on its own.',
    ],

    contrastWith: [
      {
        concept: 'magnetic-field',
        note: 'One has a field that can be switched off and run the other way, which is how the reader knows a current made it; the other has one that is simply there, and is about a shape appearing among pieces that nobody arranged.',
      },
      {
        concept: 'biot-savart-law',
        note: 'One takes the field around a wire as it stands and is about how it wraps and how it fades; the other takes the field at one point apart into the contributions that were added to make it.',
      },
      {
        concept: 'force-on-current-wire',
        note: 'One has a current laying a field of its own; the other has a current pushed by a field that was already there.',
      },
      {
        concept: 'magnetic-field-lines',
        note: 'One has loops that exist only in the way a crowd of needles happens to lie; the other draws a line from the start and asks whether it ever ends.',
      },
    ],
  },
};
