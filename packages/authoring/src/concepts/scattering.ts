/**
 * scattering 개념 선언.
 *
 * 이 묶음에서 유일하게 **빛이 사방으로 흩어지는** 조각이다. 나머지 아홉은 줄기 · 무늬 · 떨림을 다룬다.
 * 주어는 **입자의 크기**다 — 주장 = 파장보다 훨씬 작은 입자는 **파란빛을 사방으로**,
 * 파장보다 큰 물방울은 **모든 색을 앞쪽으로** 흩는다.
 *
 * 화면이 다루는 것은 **흩어진 빛**이다. 지나간 빛에서 파랑이 빠져 붉어지는 것(노을)은 다루지 않으므로
 * 그쪽 글은 avoidWhen 으로 되돌린다. 이미 선언된 `specular-diffuse-reflection`(거친 면에서 사방으로
 * 되튄다)과는 **면이냐 알갱이냐 · 색이 갈리느냐**로 갈린다.
 *
 * 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const scatteringConcept: Aperi21ConceptSource = {
  id: 'scattering',
  label: 'How Particle Size Decides the Scattered Light',
  canonicalSim: 'aperi21:scattering',

  surface: {
    definition:
      'How the size of a particle decides what it does with light: particles far smaller than the wavelength throw blue out in every direction, while droplets larger than it throw every colour forward together.',
    exemplarKeywords: [
      'scattering of light',
      'why the sky is blue',
      'why clouds are white',
      'particles much smaller than the wavelength of light',
      'cloud droplets scatter all colours alike',
      'light thrown forward by large droplets',
      'blue thrown out sideways and backwards as well',
      'fog and haze look white or grey',
      'dust and air molecules in a sunbeam',
      'small particles favour short wavelengths',
      'the size of the particle compared with the wavelength',
    ],
  },

  briefing: {
    observable: [
      'Two lanes are stacked one above the other, each a dark field with its own name, and the very same white beam enters each in turn from the left.',
      'The beam is drawn as a rippling white line, and one ripple is bracketed and marked as a wavelength, so everything in the lanes can be compared against it by eye.',
      'The upper lane holds particles far smaller than that marked ripple; the lower lane holds droplets whose diameter is plainly bigger than it.',
      'The beam’s leading edge crosses the upper lane, and each particle it reaches begins throwing out short strokes of light. They go forward, backward and sideways alike, and they are blue.',
      'The same beam then enters the lower lane. Each droplet the front reaches begins throwing out strokes too, but these are white and they are bunched into the direction the beam was already going.',
      'Every stroke fades as it travels outward, and new ones keep setting off, so the spread of directions fills in as the beam runs.',
      'One particle in each lane stands apart from the crowd, and around it a dashed outline summarises the directions it throws light: a peanut shape, front and back alike, in the upper lane, and a forward-pointing needle in the lower.',
      'The two lanes then run together so that the blue peanut and the white needle stand in one picture.',
      'The colours are not painted on: the strokes and the outlines take the colour of white light after the scattering has weighted the wavelengths, which is what makes one blue and the other white.',
      'The beam itself keeps its colour all the way across both lanes, and nothing is given a figure — no diameter, no wavelength, no angle and no fraction.',
    ],

    screen: {
      affordances: [
        'The round runs by itself — the small particles first, then the droplets, then both together — and repeats, with nothing to press.',
        'The marked ripple in the beam is the ruler for the whole picture, which is what turns much smaller than the wavelength and larger than the wavelength into something read by eye.',
        'The particle sizes are drawn out of true scale, since real air molecules and cloud droplets cannot share one picture; only the comparison with the wavelength is kept honest.',
        'The strokes are drawn as light on a dark field in both lanes, so their colours are compared under the same conditions.',
        'The strokes of each particle are equal in number between the lanes, which makes the comparison one of direction and colour rather than of how much light is thrown.',
        'The lone particle in each lane carries a dashed outline that sums up the many strokes as one shape, so the pattern is available in a single glance as well as in the crowd.',
        'The directions are drawn as angles in the plane of the picture, so a spread that is even front and back reads as even.',
      ],
    },

    useWhen: [
      'The article has said the sky is blue because small particles scatter blue more, and the reader wonders why a cloud made of the same water and air is white. The two lanes side by side answer both with one variable changed.',
      'The point being made is that size relative to the wavelength is what decides the outcome. The marked ripple lets the reader carry out the comparison themselves rather than take the labels small and large on trust.',
      'The reader knows scattering as a fact about colour and not about direction. The peanut against the needle puts the second half on screen, which is what explains why a cloud is bright in the direction you look through it.',
    ],

    avoidWhen: [
      'The subject is the light that got through rather than the light thrown aside — a reddened sun, a sunset, a distant range looking hazy blue. The beam keeps its colour all the way across here, and nothing is shown being taken out of it.',
      'The article needs how strongly the scattering depends on wavelength, with a power or a ratio in it. No figure appears anywhere, and the strokes are drawn equal in number so they cannot carry an amount.',
      'The point is that scattered light becomes polarised, or that the blue of the sky is polarised. Nothing here shows a direction of vibration.',
      'The subject is reflection from a surface, rough or smooth, or how a rough surface sends light every way. What scatters here are separate particles suspended in the path of a beam.',
      'The article is about particles comparable in size to the wavelength, or about the gradual change between the two cases. Only the two extremes are shown.',
      'The point is how a beam weakens with distance travelled through a medium, or how far one can see through fog. What is followed here is where the scattered light goes, not what is left of the beam.',
    ],

    contrastWith: [
      {
        concept: 'specular-diffuse-reflection',
        note: 'Both send light off in many directions at once, from different agents — one from separate particles small or large compared with the wavelength, which makes colour part of the answer, the other from the roughness of a surface, which treats all colours alike.',
      },
      {
        concept: 'wave-attenuation',
        note: 'One follows where the light removed from a beam goes and what colour it is; the other follows the beam itself growing weaker and does not ask what became of the rest.',
      },
      {
        concept: 'albedo',
        note: 'One asks how one particle redirects light and how its size decides the answer; the other totals up how much of the arriving light a whole world sends back.',
      },
      {
        concept: 'diffraction',
        note: 'Both have light arrive somewhere it was not heading, by different means — one from particles in its path throwing it out, the other from an opening or an edge in a wall it has passed.',
      },
      {
        concept: 'rayleigh-scattering',
        note: 'One answers what a particle of a given size does with light of every colour at once; the other fixes the scatterer and follows one medium over distance, so what is claimed is the colour of the sky and of a low sun rather than the behaviour of a particle.',
      },
    ],
  },
};
