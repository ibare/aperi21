/**
 * capillary-action 개념 선언.
 *
 * 표면 넷 중 하나. 이쪽의 주장은 **높이** 다 — 오목한 면 아래의 압력 부족을 올라온 기둥의
 * 무게가 메울 때까지 오르고, 가는 관일수록 부족이 커서 더 높이 오른다.
 *   capillary-action          부족 → **오름과 멈춤**
 *   laplace-pressure          곡률 → **압력**
 *   surface-tension           같은 당김이 돌아 **받친다**
 *   wetting-and-contact-angle 그 면이 **어떻게 굽을지**를 정하는 각
 * 이쪽만 관 셋 · 압력 칠 · 바깥 수면 점선 · 기둥 높이 · 수은의 하강 어휘를 갖는다.
 *
 * 넷 가운데 유일하게 조작기가 있다(액체 두 칸).
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const capillaryActionConcept: Aperi21ConceptSource = {
  id: 'capillary-action',
  label: 'Capillary Rise and Where the Column Stops',
  canonicalSim: 'aperi21:capillary-action',

  surface: {
    definition:
      'The climb of a liquid up a narrow tube, driven by the shortfall of pressure beneath its curved surface and halted when the weight of the raised column has made that shortfall up.',
    exemplarKeywords: [
      'capillary action',
      'capillary rise',
      'why does water climb higher in a thinner tube',
      'h equals two gamma cos theta over rho g r',
      'water climbing a thin glass tube',
      'mercury goes down in a capillary instead of up',
      'ink soaking through paper',
      'water drawn up a narrow straw',
      'how high will a capillary lift a liquid',
      'what stops the risen column where it does',
    ],
  },

  briefing: {
    observable: [
      'Three upright glass tubes of different bore stand in a shallow dish of liquid, the bores in the ratio one to two to four.',
      'The liquid — in the dish and inside every tube — is painted with the pressure it is under, on a scale that runs from one hue for below the atmosphere, through the background tone for the atmosphere itself, to another hue for above it. A key strip beside the picture carries that scale with three words on it.',
      'A dashed line runs across the picture at the level of the liquid outside the tubes.',
      'The columns genuinely climb. The widest stops first and lowest; the narrowest goes on climbing and ends highest, at four times the widest column’s height.',
      'While a column is still climbing, the colour inside its tube at the dashed line is still on the below-atmosphere side — the shortfall has not yet been made up.',
      'Once a column has stopped, the colour inside the tube at that line matches the dish beside it, and only the part above the line goes on deepening the higher one looks.',
      'A height is written beside each column and keeps up with it as it climbs, so the ratio between the three can be checked as well as seen.',
      'The surface in each tube is drawn as a concave arc, curving more tightly in the narrower bores.',
      'Two chips at the foot of the picture choose the liquid. With the other one the whole thing reverses: the columns go down below the dashed line rather than up, their surfaces bulge the other way, and the colour inside the tubes is on the above-atmosphere side.',
      'The wording under the picture changes from climbing to stopped by the columns’ own heights rather than by a clock, and the picture then stays where it has ended.',
    ],

    screen: {
      affordances: [
        'The run starts by itself with the first liquid and carries the argument through to the columns stopping; the second liquid is there to be pressed for.',
        'Pressing a chip dips the columns again from the start, and pressing the one already chosen does the same, so the climb can be watched over without changing anything.',
        'Nothing rewinds or repeats. Where the columns come to rest is the conclusion, so the picture is left standing at it.',
        'The colour carries one meaning throughout — how far the pressure is from the atmosphere — and the key strip is what makes the painted liquid readable rather than decorative.',
        'The decisive moment is at the dashed line: what has to be compared is the colour just inside a tube against the colour just outside it, at the same height.',
        'The colour scale is normalised to each liquid on its own, so the hues are for comparing places within one run and never across the two.',
        'The bores are widened beyond their true proportion so the curved surfaces can be seen, but the ratio between the three bores is kept, and the three heights share one scale.',
      ],
    },

    useWhen: [
      'The article has given the height as inversely proportional to the radius and the reader wants to know what does the lifting and why it stops. The colour inside the tube at the dashed line closing on the colour outside is that answer, moment by moment.',
      'The article has mentioned that some liquids are driven down a capillary rather than up, and what is wanted is the same picture with every sign reversed rather than a second explanation.',
      'The reader has the idea that something in the tube pulls the liquid along its length. Three columns that stop at three different heights, each when its own weight matches its own shortfall, puts the stopping where it belongs.',
    ],

    avoidWhen: [
      'The subject is the angle a liquid makes against a solid, or why one surface is wetted and another is not. Two liquids curve opposite ways here, but no angle is drawn and the glass is never changed.',
      'The claim is about a closed bubble or drop and the pressure it holds. Everything here is open to the air above and joined to a dish below.',
      'The point is a surface holding a body up, or the pull acting along a surface. No force arrow appears anywhere — the argument is made in colour, height and shape.',
      'Values in pascals are wanted. The painted colours are scaled separately for each liquid and are not a reading of pressure.',
      'The subject is how fast a liquid is driven along a narrow tube, or what resists it. The climbing here is slowed by a chosen factor so it can be watched, and its timing is not part of the claim.',
      'The article is about the pressure on the base of a vessel, or about liquid standing at one level whatever it is held in. These tubes exist precisely to hold liquid away from that level.',
    ],

    contrastWith: [
      {
        concept: 'laplace-pressure',
        note: 'Both start from the pressure a curved surface sets. One follows it into air moving between two films; the other follows it into a weight lifted, which is what fixes a height and brings the motion to a stop.',
      },
      {
        concept: 'wetting-and-contact-angle',
        note: 'One takes the way the surface curves as given and asks how far the liquid is driven by it; the other asks what the solid has to do with that curve being the way it is.',
      },
      {
        concept: 'surface-tension',
        note: 'One is the liquid itself being raised, with its own weight as the load; the other is a body carried on the surface, with the surface’s pull doing the carrying.',
      },
      {
        concept: 'hydrostatic-pressure',
        note: 'One is about a column standing where its weight makes up a shortfall at the top; the other is about pressure read off depth alone in liquid that has been left to lie level.',
      },
      {
        concept: 'pressure-and-container-shape',
        note: 'One is where liquid deliberately refuses to stand at the same level as the liquid beside it; the other is where the level is the same however the vessel is shaped.',
      },
    ],
  },
};
