import Vue from '../assets/vue.min.js'
import Buefy from '../assets/buefy.js'
import StartAudioContext from '../assets/StartAudioContext.js'

Vue.use(Buefy.default)

Vue.prototype.$midiBus = new Vue(); // Global event bus

import {longitudal} from './components/longitudal.js'
import {pitchTable} from './components/pitch-table.js'
import {toneGrid} from './components/tone-grid.js'
import {field} from './components/field.js'
import {noise} from './components/noise-generator.js'
import {beats} from './components/beats.js'
import {tonalArray} from './components/tonal-array.js'
import {synth} from './components/synth.js'
import {keyStack} from './components/key-stack.js'
import {tunings} from './components/tunings.js'
import {harmonics} from './components/harmonics.js'
import {scaleWheel} from './components/scale-wheel.js'
import {radiation} from './components/radiation.js'
import {midiBus} from './components/midi-bus.js'
import {midiMonitor} from './components/midi-monitor.js'
import {oscilloscope} from './components/osc.js'
import {scales} from './components/scales.js'

const components = {
  longitudal,
  pitchTable,
  toneGrid,
  field,
  noise,
  beats,
  tonalArray,
  synth,
  keyStack,
  tunings,
  harmonics,
  scaleWheel,
  radiation,
  midiBus,
  midiMonitor,
  oscilloscope,
  scales
}


const ct = new Vue({
  el:"#chromatone",
  components,
  data: {
    channels:{},
    components: [
      'beats',
      'scales',
      'synth',
      'tone-grid',
      'field',
      'tonal-array',
      'key-stack',
      'pitch-table',
      'oscilloscope',
      'tunings',
      'harmonics',
      'midi-monitor',
      'longitudal',
      'radiation',
      'scale-wheel',
      'noise'
    ],
    opened:'beats'
  },
  mounted: function() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      StartAudioContext(Tone.context, "button").then(function() {});
    }
  }

})
