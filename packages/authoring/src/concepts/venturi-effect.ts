/**
 * venturi-effect 개념 선언.
 *
 * 「좁아지면 빨라진다」 셋 중 **장치** 쪽. 형제와 갈린 자리는 주어다.
 *   continuity-equation   지나가는 **양** — 어느 단면에서나 같다
 *   bernoullis-principle  **압력** — 빨라진 만큼 내려간다, 두 몫의 합이 일정하다
 *   venturi-effect        **장치** — 목의 낮은 압력이 통의 액체를 끌어올려 물방울로 뿜는다
 * 이쪽만 「빨려 올라간다 · 분무기 · 옆관 · 통 · 물방울」 어휘를 갖는다. 「두 몫 · 합이 일정 ·
 * 같은 양 · Av」 는 쓰지 않는다 — 형제 둘의 몫이다. 액체를 밀어 올리는 것은 통에 얹힌 바깥
 * 공기라 `atmospheric-pressure` 와도 갈라 둔다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const venturiEffectConcept: Aperi21ConceptSource = {
  id: 'venturi-effect',
  label: 'A Throat That Draws Liquid Up',
  canonicalSim: 'aperi21:venturi-effect',

  surface: {
    definition:
      'The drawing of liquid out of an open vessel by a throat in a tube being blown through, the air rushing past pressing less than the outside air that stands on the vessel.',
    exemplarKeywords: [
      'Venturi effect',
      'spray bottle',
      'atomiser',
      'perfume sprayer',
      'how does a paint spray gun work',
      'carburettor',
      'a narrow throat sucks liquid up a side tube',
      'aspirator pump run on a stream of water',
      'liquid pulled into a moving airstream and blown out as mist',
      'why does blowing across a straw lift the drink',
    ],
  },

  briefing: {
    observable: [
      'A tube seen from the side, wide at the inlet, pinched to a throat in the middle, opening out again and standing open to the outside air at its far end. Under it sits an open tank of liquid.',
      'Two thin tubes drop from the underside of the tube into the tank — one from the wide part, one from the throat. A dotted line carried across from the tank’s surface past both of them is the mark to judge by.',
      'While no air blows, the liquid in both thin tubes stands exactly on that dotted line.',
      'When the air blows, the liquid under the throat climbs above the line and the liquid under the wide part does not stir — one wind, one tank, and only the narrowed place lifts anything.',
      'The harder the air blows, the higher that column stands, and it rises faster than the wind does.',
      'Once it reaches the throat, the air tears it away: droplets are born there and travel off with the stream, out past the open end in a spreading jet.',
      'Air dots inside the tube stand still when there is no wind; when it blows their spacing opens at the throat and their tails lengthen there.',
      'All the liquid is drawn in one colour — the tank, the two columns, the droplets — so it reads as one liquid moving from one place to another.',
      'No value is written anywhere; the caption under the picture names what the stage is doing.',
    ],

    screen: {
      affordances: [
        'One round runs on its own and repeats — still air, wind rising, spraying, wind dying away.',
        'Arriving readers land mid-rise, with the column under the throat already partway up.',
        'Nothing is offered to press or drag: the wind rising and falling by itself already carries "the harder it blows, the higher it goes, and past a point it sprays".',
        'The wide tube is the control in the experiment, so the two thin tubes are drawn alike and only their stations differ.',
        'The judgement is the gap between the two columns and the dotted line, not a height in centimetres, which is why no scale, grid or camera is drawn.',
        'The column under the wide part sits at nought by the same calculation that lifts the other, rather than being held down by the drawing.',
      ],
    },

    useWhen: [
      'The article has said that a throat lowers the pressure and the reader wants to know what anyone does with that. The one tube that climbs while its twin sits still, and then the spray, is the answer in a single machine.',
      'The article is explaining a sprayer, a carburettor or a water aspirator, and the reader cannot see what moves the liquid from the vessel into the airstream.',
    ],

    avoidWhen: [
      'The claim is the rule itself — that speed and pressure are traded, or that the two make a constant sum. That accounting is not drawn here; only its consequence, which is liquid on the move.',
      'The point is that the same amount passes every cross-section, or why the air quickens at the throat at all. The quickened air is background here.',
      'The article uses a Venturi as an instrument and needs the pressure difference read off it. There is no gauge and no number in this picture.',
      'The subject is how a liquid breaks into droplets, or the size of the drops a sprayer makes. The tearing happens, but nothing here is drawn to argue about it.',
      'The article is about suction as a pull. What lifts the liquid here is the outside air standing on the open tank, and the picture is arranged around that.',
    ],

    contrastWith: [
      {
        concept: 'bernoullis-principle',
        note: 'One is the low pressure at a throat put to work — a vessel, a side tube, and liquid that arrives somewhere else; the other is where that low pressure is itself the thing being argued for.',
      },
      {
        concept: 'continuity-equation',
        note: 'One is a device that needs a fast throat; the other is the reason a throat is fast, which is that the same amount must get through a smaller opening.',
      },
      {
        concept: 'atmospheric-pressure',
        note: 'One asks what happens when one end of a liquid is pressed less hard than the other; the other is where the standing weight of the air doing that pressing is itself the subject.',
      },
      {
        concept: 'lift-force',
        note: 'Both turn the pressure a stream leaves behind into something that moves: one moves liquid out of a vessel and into the stream, the other moves the body the stream is flowing past.',
      },
    ],
  },
};
