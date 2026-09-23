/**
 * transistor-principle 개념 선언.
 *
 * 반도체 여섯 가운데 이쪽만 **전류 둘의 관계**를 말한다.
 *   transistor-principle  작은 전류 하나가 큰 전류를 **여닫고 그 양까지 정한다**(100 배) —
 *                         같은 눈금의 막대 둘이 그 비를 보인다
 *   pn-junction           경계 한 곳의 공핍층 — 흐르거나 막히거나 둘뿐이다
 *   diode-and-led         띠 간격이 문턱과 빛의 색을 정한다
 * 이쪽만 베이스 · 이미터 · 컬렉터 · 전류 이득 · 「작은 것이 큰 것을 부린다」 어휘를 갖는다.
 * 공핍층 · 띠 그림 · 전류-전압 곡선 · 전압 값 · 빛은 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const transistorPrincipleConcept: Aperi21ConceptSource = {
  id: 'transistor-principle',
  label: 'A Small Current Commanding a Large One',
  canonicalSim: 'aperi21:transistor-principle',

  surface: {
    definition:
      'That a small current fed into the middle terminal of a three-layer device opens and closes a far larger one through it, and fixes how large as well — here a hundred times the small one.',
    exemplarKeywords: [
      'transistor',
      'base current controlling collector current',
      'current gain',
      'a tiny input commanding a large output',
      'how does a transistor amplify',
      'emitter, base and collector',
      'a hundred times the input current',
      'switching a large current with a small one',
      'what makes a transistor a switch',
      'why the middle layer is made thin',
      'the output following the input in proportion',
      'amplification in a single component',
    ],
  },

  briefing: {
    observable: [
      'A bar lies across the left of the picture in three stretches, the middle one much thinner than the other two and each named, with a plate at either end and a lead running up out of the middle stretch.',
      'To the right stand two upright bars in identical frames on one and the same scale, named for the two currents, each with its value written at the top of whatever it holds.',
      'At first the lead is grey, the carriers in the outer stretches jitter without going anywhere, the thin middle stretch is empty of them, and both upright bars read nothing.',
      'Then the lead thickens and turns the accent colour. Carriers begin to run the length of the bar, crossing the thin middle stretch, each trailing a tail behind it.',
      'The named current on the lead is so small on the shared scale that its bar is barely a line at the bottom of its frame, while the other fills half its frame; a ratio is written between the two.',
      'The lead’s current is then doubled: the tails grow to twice their length and the large bar rises to the top of its frame, at twice the value it held before.',
      'Cutting the lead’s current returns it to grey, the carriers stop, the thin middle stretch empties again, and both bars read nothing.',
      'The carriers keep the same spacing throughout; what changes with the current is how fast they go.',
      'Carriers that leave at one plate come back in at the other, fading in and out close to the plates.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The device is off, then on, then driven twice as hard, then cut off, and the round repeats.',
        'The two upright bars share one scale, so the small one shows as an almost empty frame — that emptiness is the claim, and the value written above it is there to say it is not nothing.',
        'Giving the small current a scale of its own would put the two bars at comparable heights and reverse the very thing being shown.',
        'The spacing of the carriers never changes and only their speed does, so the current is read as speed; the tails make that readable in a still frame, and at twice the current they are twice as long.',
        'When the lead is off, the thin middle stretch is left with no carriers in it at all, which is how "they cannot get across" is shown rather than said.',
        'No direction arrows are drawn for the currents, since the conventional direction and the way the carriers actually move are opposite and drawing both would raise a second question.',
        'The small flow into the middle terminal itself is not drawn as carriers: at one in a hundred it would either be invisible or have to be exaggerated into a falsehood, so the lit lead and its bar stand for it.',
        'The accent colour is kept for the commanding current alone — the lead, its bar and its value — since what counts as the small signal is the one thing that has to be unmistakable.',
        'The three stretches are told apart by their names rather than by colour, and no supply, resistor or circuit is drawn.',
      ],
    },

    useWhen: [
      'The reader has been told a transistor amplifies and has no sense of the scale involved. Two bars on one scale, one of them barely a line, is what makes a factor of a hundred a thing to look at.',
      'The article treats switching and amplifying as two different uses. Here they are the same arrangement seen at three settings of one input — off, on, and twice as hard.',
      'The prose needs the output to follow the input rather than merely be released by it. Doubling the small current doubles the large one and lengthens every tail.',
      'The point is that current is carriers moving faster rather than more of them. The spacing holds while the tails stretch.',
    ],

    avoidWhen: [
      'The subject is what happens at a single boundary inside the device, the layer of fixed charge there, or how it narrows and widens. Nothing here is drawn inside a boundary.',
      'The article is about a trace of current against voltage, or a turn-on point read off such a trace. No plane and no curve appear.',
      'The point is designing a circuit — supplies, load resistors, bias networks or a voltage gain. Nothing is connected to anything and no voltage is written.',
      'The subject is a device controlled by a voltage on an insulated terminal rather than by a current. One kind of device is shown.',
      'The article turns on the regions where the proportionality fails, on saturation, or on how the ratio drifts with temperature. Only the proportional case is shown.',
      'The reader is to be shown light being given out, or light being taken in. Nothing here emits or absorbs.',
      'A power, a voltage or a resistance is to be read off. Only the two currents carry figures.',
    ],

    contrastWith: [
      {
        concept: 'pn-junction',
        note: 'One boundary gives a device that either passes or blocks according to which way the voltage is put; putting two of them back to back gives one whose passing is commanded by a third, much smaller current.',
      },
      {
        concept: 'diode-and-led',
        note: 'Both are made from the same kind of material, but one is about a threshold and a colour fixed by that material, and the other about one current fixing the size of another.',
      },
      {
        concept: 'digital-vs-analog-signal',
        note: 'One shows the component by which a small input opens or closes a large flow; the other is about the decision to read a signal as one of two states rather than as a continuous value.',
      },
      {
        concept: 'electric-current',
        note: 'One asks what a current is and how it is counted; the other takes two currents for granted and is about one of them being in charge of the other.',
      },
      {
        concept: 'mechanical-advantage',
        note: 'Both have something small commanding something large, but one buys its force by giving up distance, and the other has a small current fixing the size of a large one with no such bargain involved.',
      },
    ],
  },
};
