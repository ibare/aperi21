/**
 * insulation 개념 선언.
 *
 * 들어온 빛과 온도 넷 중 하나 — `albedo` · `radiative-equilibrium` · `greenhouse-effect`
 * 와 섞으면 넷 다 「덥다 · 식는다」 로 수렴한다. **주어와 주장을 갈랐다.**
 *   insulation             주어 = **감쌈**. 주장 = 같은 시간 뒤 식은 정도가 다르다 (빛이 없다)
 *   albedo                 주어 = **표면**. 주장 = 닿은 빛 중 되돌아가는 몫이 다르다
 *   radiative-equilibrium  주어 = **온도가 멎는 자리**. 주장 = 어디서 출발해도 한 값으로 모인다
 *   greenhouse-effect      주어 = **층**. 주장 = 같은 햇빛에서 더 높은 자리에 다시 선다
 * 이쪽만 「감싼다 · 늦춘다 · 아직 식는 중」 어휘를 갖는다. 평형 온도는 없다 — 셋 다 계속 내려간다.
 *
 * `thermal-conduction` 과도 갈랐다 — 저쪽은 재료 **안**을 번지는 열, 이쪽은 감쌈을
 * 건너 **나가는 양**과 그것이 정하는 식는 빠르기다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const insulationConcept: Aperi21ConceptSource = {
  id: 'insulation',
  label: 'Insulation as a Slowed Loss',
  canonicalSim: 'aperi21:insulation',

  surface: {
    definition:
      'Wrapping put round a warm thing to hold back the heat leaving it, so that identical hot contents in differently wrapped vessels stand at different temperatures after the same waiting.',
    exemplarKeywords: [
      'insulation',
      'why does a flask keep coffee hot for hours',
      'which cup keeps tea warm the longest',
      'wrapping a pot in a towel to keep dinner warm',
      'a foam cup against a bare one',
      'slowing down how fast something cools',
      'lagging round a hot water tank',
      'why a coat keeps you warm',
      'keeping the cold out and the warmth in',
      'cooling more slowly than it otherwise would',
    ],
  },

  briefing: {
    observable: [
      'Three cups of the same size stand side by side holding the same water, each with the same starting temperature written above it and a temperature bar inside standing at the same height; the only thing telling them apart is what is round them — a bare wall, a thin hatched layer of cloth, and a thick foam.',
      'The wrappings are drawn in one plain colour with no temperature inside them; what they are is said by their texture and thickness and by the name written under each cup.',
      'As the cooling begins, grains of heat cross the walls and leave — in a steady file out of the bare cup, here and there through the cloth, only now and again through the foam.',
      'Every grain stands for the same amount of heat and the three cups are the same size, so the number that has left in a given stretch is simply how much heat has gone.',
      'The cup losing the most grains has the fastest-falling bar, and on a panel beside the cups three curves set off together from the single starting temperature and draw apart.',
      'The bars and the curves are drawn to one and the same temperature scale, so the lowest curve belongs to the lowest bar without anything having to say so.',
      'When the same elapsed time is up everything stops, and a single vertical dashed line threads the three curve ends, each end carrying the name of its wrapping; the bare cup ends nearest the dashed line marking the temperature outside, the foam cup furthest from it.',
      'No running temperature is written while the cooling goes on; the only figures on the screen are the starting temperature and the temperature outside, both set beforehand.',
      'The three are still falling when the clock stops — none of them has arrived anywhere.',
    ],

    screen: {
      affordances: [
        'One round pours the water, cools the three cups side by side for a fixed stretch, stops the clock and holds the comparison; nothing has to be pressed.',
        'Once the clock has stopped no new grain leaves, and the ones already on their way finish their crossing, so nothing is left frozen in mid-air.',
        'The names of the three wrappings appear at the ends of the curves only once the cooling has stopped, because while it is going on the three curve heads are too close together for three names to sit apart.',
        'The highlight colour carries a single meaning, temperature: all three bars wear it, and the escaping heat and the curves are given colours of their own.',
        'The thickness drawn on a wrapping is a picture of what it is, not a measure of how well it works; how fast each cup cools is set separately for each material.',
      ],
    },

    useWhen: [
      'The article has said that insulation slows heat loss rather than stopping it, and the reader is inclined to read that as stopping it. Three cups all falling, at three plainly different rates, with even the foam one visibly losing grains, is what fixes the distinction.',
      'The point being made is that the comparison has to be made at the same moment — that "it stayed hot" means nothing without saying how long — and the vertical dashed line threading the three ends is exactly that reading.',
    ],

    avoidWhen: [
      'The subject is how heat makes its way along or through a material, with one end reached sooner than another. The wrappings here have no temperature drawn inside them at all; only what crosses them is shown.',
      'The article is about heat carried by moving air or liquid, or about warm fluid rising. Nothing moves here but the heat leaving.',
      'The point is how much a substance warms for a given amount of heat, or that equal heat gives unequal rises. All three cups hold the same water and start at the same temperature.',
      'What is wanted is the temperature the contents end up at. Nothing settles here; all three are still cooling when the clock stops, and the outside temperature is only drawn as the level they are heading toward.',
      'The article is about sunlight arriving, about radiation crossing a gap, or about anything to do with light. No light falls on these cups.',
      'Figures are wanted — how many degrees lost, a rate, a conductivity. The only numbers written are the starting temperature and the one outside.',
    ],

    contrastWith: [
      {
        concept: 'thermal-conduction',
        note: 'One is about how much heat gets out through a barrier and what that does to the temperature behind it; the other is about the journey heat makes inside a body, and how far along it has got.',
      },
      {
        concept: 'thermal-equilibrium',
        note: 'One compares several bodies still on their way down at a chosen moment; the other follows a pair all the way to the end, where the flow slackens and stops.',
      },
      {
        concept: 'specific-heat',
        note: 'One keeps the contents identical and changes what is round them; the other keeps what is round them out of it and changes what the substance is.',
      },
      {
        concept: 'greenhouse-effect',
        note: 'Both end with something warmer than it would otherwise be, one by letting heat out more slowly and the other by handing part of what was sent out straight back.',
      },
    ],
  },
};
