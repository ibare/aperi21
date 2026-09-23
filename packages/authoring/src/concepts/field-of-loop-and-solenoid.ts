/**
 * field-of-loop-and-solenoid 개념 선언.
 *
 * 자기장 만들기 셋 가운데 이쪽은 **모양을 쌓아 만드는 것**이다 — 같은 고리를 겹칠수록
 * 안쪽 선이 곧게 펴져 촘촘해진다.
 *   field-of-loop-and-solenoid  고리를 **겹칠수록** 안이 고르고 세다 · 바깥이 약하다
 *   amperes-law                 닫힌 길을 **한 바퀴 돈 합**은 감싼 전류만 본다
 *   force-between-wires         두 도선이 서로에게 하는 **힘**의 방향
 * 이쪽만 「겹친다 · 감은 수 · 안과 밖 · 선이 곧게 펴진다」 어휘를 갖는다. 한 바퀴의 합 ·
 * 길의 모양은 amperes-law, 당김과 밀어냄은 force-between-wires 에 둔다. 자석과 같아진다는
 * 주장은 magnetic-dipole 의 몫이라 여기서는 극도 자석도 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const fieldOfLoopAndSolenoidConcept: Aperi21ConceptSource = {
  id: 'field-of-loop-and-solenoid',
  label: 'Field Inside a Coil of Stacked Loops',
  canonicalSim: 'aperi21:field-of-loop-and-solenoid',

  surface: {
    definition:
      'That stacking identical current-carrying loops side by side straightens and crowds the lines running through their interior until the field inside is even and strong, while outside it stays sparse and short.',
    exemplarKeywords: [
      'solenoid',
      'field inside a coil of wire',
      'why is the field uniform inside a solenoid',
      'one loop against many loops',
      'stacking turns of wire',
      'magnetic field of a circular current loop',
      'the field outside a solenoid is weak',
      'adding more turns to a coil',
      'field along the axis of a loop',
      'a long coil carrying a current',
    ],
  },

  briefing: {
    observable: [
      'The coil is cut open along its axis and shown from the side, the axis running across the picture, so each loop appears as two wires — a small ringed dot above and a small crossed circle below — joined by a faint upright oval.',
      'One loop alone: the lines squeeze together through the opening and then spread straight out to either side and curl back round the wires, and the arrows sitting on the axis are short.',
      'Identical loops are then set down on either side, fading up as their current rises from nothing, and the arrows travel across from the old field to the new one as they appear.',
      'With three loops the lines have grown in number and run straight through the stretch inside the coil, and the arrows there are longer than they were with one.',
      'With nine loops the inside is filled with straight lines at even spacing, and every arrow along the inside is the same length and points the same way.',
      'At the two ends of the nine-loop coil the lines flare out and loop back round the outside, and directly above and below the middle of the coil the lines are absent and only stubs of arrows are left.',
      'The count of lines rises with the field that makes them — seven strands with one loop, thirteen with three, nineteen with nine — because a new line is started each time the same amount of field has been added up across the middle.',
      'The added loops then fade back to nothing and one loop is left, and the whole thing begins again.',
      'The captions name how many loops are standing at each point, and the wires carrying current are the one thing drawn in the accent colour.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; one loop becomes three, three become nine, and it returns to one on its own.',
        'Strength is told in two ways at once — by how closely the lines run and by how long the arrows are — so the inside being even and the outside being weak can each be read off separately.',
        'The same grid of arrow positions serves all three arrangements, five rows of them across the picture, which lets the arrows move continuously from one arrangement to the next while loops are being added.',
        'Positions right beside a wire are left out of the grid and no line is started out near the wires, so the crowding there does not fill the picture with detail that has nothing to do with stacking.',
        'The very short arrows above and below the outside of the coil are kept rather than dropped, so that weak outside reads as weak rather than as nothing at all.',
        'Adding a loop is done by letting its current rise from nothing, which is why the picture between two arrangements is itself a correct field rather than a dissolve.',
        'The faint upright oval behind each pair of wire marks is what makes the two marks read as the top and bottom of one loop, so that loops can be seen to stack.',
      ],
    },

    useWhen: [
      'The article has stated that the field inside a long coil is uniform and the reader has been given no reason why a heap of round loops should produce anything straight. Watching one loop become three and then nine, with the lines inside pulling straight and evenly apart as it happens, is where the uniformity is earned.',
      'The prose needs the outside of a coil to be weak as a fact of the same picture rather than as a separate assertion, and the emptiness above the middle of the nine-loop coil provides it.',
    ],

    avoidWhen: [
      'The article gives the field of a coil as a formula in the number of turns per length and the current, or wants any strength as a number. Nothing here is numbered and no expression appears.',
      'The point is that a coil behaves like a bar magnet, or that it has a north and a south end. No magnet, no compass and no pole letters are present.',
      'The subject is how a single straight wire is wrapped in circles of field that fall off with distance. This picture begins with a whole loop and is about what happens as loops are added.',
      'The article draws line spacing as a three-dimensional flux, where an even field would put the lines further apart out towards the edges. The spacing here is counted across the flat cut, so an even field shows as evenly spaced lines.',
      'The reader is meant to vary the number of turns themselves, or the current, and see the field respond. Three fixed arrangements are worked through in turn.',
      'The subject is what a coil does to something placed inside it, or what force the coil feels. Only the field itself is drawn.',
    ],

    contrastWith: [
      {
        concept: 'amperes-law',
        note: 'One is about the shape a field takes on when sources are stacked up, and reads strength off the whole picture; the other ignores shape entirely and asks only what a single closed path totals to.',
      },
      {
        concept: 'force-between-wires',
        note: 'One shows what currents together build; the other shows what currents do to one another once one of them is standing in what the other built.',
      },
      {
        concept: 'magnetic-dipole',
        note: 'One is about a coil being more than a loop — the inside changing character as loops are added; the other is about a loop being no different from a magnet once you are far enough away that its insides do not matter.',
      },
      {
        concept: 'field-lines',
        note: 'One takes the crowding of lines as an already-agreed way of showing strength and uses it to say what stacking does; the other puts that agreement itself on trial.',
      },
    ],
  },
};
