/**
 * hydrogen-spectrum 개념 선언.
 *
 * 원자 다섯을 **무엇을 주장하는가** 로 갈랐다. 이쪽은 **쌓인 결과** 다.
 *   hydrogen-spectrum       많은 낙차가 띠의 **몇 자리에만** 쌓인다 — 이어진 무지개가 아니다
 *   bohr-model              전자 하나가 허용된 궤도 사이를 **건너뛰고** 빛 하나가 나온다
 *   atomic-orbital          잴 때마다 한 자리, 그 자리들이 쌓인 것이 구름이다
 *   pauli-exclusion         자리는 (준위, 스핀) 한 쌍이라 둘씩만 — 위층으로 밀린다
 *   electron-configuration  채우는 순서가 주기율표의 모양이 된다
 * 이쪽만 「선 스펙트럼 · 파장 띠 · 같은 낙차 = 같은 색 · 비어 있는 자리」 어휘를 갖는다.
 * 궤도 반지름 · 도약의 기하는 `bohr-model` 의 것이라 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const hydrogenSpectrumConcept: Aperi21ConceptSource = {
  id: 'hydrogen-spectrum',
  label: 'Line Spectrum of Hydrogen',
  canonicalSim: 'aperi21:hydrogen-spectrum',

  surface: {
    definition:
      'Why glowing hydrogen sends out light at only a handful of wavelengths: every fall between the same two levels gives the same colour, so repeated falls build a few bright lines and leave the rest empty.',
    exemplarKeywords: [
      'hydrogen spectrum',
      'line spectrum',
      'emission spectrum',
      'Balmer lines',
      'why is the spectrum not a continuous rainbow',
      'bright lines from a gas discharge tube',
      'spectral lines of a gas',
      'atomic fingerprints of an element',
      'red line at 656 nanometres',
      'ultraviolet and infrared light that never reaches the visible band',
      'gaps between the lines',
    ],
  },

  briefing: {
    observable: [
      'The left side holds a staircase of level lines, numbered from the bottom, with the higher ones crowding together and a mark showing that the scale has been broken between the lowest and the one above it.',
      'Several particles sit on those lines at once. Each is lifted up the staircase and then falls back down, one step at a time.',
      'Every fall leaves a short mark spanning the two levels it fell between, and that mark is drawn in the colour of the light that fall produces. The same pair of levels always leaves the same colour.',
      'From that mark a small travelling thing sets off toward the right, in the same colour as the mark.',
      'The right side is a wide band, laid out by wavelength, with a very faint rainbow across it so that every colour has a place of its own to land in. Regions outside the visible part are named beyond each end of it.',
      'When one of the travelling things reaches the band it makes a brief flash at its own place, again in the same colour, and the light there grows a little stronger.',
      'As this goes on, only a few narrow lines in the band brighten and stay bright. Everything between them stays as faint as it started.',
      'Falls whose light lies outside the visible range are drawn in grey instead of a colour, and their travelling things curve away past one end of the band toward the named regions rather than landing in it.',
      'The lines that build up never move or spread; each one keeps to the exact place it started at, growing only in strength.',
      'Nothing repeats on a fixed round — falls keep happening at irregular moments and the picture keeps running.',
      'No wavelength and no energy is written anywhere on screen; the level numbering and the names of the regions are all the writing there is.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. Falls happen of their own accord and go on happening; the picture arrives with lines already built up and light already in flight.',
        'The falling mark, the thing that travels, the flash where it lands and the line that grows are all drawn in that fall\'s own colour, so "which fall" and "which line" are tied together without a word being said.',
        'The band is given a faint rainbow underneath, which is what makes the emptiness count: every colour plainly had a place to land, and almost all of those places stay empty.',
        'The staircase is drawn with its scale broken between the lowest level and the rest, since drawing it true to scale would crush the upper levels together and hide their falls; the break is marked rather than hidden.',
        'Above that break the spacing is kept true, so the upper levels really do close up and the lines they make really do crowd toward one end of the band.',
        'Falls that land outside the visible range are kept on screen in grey and sent past the end of the band, so the reader does not conclude that every electron falls to the same level.',
        'Several particles are on the staircase at once rather than one, because the claim is about what many falls add up to.',
        'What has accumulated fades extremely slowly, so the picture never saturates into a still image.',
        'No colour is used as a highlight anywhere; every colour on screen is the colour of some particular light.',
      ],
    },

    useWhen: [
      'The article has shown or described the bright lines of a gas and the reader needs to see why they are lines rather than a spread. Light keeps arriving, and it keeps arriving at the same few places.',
      'The point is the emptiness as much as the brightness. A faint rainbow lies under the whole band, and almost all of it stays untouched while a few places grow bright.',
      'The article needs the link between a particular fall and a particular line to be evident rather than asserted. The mark on the staircase, the light in flight and the line that grows share one colour.',
      'The reader should understand that the lines are not the whole story — that an atom also gives off light no eye sees. Grey emissions leave the staircase and pass beyond the ends of the band.',
    ],

    avoidWhen: [
      'The subject is the geometry of the electron\'s orbits, the radii that are allowed, or a single jump followed from start to finish. The staircase here carries only energies, and many particles fall at once.',
      'The point is that the electron is found at one place per measurement, or what the cloud around a nucleus stands for.',
      'The article is about a hot solid glowing with every colour at once, or about how the peak of such a glow shifts with temperature. The band here is all but empty.',
      'The subject is how an instrument separates light into its colours, or the angles at which it does so. The band here is laid out ready-made and nothing disperses the light.',
      'The article needs wavelengths, level energies, a formula relating them, or the relative strength of one line against another. Nothing is numbered and the falls are drawn evenly rather than in true proportion.',
      'The point is light being absorbed, dark lines against a bright background, or an atom being raised by light of the right colour. The lifting here is not shown as caused by anything.',
    ],

    contrastWith: [
      {
        concept: 'bohr-model',
        note: 'One is about what many falls add up to on a wavelength band; the other follows a single electron through a single jump and asks where the allowed places were and what came out of the change.',
      },
      {
        concept: 'atomic-orbital',
        note: 'Both build a picture out of many repeated events, but one accumulates the colours an atom sends out, while the other accumulates where an electron was found inside it.',
      },
      {
        concept: 'blackbody-radiation',
        note: 'One is a handful of sharp places on an otherwise empty band; the other is a hot body giving out every wavelength at once in a smooth hump whose shape is set by temperature alone.',
      },
      {
        concept: 'stellar-spectral-class',
        note: 'One explains why an element gives its own few wavelengths at all; the other sorts stars by which lines and which overall colour their light shows, taking the existence of such lines as given.',
      },
      {
        concept: 'diffraction-grating',
        note: 'One is about which wavelengths a source has to give; the other is about the instrument that spreads whatever arrives into an angle, and would do so for any light at all.',
      },
      {
        concept: 'photoelectric-effect',
        note: 'Both bind a colour to a definite amount of energy, but one has an atom giving that amount out as light and the other has light delivering it to an electron in a metal.',
      },
    ],
  },
};
