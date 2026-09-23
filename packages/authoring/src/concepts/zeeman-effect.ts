/**
 * zeeman-effect 개념 선언.
 *
 * 자기 갈림 둘 가운데 **빛 쪽**이다.
 *   stern-gerlach  자리가 고르지 않은 자기장이 날아가는 원자 빔을 두 자리로만 보낸다
 *   zeeman-effect  **고른** 자기장이 위 준위를 셋으로 가르고, 그 결과 스펙트럼 선 하나가
 *                  세 줄이 된다 — 자기장을 키우면 간격이 벌어진다
 * 이쪽만 준위 그림 · 분광기 창 · 파장 눈금 · 자기장 세기 어휘를 갖는다. 날아가는 원자도
 * 닿은 자리도 여기 없고, 저쪽에는 빛도 준위도 없다.
 * 이미 선언된 `spin` 을 가리키지 않는다 — 다른 묶음이 쓰는 중이다. 정상 제이만만 다루므로
 * 스핀을 내용에서도 끌어들이지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const zeemanEffectConcept: Aperi21ConceptSource = {
  id: 'zeeman-effect',
  label: 'Splitting of a Spectral Line in a Magnetic Field',
  canonicalSim: 'aperi21:zeeman-effect',

  surface: {
    definition:
      'What a magnetic field does to the light an atom gives out: one upper level separates into three, a single spectral line becomes three lines, and a stronger field spreads them further apart.',
    exemplarKeywords: [
      'the Zeeman effect',
      'a spectral line splitting in a magnetic field',
      'magnetic sublevels',
      'the normal Zeeman effect',
      'why does one line become three',
      'levels labelled by more than energy',
      'the splitting grows with the field',
      'measuring magnetic fields in sunspots from the spectrum',
      'a degenerate level pulled apart',
      'energy of an atom depending on how it is oriented',
      'the cadmium red line in a magnet',
    ],
  },

  briefing: {
    observable: [
      'The screen is in two halves. On the left, energy levels drawn as horizontal bars; on the right, a dark window in which coloured lines stand, the window read left to right as wavelength.',
      'Above the window a gauge carries a pointer, marked at three field strengths from zero upward.',
      'With the pointer at zero the upper level is a single bar, three drops of the same length fall from it to the lower bar, and in the window there is one red line, dead centre.',
      'As the pointer travels to the middle mark, the upper bar opens out like a fan into three bars at different heights, the three drops take on different lengths, and at that same moment the line in the window parts into three that move out from the centre.',
      'Once the three have separated, a label appears beside each upper bar naming which one it is.',
      'The three lines in the window are all the same colour, and the three drops on the left are that same colour too. They differ only in where they stand.',
      'Sent on to the top mark, the pointer pulls both the bars and the lines further apart, and the spacing is plainly about twice what it was.',
      'Faint marks are left just outside the window at the places the three lines stood at the middle setting, so the second spacing can be held against the first.',
      'A short bar below the window is labelled with the tiny width of wavelength the whole window covers.',
      'The pointer then runs back to zero, the labels go, the three lines slide together into one, and the upper bars close back into a single bar.',
      'The only writing is the three field strengths, the three level names and the width of the window.',
    ],

    screen: {
      affordances: [
        'There is nothing to press. The field is switched on, turned up and switched off again on its own, and the round repeats.',
        'The levels and the window are put side by side and change at the same moment, so the cause and the visible result are one look rather than two.',
        'The three drops on the left and the three lines in the window stand in the same order, so the lowest-wavelength line can be traced back to the drop that produced it by position alone.',
        'All three lines carry one colour, because their wavelengths differ by far less than any colour difference; position is the only thing that separates them.',
        'The window sits at true wavelength scale, with its width written out, while the level picture is drawn far more open than the real energy shift, which would otherwise be a single bar.',
        'The faint marks from the earlier field strength are kept outside the window rather than inside it, so they are not taken for lines of their own.',
        'The level names appear only after the three have parted and are taken away before they close back, so they never sit on top of one another.',
        'The window is drawn as an absence of light, so it reads the same dark whichever way the page is themed and the lines glow out of it.',
        'The field strengths are shown only at the three settings; while the pointer is between them no figure is put up.',
        'It opens with the single line already glowing and the field about to come on.',
      ],
    },

    useWhen: [
      'The article has said that a level needs more than one label and the reader wants that extra label to have a consequence one can see. The upper bar opens into three and the line follows it.',
      'The point is that the effect is tunable rather than fixed: the same line is shown at two field strengths and the spacing plainly doubles.',
      'The reader is being taught to read a level diagram against a spectrum. The drops and the lines change together and keep the same order, so which line came from which level is a matter of position.',
      'The article uses the splitting as a way of measuring a field somewhere unreachable, and the reader needs the spacing to be the thing that carries the field strength.',
    ],

    avoidWhen: [
      'The subject is a beam of atoms pushed sideways by a magnet, or an answer read off where atoms land.',
      'The article is about the full set of lines an element gives, about series of lines, or about telling substances apart by their spectra. Only one line and its immediate neighbourhood are here.',
      'The point is how the three components are polarised, or that what one sees depends on the direction one looks from.',
      'The subject is a line smeared out by motion or by pressure. These lines separate cleanly and come back together again.',
      'The article turns on the splitting being uneven or on more than three components appearing.',
      'The figures wanted are the energy shift in electronvolts or the wavelength shift in nanometres. Only the field strengths and the width of the window are written.',
    ],

    contrastWith: [
      {
        concept: 'stern-gerlach',
        note: 'One leaves atoms where they are in an even field and reads the answer off the colours they give out; the other sends them through a field that changes from place to place and reads it off where they land.',
      },
      {
        concept: 'magnetic-dipole',
        note: 'One gives the energy a small magnet has in a field according to how it lies; the other finds that only a few such energies occur and shows them as separate lines.',
      },
      {
        concept: 'stellar-spectral-class',
        note: 'One sorts stars by which lines their light shows and how strong each is; the other takes a single line and shows an outside field pulling it into several.',
      },
      {
        concept: 'diffraction-grating',
        note: 'One is about the instrument that spreads light out by wavelength in the first place; the other about something happening to the light before it ever reaches an instrument.',
      },
      {
        concept: 'particle-in-a-box',
        note: 'One is about which levels exist at all because a particle is penned in; the other about a level that already exists being pulled apart into several by a field from outside.',
      },
    ],
  },
};
