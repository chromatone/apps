if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    var button = document.querySelectorAll('body');
    StartAudioContext(Tone.context, button, function(){
      console.log(button)
    });
  }


var vuetone = new Vue({
  el:'#vuetone',
  components: {
    'vueSlider': window[ 'vue-slider-component' ]
  },
  data: {
    scale:'',
    root:0,
    octaves:[2,4],
    vol: 70,
    attack: 0.1,
    decay: 0.3,
    sustain: 0.4,
    release: 0.4,
    oscTypes: ['sine','triangle','square','sawtooth'],
    oscType: 'sawtooth',
    scales:Chroma.Scales,
    scale:Chroma.Scales.major,
    band:{}
  },
  methods: {
    play: function (note, id) {
      console.log(note, id);
      this.synth.triggerAttack(note)
    },
    stop: function (note, id) {
      this.synth.triggerRelease(note)
    }
  },
  computed: {
    octavesNum: function() {
      let octs = [];
      for (let i=this.octaves[1];i>=this.octaves[0];i--) {
        octs.push(i);
      }
      return octs
    },
    setOsc: function () {
      return this.synth.set('oscillator.type',this.oscType)
    },
    setVolume: function () {
      console.log(this.volume)
      return this.volume.volume.value=this.vol

    }
  },
  created: function () {

    this.synth = new Tone.PolySynth(12,Tone.Synth);
    this.volume = new Tone.Volume(0).toMaster();
    this.synth.connect(this.volume);
    console.log(Tone.context)
  }
});
