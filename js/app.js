if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    StartAudioContext(Tone.context, 'body').then(function(){
      console.log(Tone.context)
    });
  }


var vuetone = new Vue({
  el:'#vuetone',
  components: {
    'vueSlider': window[ 'vue-slider-component' ]
  },
  data: {
    scale:'',
    base:440,
    root:0,
    octaves:[2,4],
    vol: 70,
    attack: 200,
    decay: 300,
    sustain:90,
    release: 120,
    oscTypes: ['sine','triangle','square','sawtooth'],
    oscType: 'sawtooth',
    scales:Chroma.Scales,
    scale:Chroma.Scales.major,
    band:{}
  },
  methods: {
    calcFrequency: function(pitch,octave) {
      console.log(pitch, octave)
      octave=octave||4;
      return this.base * Math.pow(2, (octave-4) + (pitch / 12));
    },
    play: function (note, octave, id) {
      console.log(note, octave);
      this.synth.triggerAttack(this.calcFrequency(note.pitch,octave))
    },
    stop: function (note, octave, id) {
      console.log(note, octave);
      this.synth.triggerRelease(this.calcFrequency(note.pitch,octave))
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
        this.synth.set('oscillator.type',this.oscType)
      return this.oscType.substr(0,3).toUpperCase()
    },
    setVolume: function () {
      this.volume.volume.value=this.vol
      return (this.vol/5+10).toFixed(1)
    },
    setAttack: function () {
      this.synth.set('envelope.attack', this.attack*0.005)
      return (this.attack*0.005).toFixed(2)
    },
    setDecay: function () {
      this.synth.set('envelope.decay', this.decay*0.005)
      return (this.decay*0.005).toFixed(2)
    },
    setSustain: function () {
      this.synth.set('envelope.sustain', this.sustain*0.005)
      return (this.sustain*0.005).toFixed(2)
    },
    setRelease: function () {
      this.synth.set('envelope.release', this.release*0.005)
      return (this.release*0.005).toFixed(2)
    }
  },
  created: function () {

    this.synth = new Tone.PolySynth(12,Tone.Synth);
    this.volume = new Tone.Volume(0).toMaster();
    this.synth.connect(this.volume);
    console.log(Tone.context)
  }
});
