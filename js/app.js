Vue.use(Buefy.default);

// Vue.use(VueLocalStorage);



var vuetone = new Vue({
  el: "#vuetone",
  components: {
    vueSlider: window["vue-slider-component"]
  },
  data: {
    open: {
      beat: true,
      scales: true,
      synth: true,
      grid: true,
      field: false,
      array: false,
      keys: false,
      table:false,
      oscilloscope: false
    },
    base: 440,
    root: 0,
    octaves: [2, 4],
    vol: -5,
    notes: Chroma.Notes,
    chords: Chroma.Chords,
    scales: Chroma.Scales,
    scale: Chroma.Scales.minor,
    colors: ["#fff", "#e0e", "#005"],
    band: {}
  },
  methods: {
    play: function(note, octave, id) {
      //  console.log(note.pitch, octave);
      Synth.chromaSynth.triggerAttack(Synth.calcFrequency(note.pitch, octave));
    },

    playOnce: function(note, octave, id) {
      //  console.log(note.pitch, octave);
      Synth.chromaSynth.triggerAttackRelease(
        Synth.calcFrequency(note.pitch, octave)
      );
    },
    stop: function(note, octave, id) {
      //    console.log(note, octave);
      Synth.chromaSynth.triggerRelease(Synth.calcFrequency(note.pitch, octave));
    }
  },
  computed: {
    octavesNum: function() {
      let octs = [];
      for (let i = this.octaves[1]; i >= this.octaves[0]; i--) {
        octs.push(i);
      }
      return octs;
    },
    setVolume: function() {
      Synth.volume.volume.value = this.vol;
      return (this.vol / 5 + 10).toFixed(1);
    },
    activeSteps: function() {
      let activeSteps = Synth.arrayRotate(this.scale.steps, -this.root);
      return activeSteps;
    },
    activeNotes() {
      this.notes.map( (note,i) => note.active = this.activeSteps[i] );
      return Synth.arrayRotate(this.notes,this.root)
    }
  },
  created: function() {

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
});
