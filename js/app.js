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
      Tone.chromaSynth.triggerAttack(Tone.calcFrequency(note.pitch, octave));
    },

    playOnce: function(note, octave, id) {
      //  console.log(note.pitch, octave);
      Tone.chromaSynth.triggerAttackRelease(
        Tone.calcFrequency(note.pitch, octave)
      );
    },
    stop: function(note, octave, id) {
      //    console.log(note, octave);
      Tone.chromaSynth.triggerRelease(Tone.calcFrequency(note.pitch, octave));
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
      Tone.volume.volume.value = this.vol;
      return (this.vol / 5 + 10).toFixed(1);
    },
    activeSteps: function() {
      let activeSteps = Tone.arrayRotate(this.scale.steps, -this.root);
      return activeSteps;
    },
    activeNotes() {
      this.notes.map( (note,i) => note.active = this.activeSteps[i] );
      return Tone.arrayRotate(this.notes,this.root) 
    }
  },
  created: function() {
     Tone.arrayRotate = function(A,n,l=A.length) {
		  const offset = (((n % l) + l) %l)
		  return A.slice(offset).concat(A.slice(0,offset))
		}

    Tone.calcFrequency = function(pitch, octave=3) {
      return Number(440 * Math.pow(2, octave - 4 + pitch / 12));
    };
    Tone.ongoingTouchIndexById = function(ongoingTouches, idToFind) {
      for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;
        if (id == idToFind) {
          return i;
        }
      }
      return -1; // not found
    };
    Tone.checkActive = function(pitch, root, steps) {
      let act = pitch - root;
      if (act < 0) {
        act = act + 12;
      }
      return steps[act];
    };
    Tone.copyTouch = function(touch, rect) {
      let clientX = touch.clientX;
      let clientY = touch.clientY;
      let pitch,
        octave,
        octH,
        octMix,
        octTwo,
        active = 0;
      octH = (rect.bottom - clientY) / (rect.height / 9);
      pitch = Math.floor((clientX - rect.left) / (rect.width / 12));
      octave = Math.floor(octH); 
      octMix=1-Math.abs(octH-octave-0.5)  //smooth octave shift experiment
      octTwo = Math.round(octH) > octave ? octave + 1 :
octave-1;
      if (pitch > 11) {
        pitch = 11;
      } else if (pitch < 0) {
        pitch = 0;
      }
      if (octave > 8) {
        octave = 8;
      } else if (octave < 0) {
        octave = 0;
      }
      //  if (Chroma.scale.steps[pitch]) {active=1};

      return {
        identifier: touch.identifier || 0,
        clientX: touch.clientX,
        clientY: touch.clientY,
        pitch,
        octave,
        octTwo,
        octMix
      };
    };
    Tone.chromaOptions = {
      gain: 1,
      portamento: 0,
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.15,
        decay: 0.4,
        sustain: 0.7,
        release: 1
      }
    };

    Tone.chromaSynth = new Tone.PolySynth(12, Tone.Synth);
    Tone.analyser=Tone.context.createAnalyser().toMaster()
    Tone.analyser.fftSize = 2048;
    Tone.volume = new Tone.Volume(0).connect(Tone.analyser);
    Tone.synthVolume = new Tone.Volume(1).connect(Tone.volume);
    Tone.chromaSynth.connect(Tone.synthVolume);
    Tone.mainSynth = Synth.mono;
    Tone.quantization = "@32n";
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
