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
    calcFrequency: function (pitch,octave,base) {
      // For a twelve-tone, equally-tempered tuning,
      // frequency is given by the general formula:
      // freq = baseFreq * 2 ^ (intervalInSemitones / 12 )
      base=base||440;
      octave=octave||0;
      return base * Math.pow(2, (octave-4) + (pitch / 12)); // center around octave == 4, pitch == 0
    },
    play:function (id,pitch,octave,shift) {
        //Creates an oscillator for each pitch and starts it
        //It makes a two-dimensional array for notes from 0 to 11 in every octave
        this.band[id]={};
            this.band[id].osc=this.audio.createOscillator();
            this.band[id].osc.type=this.oscType;
            this.band[id].gain=this.audio.createGain();
            this.band[id].gain.gain.value=0;
            this.band[id].osc.connect(this.band[id].gain);
            this.band[id].gain.connect(this.filter);
            this.band[id].osc.frequency.value = this.calcFrequency(pitch,octave);
            this.band[id].osc.start();

              this.band[id].gain.gain.setValueAtTime(0, this.audio.currentTime);
              this.band[id].gain.gain.setTargetAtTime(1, this.audio.currentTime,this.attack);
              this.band[id].gain.gain.setTargetAtTime(this.sustain, this.audio.currentTime+this.attack,this.decay);

    },
    stop: function (id,pitch,octave,shift) {
        let note = Number(pitch);
        octave=Number(octave||0);
        if (shift) {octave=Number(octave)+Number(shift)};
         if (this.band && this.band.hasOwnProperty(id)) {
           this.band[id].gain.gain.cancelScheduledValues(this.audio.currentTime);
           this.band[id].gain.gain.setTargetAtTime(0, this.audio.currentTime,this.release);
         }
         if(id) {
            this.band[id].osc.stop(this.audio.currentTime +10);
          }
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
    setVolume: function () {
      this.volume.value = 1-Math.sin((1-this.vol/100)* 0.5*Math.PI);
      return Math.round(this.volume.value*100)
    }
  },
  created: function () {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audio = new AudioContext();
    var output = this.audio.createGain();
    output.gain.value=0.2;
    this.volume = output.gain;
    output.connect(this.audio.destination);
    this.filter = this.audio.createBiquadFilter();
    this.filter.connect(output);
    this.filter.type='lowshelf';
    this.filter.frequency=15000;
    this.filter.Q=0.8;
    this.band = {};
  }
});
