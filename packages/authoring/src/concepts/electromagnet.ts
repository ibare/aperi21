/**
 * electromagnet 개념 선언.
 *
 * 자기 형제들과는 **무엇이 주장인가**로 갈랐다. 이쪽은 **켜고 끌 수 있다**는 것 하나다.
 *   electromagnet              전류가 흐르는 동안에만 자석이다 — 끊으면 놓는다 (증거: 매달린 클립)
 *   field-of-loop-and-solenoid 코일 **속의 장 모양** — 고리를 겹치면 안이 곧고 촘촘해진다
 *   magnetic-field             자석의 무늬가 쇳가루로 **드러난다**
 *   magnetic-materials         한 자석에 **물질마다** 다르게 답한다
 *   force-on-current-wire      장 속의 전류가 **옆으로 밀린다**
 * 자기력선 · 나침반 어휘는 이쪽에 두지 않는다 — 화면에 선이 없고 클립이 증인이다.
 * 「끌어당긴다」 대신 **들어 올린다 · 떨어뜨린다**의 어휘만 쓴다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const electromagnetConcept: Aperi21ConceptSource = {
  id: 'electromagnet',
  label: 'A Magnet That Lasts Only While the Current Does',
  canonicalSim: 'aperi21:electromagnet',

  surface: {
    definition:
      'An iron nail with wire wound round it that is a magnet only while current flows, holding paperclips at both ends, dropping them the moment the circuit breaks, and holding more when the winding is denser or the current larger.',
    exemplarKeywords: [
      'electromagnet',
      'wire wound round an iron nail',
      'switch it off and the paperclips drop',
      'a magnet you can turn on and off',
      'more turns picks up more paperclips',
      'scrapyard crane that drops the scrap',
      'temporary magnet against a permanent one',
      'coil around a soft iron core',
      'how many clips will it hold',
      'doorbell and relay coil',
      'making a magnet with a battery and a nail',
    ],
  },

  briefing: {
    observable: [
      'An iron nail lies on its side with wire wound round it, a battery and a switch closing the circuit beneath, and a scatter of paperclips on the table below.',
      'The near strands of the winding pass in front of the nail and the far strands behind it, fainter and thinner, so the wire is seen to go round rather than to be drawn on top.',
      'While the switch stands open nothing is marked at the ends of the nail, no arrow runs in the wire, and every clip stays in the pile.',
      'The instant the blade of the switch touches, a letter appears at each end of the nail, an arrow with its value appears in the wire, and clips fly up from the pile to hang in a chain from each end.',
      'Both ends take a clip chain, so the nail is seen to have two poles rather than one.',
      'When the blade lifts the letters go first and the clips follow, falling back to the table, so the losing of the magnetism is watched before its consequence.',
      'The pile always keeps more clips than were lifted, so what hangs reads as all the nail could manage rather than all there was.',
      'Three runs follow one another: the first winding, then a denser winding of the same length over the same nail, then back to the first winding with a second cell added to the battery.',
      'Each of the two later runs hangs twice the chain of the first, and the current arrow in the third run is drawn twice as long.',
      'The length of the hanging chain is the only measure of the pull; no count of clips is written anywhere.',
      'Nothing is drawn in the space around the nail at any point, so the lifting is the only sign that the nail has become a magnet.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the winding is laid on, the switch closes, the clips rise, the switch opens, the clips fall, and the next run begins.',
        'The current is raised by filling a second cell holder rather than by setting a number, so the reason for the larger current is on the screen.',
        'While the winding is being changed the old coil fades out and the new one fades in, and no half-way winding is ever shown.',
        'The two poles are told apart by their letters alone, with no red and blue.',
        'The scatter of the pile is the same every time round, so what differs between runs is the winding and the current and nothing else.',
        'The iron is drawn in a plain grey, the circuit in one colour and the clips in ink, and the accent colour is spent entirely on the two pole letters.',
      ],
    },

    useWhen: [
      'The article has said an electromagnet can be switched off and the reader has no picture of what switching off looks like. A blade lifting, the pole letters going, and a chain of clips dropping in that order is what makes the loss of magnetism visible rather than asserted.',
      'The prose needs the strength to be seen to depend on the winding and on the current without a formula or a figure, since the chain that hangs is simply longer in the two later runs.',
    ],

    avoidWhen: [
      'The subject is the shape of the field a coil makes, or what happens along its axis. Nothing at all is drawn in the space around the nail here.',
      'The article is about how different materials answer to a magnet. Only iron and steel clips appear, and the question is whether the nail is a magnet at all.',
      'The point is a force on the wire itself, or a wire pushed sideways in a field. The wire here stays wound and still, and everything that moves is a clip.',
      'The article is about permanent magnets, about what keeps a magnet magnetic, or about some magnetism remaining after the current stops. Here every clip falls when the circuit opens.',
      'A strength is wanted in numbers, or the pull is to be worked out from the turns and the current. No count of clips is written and the hanging chain is all there is to read.',
      'The reader is meant to wind the coil or work the switch themselves. The three runs go by on their own.',
    ],

    contrastWith: [
      {
        concept: 'field-of-loop-and-solenoid',
        note: 'One asks only whether the thing is a magnet at this moment, answered by what it holds and drops; the other takes the magnetism for granted and asks what shape the field inside a coil has.',
      },
      {
        concept: 'magnetic-field',
        note: 'One has a magnetism that can be created and destroyed and is known by its effect on other objects; the other has a magnet that simply is, and asks what its surrounding pattern looks like.',
      },
      {
        concept: 'magnetic-materials',
        note: 'One keeps the material fixed and switches the magnetism on and off; the other keeps the magnet fixed and asks how differently one material and another answer to it.',
      },
      {
        concept: 'force-on-current-wire',
        note: 'Both have a current and a magnetism together, but one has the current making the magnetism, while the other has a field already present that pushes the current-carrying wire aside.',
      },
      {
        concept: 'electric-current',
        note: 'One treats the current as a thing that is either flowing or not, and reads the answer off what the iron holds; the other asks what a current is counting in the first place.',
      },
    ],
  },
};
