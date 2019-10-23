
if (window.Buefy) {  Vue.use(Buefy.default); }

Vue.prototype.$midiBus = new Vue(); // Global event bus

const ct = new Vue({
  el:"#chromatone",
  data: {
    channels:{},
    components: [
      'beat',
      'scales',
      'synth',
      'grid',
      'field',
      'array',
      'keys',
      'table',
      'oscilloscope',
      'tunings',
      'harmonics',
      'midi-monitor',
      'longitudal',
      'radiation',
      'scale-wheel'
    ],
    opened:'beat'
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
