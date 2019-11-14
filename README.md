# Chromatone
Visual music language interactive education, research and practice tools

Chromatone is based on a scientifical view of human perception of colors, sounds and their relationships. 
Red is first visible frequency of light spectrum, that we can join in a wheel and equally divide into 12 main colors. A is first among those 12 notes that equally divide cyclical acoustic octaves. So we come up with a connection of two sense systems, that happens in our brain. And it appears to be a great tool to better feel and understand music, visual design and beyond.

We develop a toolset for anyone who wants to see music and hear colors by themselves. Essentially it's an artifical synesthesia development toolkit. And you can use it to learn and teach, explore and compose, memorize and visualize music and even convert pictures to melodies.

Chromatone apps are built around Vue.js components in a modular way. We're not using any backend build procedures, so anyone with a modern browser can directly open the source files directly on a computer or even a mobile locally. The apps we utilize such features as:
  
- [Web Audio API](https://developer.mozilla.org/ru/docs/Web/API/Web_Audio_API)
- [Canvas API](https://developer.mozilla.org/ru/docs/Web/API/Canvas_API)
- [SVG](https://developer.mozilla.org/ru/docs/Web/SVG)
- [WebGl](https://developer.mozilla.org/ru/docs/Web/API/WebGL_API)
  
We use different JS frameworks:
- [Vue.js](https://vuejs.org/) to build a modular components system
- [Buefy](https://buefy.org/) to build UI
- [Tone.js](https://tonejs.github.io/) to deal with sound synthesis and processing
- [Zdog.js](https://github.com/metafizzy/zdog) to create 3D illustrations
  
  We divide the components by main function: to learn or to explore. The difference is in the level of interactivity. 
  
LEARN modules
------
- EM Radiation
- Longitudal waves
- Harmonics
    
EXPLORE modules
------
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
    
The project is non-commercial and is in early development state now. It requires not only a lot of coding, testing and debugging, but also some architectural thought on how to construct a really flexible, but simple audio-visual interactive component system, that can be used to build a big range of complex educational and explorational tools by music and design enthusiasts.
  
If you are willing to help, check our current [Projects](https://github.com/DeFUCC/chromatone/projects) status, pick some of our [Issues](https://github.com/DeFUCC/chromatone/issues), or just email your thoughts to davay@frkt.ru. 
