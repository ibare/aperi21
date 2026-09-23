/**
 * energy-in-inductor 개념 선언.
 *
 * 코일 넷 가운데 이쪽은 **「쌓였다가 돌아 나온다」** — 에너지의 자리와 양이다.
 *   energy-in-inductor  거슬러 한 일이 **자기장에 쌓이고**, 줄이면 **돌아 나온다**
 *   mutual-inductance   이어지지 않은 이웃에 전압이 서는 **때**
 *   rl-circuit          닫은 뒤 전류가 **차오르는 시간**과 전압의 나눔
 *   lc-oscillation      쌓인 것이 축전기와 코일 **사이를 오간다**
 * 이쪽만 「저장 · 되돌려받음 · 넓이」 어휘를 갖는다. 시간축 · 스위치 · 상대 코일은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const energyInInductorConcept: Aperi21ConceptSource = {
  id: 'energy-in-inductor',
  label: 'Energy Banked in a Coil’s Magnetic Field',
  canonicalSim: 'aperi21:energy-in-inductor',

  surface: {
    definition:
      'Pushing a current up against the voltage a coil raises in opposition does work that is banked in the magnetic field, and letting the same current back down pays that store out again.',
    exemplarKeywords: [
      'energy stored in an inductor',
      'half L I squared',
      'a magnetic field holds energy',
      'where does the energy go while you build up a current in a coil',
      'work done against the back emf',
      'the coil gives its energy back when the current falls',
      'an inductor stores rather than consumes',
      'energy held in a magnetic field',
      'area under the flux linkage against current graph',
      'why the stored energy goes as the square of the current',
      'joules sitting in a coil',
    ],
  },

  briefing: {
    observable: [
      'A coil is drawn from the side on the left, and on the right a plain plane whose across direction is the current and whose up direction is the flux linkage, with a straight line rising through it.',
      'As the current is raised evenly from nothing, the arrow for it lengthens, magnetic loops stand up one after another starting from the ones nearest the axis, and the wash inside the coil darkens faster than the loops are added.',
      'A second arrow between the coil’s two leads points back against the current the whole time the current is being raised, and it keeps one length rather than growing.',
      'On the plane a marker climbs the straight line, and the triangle between the line and the base fills in beneath it in the same colour as the wash inside the coil.',
      'When the current is then held steady the opposing arrow disappears entirely while the loops, the wash and the now-complete triangle all stay exactly as they were, and a symbol for the stored amount is set inside the triangle.',
      'When the current is let back down, that same arrow reappears pointing the other way, along the current instead of against it, and the coil is seen pushing the current on rather than holding it back.',
      'Through that letting-down the outermost loops go first, the wash pales, and the triangle shrinks back toward the corner of the plane rather than being wiped away.',
      'At the end the arrows, the loops, the wash and the triangle are all gone and only the coil and the bare straight line are left, so the store is seen to have emptied rather than to have been spent.',
      'The only figures written on the screen are the coil’s own rating and the current it is taken up to; the stored amount, the opposing voltage and the height of the line carry symbols but no numbers.',
    ],

    screen: {
      affordances: [
        'There is nothing to set or drag; the raising, the holding and the letting-down follow one another and begin again, and the reader arrives with the current about half way up and a small triangle already filled.',
        'One accent colour is kept for the stored amount alone and is used for the wash inside the coil, for the triangle and for the symbol inside it, so those three read as one quantity in three places.',
        'The current arrow and the opposing arrow are told apart by which way they point rather than by colour, which is what makes the reversal at the letting-down visible.',
        'The upright direction of the plane is the flux linkage rather than a voltage or a power, so the area standing under the line is an amount of energy directly and no time axis is needed anywhere.',
        'Nowhere is the current, the coil or the end point offered for the reader to change, so the screen does not go on to claim that twice the current banks four times as much.',
      ],
    },

    useWhen: [
      'The article has given the formula for the energy in a coil and the reader is treating it as a bookkeeping entry. The triangle filling under the line, exactly as the loops stand up, is what makes the half and the square come from somewhere.',
      'The prose has to answer the objection that a coil merely resists and therefore wastes. The same triangle emptying back out, with the opposing arrow turning round to push the current along, shows the store being handed back rather than dissipated.',
      'The reader needs the energy given a place to sit. The wash deepening inside the coil while the loops multiply puts the store in the field rather than in the wire.',
    ],

    avoidWhen: [
      'The article is about a switch being opened, about a spark, or about what happens when a current is cut rather than eased down. The current here is only ever raised and lowered smoothly and no switch appears.',
      'The subject is how long the build-up takes, or the way the current approaches its final value. There is no time axis on this screen and the current is taken up at an even rate.',
      'The point is a second circuit picking up a voltage, or a supply being stepped up or down. Only one coil is drawn and nothing is coupled to it.',
      'What is wanted is a number of joules, a comparison of two coils, or how the store changes when the current is doubled. Only the coil’s rating and the final current are written down, and neither is adjustable.',
      'The article is about a store that swings back and forth between two places. Here it fills once and empties once, with a flat stretch in between.',
    ],

    contrastWith: [
      {
        concept: 'mutual-inductance',
        note: 'Both begin from a current being changed, but one follows the voltage that change raises in a coil standing apart, while this one follows what the change deposits in the coil doing the changing.',
      },
      {
        concept: 'rl-circuit',
        note: 'One asks what is banked by the time the current is up; the other asks why getting it up takes any time at all and who is holding the supply voltage meanwhile.',
      },
      {
        concept: 'lc-oscillation',
        note: 'One fills a single store and empties it once, so the store can be weighed on its own; the other never lets it rest, passing it back and forth between two stores of different kinds.',
      },
      {
        concept: 'elastic-potential-energy',
        note: 'Both bank work against something that pushes back and return it in full, and both grow as a square, but one is banked by deforming matter and the other by setting up a field with no moving part.',
      },
    ],
  },
};
