/**
 * thin-film-interference 개념 선언.
 *
 * 두께가 주어인 둘 가운데 **한 자리의 두께가 색을 정하는** 쪽이다.
 *   thin-film-interference  두께가 변하는 방향 = 시간(막이 흘러내린다) · 자리(위아래).
 *                           주장 = **지워지는 파장이 옮겨 가고 남은 빛이 그 자리의 색이 된다**
 *   newtons-rings           두께는 자리마다 정해져 있다. 주장 = **고리 간격**이 바깥에서 촘촘해진다
 * 이쪽만 「색 · 비눗방울 · 기름막 · 스펙트럼의 골 · 흰빛에서 한 파장이 빠진다」 어휘를 갖고,
 * 고리 · 간격 · 촘촘함은 쓰지 않는다. 단색광도 쓰지 않는다 — 여기서 빛은 흰빛이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const thinFilmInterferenceConcept: Aperi21ConceptSource = {
  id: 'thin-film-interference',
  label: 'The Colour a Film’s Thickness Leaves Behind',
  canonicalSim: 'aperi21:thin-film-interference',

  surface: {
    definition:
      'The colour a transparent film of a given thickness shows in white light: one wavelength is cancelled out of the reflected light at each thickness, and what is left over is the colour seen there.',
    exemplarKeywords: [
      'thin film interference',
      'soap bubble colours',
      'oil slick on a wet road',
      'why a soap film shows bands of colour',
      'the colours shift as the film drains and thins',
      'anti-reflection coating on a lens',
      'a wavelength missing from the reflected light',
      'the film goes black just before it bursts',
      'film thickness and the colour you see',
      'coloured fringes on a soap film held upright',
      'interference in a wedge of soap',
    ],
  },

  briefing: {
    observable: [
      'A soap film is held in a wire frame in white light. It is thick at the bottom and thin at the top, and it shows horizontal bands of colour that run steadily downward as the film drains.',
      'The very top of the film is black, and below it comes white, then yellow, then magenta, then blue, in that order as the thickness grows downward.',
      'Beside the frame a profile shows the thickness of the film against height, so how thick the film is at any height can be read off directly.',
      'A ring sits at one height on the film and marks the place being watched; the thickness there is written beside it as a figure in nanometres.',
      'A disc off to the side is filled with the colour that the film shows at that watched place, so the colour being discussed is held separately from the bands.',
      'A third area of the screen plots how much light of each wavelength comes back, with the horizontal axis filled in with the wavelengths themselves, violet through red, so the curve sits over its own colours.',
      'That curve has a dip in it, and as the film drains the dip slides along the wavelength axis. When the dip sits over green the disc and the watched band are magenta; when it has moved down to violet the disc is golden.',
      'The film runs down in a single continuous cycle and is then wiped and re-formed, and the bands begin their descent again.',
      'The thickness figure at the watched place falls steadily — around five hundred nanometres, then three hundred, then two hundred and below — as the drain goes on.',
    ],

    screen: {
      affordances: [
        'The ring can be dragged up and down the middle of the film to watch a different height, and the thickness figure, the disc colour and the dip in the curve all follow it at once.',
        'The film drains by itself throughout, so the same watched height meets one thickness after another without anything being moved.',
        'The film and the disc are painted with light worked out from the same thickness-to-colour calculation, so the colour on the disc is the colour of the band it was taken from rather than a chosen swatch.',
        'The wavelength axis is filled in with its own colours, which is what lets the position of the dip be read as a colour rather than as a number.',
        'The black at the very top of the film is what a vanishing thickness gives, and it stays black in either theme because the film is drawn as light rather than as ink.',
        'The only figure written is the thickness at the watched place, in nanometres, with a scale on the curve for the wavelength axis.',
      ],
    },

    useWhen: [
      'The article has said that the colour of a soap bubble comes from the thickness of its skin, and the reader cannot connect a thickness to a colour. Dragging the ring and watching a number, a dip and a colour move together makes the connection something to follow.',
      'The point being made is subtractive: the colour seen is white light with one wavelength taken out. The curve with its travelling dip, sitting over the wavelengths themselves, is exactly that statement drawn.',
      'The reader has noticed that a draining bubble goes black before it pops and takes it for the film disappearing. The black at the top of the film, where the thickness has run to almost nothing, is the answer.',
    ],

    avoidWhen: [
      'The subject is rings between a curved surface and a flat one, or how the spacing of fringes changes across a pattern. There are no rings here, and the bands are not measured or counted.',
      'The article needs the condition written out — the extra path in the film, the half-wavelength shift on reflection, the order of the band. No rays, no phase reversal and no formula are drawn; there is a thickness and a colour.',
      'The colours in question come from splitting white light by direction, from a prism or from ruled openings. Here nothing is spread out into a spectrum on screen except the axis of the curve; the film’s colour is what survives at one place.',
      'The point is that light is cancelled by two sources, or by waves meeting out of step by a named amount. There is one film here, and what varies is its thickness rather than an offset between two waves.',
      'The subject is a coating designed to kill reflection at one wavelength, worked out for a chosen thickness. The film here drains through every thickness in turn and none is singled out as designed.',
      'The article asks for the absolute amount of light reflected, for the angle of viewing, or for how the colours change as the bubble is tilted. Light arrives one way only, and the vertical scale of the curve carries no figures.',
    ],

    contrastWith: [
      {
        concept: 'newtons-rings',
        note: 'Both have a gap whose thickness decides what comes back, and they part on what is asked of it — one asks what colour a given thickness leaves in white light, the other asks how the places of equal thickness are spaced out.',
      },
      {
        concept: 'constructive-destructive',
        note: 'One has the offset set by a physical thickness and asks which wavelength it wipes out; the other names the offset directly and watches the size of a single sum change.',
      },
      {
        concept: 'diffraction-grating',
        note: 'Both give colour out of white light, by opposite operations — one takes a wavelength away at each place, the other sends each wavelength to a place of its own.',
      },
      {
        concept: 'interference',
        note: 'One has thickness decide, at each place and moment, which wavelength cancels; the other has position alone decide whether anything moves, with a single wavelength throughout.',
      },
    ],
  },
};
