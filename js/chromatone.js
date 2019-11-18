
if (window.Buefy) {  Vue.use(Buefy.default); }

Vue.prototype.$midiBus = new Vue(); // Global event bus

import {longitudal} from './components/longitudal.js'
import {pitchTable} from './components/pitch-table.js'
import {toneGrid} from './components/tone-grid.js'
import {field} from './components/field.js'
import {noise} from './components/noise-generator.js'
import {beats} from './components/beats.js'
import {tonalArray} from './components/tonal-array.js'

const components = {
  longitudal,
  'pitch-table': pitchTable,
  'tone-grid':toneGrid,
  field,
  noise,
  beats,
  tonalArray
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
    opened:'pitch-table'
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
