# Chromatone apps

Visual music language interactive education, research and practice tools.

Chromatone is based on a scientific view on human perception of colors, sounds and relationships between them.
Red is first visible frequency of light spectrum, that we can join in a wheel and equally divide into 12 main colors. A is first among those 12 notes that equally divide cyclical acoustic octaves. So we come up with a connection of two sense systems, that happens in our brain. And it appears to be a great tool to better feel and understand music, visual design and beyond.

We develop a toolset for anyone who wants to see music and hear colors by themselves. Essentially it's an artifical synesthesia development toolkit. And you can use it to learn and teach, explore and compose, memorize and visualize music and even convert pictures to melodies.

[chromatone.center](https://chromatone.center)

## Glitch

The most recent version of the apps is at [chromatone.glitch.me](https://chromatone.glitch.me/). You can view and edit all the code online with [Glitch editor](https://glitch.com/edit/#!/chromatone).

## Technologies

Chromatone apps are built around Vue.js components in a modular way. We're not using any backend build procedures, so anyone with a modern browser can directly open the source files on any device locally and online. It's our vision of open source apps built in open browser environment. We monitor the development of Web stardards and it's implemention in different browsers. And using the powers of modern ECMAScript we try to combine different browser APIs:

- [Web Audio API](https://developer.mozilla.org/ru/docs/Web/API/Web_Audio_API)
- [Canvas API](https://developer.mozilla.org/ru/docs/Web/API/Canvas_API)
- [SVG](https://developer.mozilla.org/ru/docs/Web/SVG)
- [WebGl](https://developer.mozilla.org/ru/docs/Web/API/WebGL_API)
- and also DeviceOrientation and more

We use different JS frameworks:

- [Vue.js](https://vuejs.org/) to build a modular components system
- [Buefy](https://buefy.org/) to build UI
- [Tone.js](https://tonejs.github.io/) to deal with sound synthesis and processing
- [Zdog.js](https://github.com/metafizzy/zdog) to create 3D illustrations

We categorize the components by main function: to learn or to explore. The difference is in the level of interactivity and creative possibilities.

# MODULES

## LEARN

- EM Radiation
- Longitudal waves
- Harmonics

## EXPLORE

- Synth
- Beats drum machine
- Field of notes
- Pitch table
- Scale wheel
- Tonal array
- Tunings comparison
- Noise generator
- Basic filters with LFO
- Oscilloscope
- MIDI-monitor

The project is non-commercial and is in early development state now. It requires a lot of coding, testing and debugging, and also some architectural thought. Chromatone apps are an effort to construct a really flexible, yet simple cross-platform audio-visual interactive component system, that can be used to build a big range of complex education and exploration tools by music and design enthusiasts.

If you are willing to help, check our current [Projects](https://github.com/DeFUCC/chromatone/projects) status, pick some of our [Issues](https://github.com/DeFUCC/chromatone/issues), or just email your thoughts to [davay@frkt.ru](mailto:davay@frkt.ru).
