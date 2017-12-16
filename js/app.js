if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    StartAudioContext(Tone.context, 'body').then(function(){
      console.log(Tone.context)
    });
  }

  Vue.use(Buefy.default);


var vuetone = new Vue({
  el:'#vuetone',
  components: {
    'vueSlider': window[ 'vue-slider-component' ]
  },
  data: {
    scale:'',
    open: {
      metronome:true,
      keys:true,
      synth:true,
      field:true,
      chords:false
    },
    base:440,
    root:0,
    octaves:[2,4],
    vol: 70,
    notes:Chroma.Notes,
    chords:Chroma.Chords,
    scales:Chroma.Scales,
    scale:Chroma.Scales.major,
    colors:['#fff','#e0e', '#005'],
    band:{}
  },
  methods: {
    chroma: chroma,
    average: chroma.average,
    mixChord: function (pitch,chord) {
      let colors=[];
      for (let i=0;i<chord.length;i++) {
        colors[i]=chroma((pitch+chord[i])*30,1,0.5,'hsl')
      }
      return chroma.average(colors, 'rgb').saturate(3).brighten(2)
    },
    play: function (note, octave, id) {
      console.log(note.pitch, octave);
      Tone.chromaSynth.triggerAttack(Tone.calcFrequency(note.pitch,octave))
    },
    playChord: function (pitch, chord) {
      console.log(chord.length)
      for (i=0;i<chord.length; i++) {

        Tone.chromaSynth.triggerAttackRelease(Tone.calcFrequency(pitch+chord[i],4), '4n','+'+i/6);
      }

    },
    playOnce: function (note, octave, id) {
      console.log(note.pitch, octave);
      Tone.chromaSynth.triggerAttackRelease(Tone.calcFrequency(note.pitch,octave))
    },
    stop: function (note, octave, id) {
  //    console.log(note, octave);
      Tone.chromaSynth.triggerRelease(Tone.calcFrequency(note.pitch,octave))
    }
  },
  computed: {
    mixedColors: function () {
      return chroma.mix(this.color1,this.color2,0.5,'rgb')
    },
    octavesNum: function() {
      let octs = [];
      for (let i=this.octaves[1];i>=this.octaves[0];i--) {
        octs.push(i);
      }
      return octs
    },
    setOsc: function () {
        Tone.chromaSynth.set('oscillator.type',this.oscType)
      return this.oscType.substr(0,3).toUpperCase()
    },
    setVolume: function () {
      Tone.context.volume.volume.value=this.vol
      return (this.vol/5+10).toFixed(1)
    },
    setAttack: function () {
      Tone.chromaSynth.set('envelope.attack', this.attack*0.005)
      return (this.attack*0.005).toFixed(2)
    },
    setDecay: function () {
      Tone.chromaSynth.set('envelope.decay', this.decay*0.005)
      return (this.decay*0.005).toFixed(2)
    },
    setSustain: function () {
      Tone.chromaSynth.set('envelope.sustain', this.sustain*0.005)
      return (this.sustain*0.005).toFixed(2)
    },
    setRelease: function () {
      Tone.chromaSynth.set('envelope.release', this.release*0.005)
      return (this.release*0.005).toFixed(2)
    }
  },
  created: function () {
    Tone.calcFrequency= function(pitch,octave) {
      return 440 * Math.pow(2, (octave-4) + (pitch / 12))
    };
    Tone.ongoingTouchIndexById = function (ongoingTouches, idToFind) {
          for (var i = 0; i < ongoingTouches.length; i++) {
            var id = ongoingTouches[i].identifier;
            if (id == idToFind) {
              return i;
            }
          }
          return -1;    // not found
    };
    Tone.checkActive = function (pitch,root,steps) {
      let act = pitch-root;
      if (act<0) {act=act+12}
      return steps[act]
    }
    Tone.copyTouch= function (touch,rect) {
      clientX = touch.clientX;
      clientY = touch.clientY;
      let pitch,octave,active=0;
      pitch = Math.floor((clientX-rect.left)/(rect.width/12));
      octave = Math.floor((rect.bottom-clientY)/(rect.height/9));
      if (pitch>11) {pitch=11} else if (pitch<0) {pitch=0};
      if (octave>8) {octave=8} else if (octave<0) {octave=0};
    //  if (Chroma.scale.steps[pitch]) {active=1};

      return {
        identifier: touch.identifier,
        clientX: touch.clientX,
        clientY: touch.clientY,
        pitch:pitch,
        octave:octave,
        active:active
       }
    };
    Tone.chromaOptions={
      oscillator  : {
        type  : 'triangle'
      },
      envelope  : {
        attack  : 0.005 ,
        decay  : 0.1 ,
        sustain  : 0.3 ,
        release  : 1
      }
    };
    Tone.chromaSynth = new Tone.PolySynth(12,Tone.Synth);
    Tone.context.volume = new Tone.Volume(0).toMaster();
    Tone.chromaSynth.connect(Tone.context.volume);
  }
});
