// Synth adsr


Vue.component('synth', {
  template:"#synth",
  data: function() {
    return {
      attack: 30,
      decay: 300,
      sustain:90,
      release: 120,
      oscTypes: ['sine','triangle','square','sawtooth', 'pulse', 'pwm'],
      oscType: 'pwm',
    }
  },
  components: {
    'vueSlider': window[ 'vue-slider-component' ]
  },
  computed: {
    setOsc: function () {
        Tone.chromaSynth.set('oscillator.type',this.oscType);
        Tone.chromaOptions.oscillator.type=this.oscType;
      return this.oscType.substr(0,3).toUpperCase()
    },
    setAttack: function () {
      Tone.chromaSynth.set('envelope.attack', this.attack*0.005);
      Tone.chromaOptions.envelope.attack=this.attack*0.005
  //    Tone.chromaOptions.portamento=this.attack*0.005;
      return (this.attack*0.005).toFixed(2)
    },
    setDecay: function () {
      Tone.chromaSynth.set('envelope.decay', this.decay*0.005);
      Tone.chromaOptions.envelope.decay=this.decay*0.005
      return (this.decay*0.005).toFixed(2)
    },
    setSustain: function () {
      Tone.chromaSynth.set('envelope.sustain', this.sustain*0.005);
      Tone.chromaOptions.envelope.sustain=this.sustain*0.005
      return (this.sustain*0.005).toFixed(2)
    },
    setRelease: function () {
      Tone.chromaSynth.set('envelope.release', this.release*0.005);
      Tone.chromaOptions.envelope.release=this.release*0.005
      return (this.release*0.005).toFixed(2)
    }
  }
});






//KEY stack

Vue.component('key-stack', {
  template:'#key-stack',
  data: function () {
    return {
      octaves:[2,4],
      notes:Chroma.Notes
    }
  },
  components: {
    'vueSlider': window[ 'vue-slider-component' ]
  },
  props: {
    steps: {
      type: Array
    },
    root: {
      default:0
    },
    r: {
      default:65
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
    activeSteps: function () {
      let activeSteps = [];
      activeSteps=activeSteps.concat(this.steps.slice(-this.root),this.steps.slice(0,12-this.root));
      return activeSteps
    }
  },
  methods: {
    down: function (note, octave, ev) {
        ev.target.parentNode.style.opacity=1;
        let touches = ev.changedTouches;
      if (ev.type=="touchstart") {
        for (let i=0;i<touches.length;i++) {
          this.$emit('play', note, octave , touches[i].identifier)
        }
      } else {
        this.$emit('play', note, octave, 0)
      }
    },
    up: function (note,octave, ev) {
        ev.target.parentNode.style.opacity=0.8;
        let touches = ev.changedTouches;
      if (ev.type=="touchend" || ev.type=="touchcancel") {
        for (let i=0;i<touches.length;i++) {
          this.$emit('stop', note, octave, touches[i].identifier)
        }
      } else {
          this.$emit('stop', note, octave, 0)
        }
    }
  }
})






// FIELD


Vue.component ('field', {
  template:'#field',
  data: function () {
    return {
      x:0,
      y:0,
      notes:Chroma.Notes,
      ongoingTouches:[]
    }
  },
  props: {
    steps: {
      type:Array
    },
    root: {
      default:0
    }
  },
  computed: {
    activeSteps: function () {
      let activeSteps = [];
      activeSteps=activeSteps.concat(this.steps.slice(-this.root),this.steps.slice(0,12-this.root));
      console.log(activeSteps)
      return activeSteps
    },
    notes108: function () {
      let notes = [];

      for (let i=0;i<9;i++) {
        notes[i]=[];
        for (let j=0;j<12;j++) {
          notes[i][j]=this.notes[j];
          notes[i][j].active = this.activeSteps[j];
        }
      }
      return notes
    }
  },
  methods: {
    playNote: function  (id, pitch, octave) {
//        playingNotes[id]=[pitch,octave];
//          console.log('start '+id +' ('+pitch +','+ octave+') '+active);
          Tone.field[id]= new Tone.Synth(Tone.chromaOptions).connect(Tone.context.volume);
          console.log(Tone.field[id])
          Tone.field[id].frequency = Tone.calcFrequency(pitch,octave);
          Tone.field[id].triggerAttack(Tone.calcFrequency(pitch,octave))
    },
    changeNote: function (id, pitch, octave) {
      Tone.field[id].triggerAttack(Tone.calcFrequency(pitch,octave));
  //    Tone.field[id].triggerAttack(Tone.calcFrequency(pitch,octave))
    },
    stopNote: function (id) {
      Tone.field[id].triggerRelease();
      if (id) {
        setTimeout( function(){
          Tone.field[id].dispose();
          delete Tone.field[id]
          console.log(Tone.field)
        }, Tone.chromaOptions.envelope.release*1000);
      }
    },
    touchStart: function (event) {
      var rect = event.target.getBoundingClientRect();
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {
        let copy = Tone.copyTouch(touches[i],rect);
        if (Tone.checkActive(copy.pitch, this.root, this.steps)) {
          this.ongoingTouches.push(copy);
          this.playNote(copy.identifier,copy.pitch,copy.octave);
          console.log('play '+copy.identifier +' '+ copy.pitch+' '+ copy.octave, this.ongoingTouches)
        }

      }
    },
    touchEnd: function(event) {
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {

      var idx = Tone.ongoingTouchIndexById(this.ongoingTouches,touches[i].identifier);

      if (idx >= 0) {

        this.ongoingTouches.splice(idx, 1);  // remove it; we're done
        console.log('stop '+ touches[i].identifier, this.ongoingTouches)
        this.stopNote(touches[i].identifier)
        }
      }
    },
    touchMove: function (event) {
      var rect = event.target.getBoundingClientRect();
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {

          var idx = Tone.ongoingTouchIndexById(this.ongoingTouches, touches[i].identifier);
          if (idx >= 0) {
            let copy = Tone.copyTouch(touches[i],rect);
            if (Tone.checkActive(copy.pitch, this.root, this.steps) && (this.ongoingTouches[idx].pitch!=copy.pitch || this.ongoingTouches[idx].octave!=copy.octave)) {
              this.ongoingTouches.splice(idx, 1, copy);  // swap in the new touch record
              this.changeNote(copy.identifier,copy.pitch,copy.octave);
              console.log('change' + touches[i].identifier + ' to '+ copy.pitch+' '+copy.octave)
            }

          } else {
            let copy = Tone.copyTouch(touches[i],rect);
            if (Tone.checkActive(copy.pitch, this.root, this.steps)) {
              this.ongoingTouches.push(copy);
              this.playNote(copy.identifier,copy.pitch,copy.octave);
              console.log('play '+copy.identifier +' '+ copy.pitch+' '+ copy.octave, this.ongoingTouches)
            }
          }

      }
    }
  },
  created: function() {
    Tone.field={};
  }
})







// METRONOME

Vue.component('metronome', {
  template:'#metronome',
  data: function () {
    return {
      bpm: 120,
      play:0,
      loop: {}
    }
  },
  computed: {
    beatFrequency: function () {
      Tone.Transport.bpm.value=this.bpm;
      return this.bpm/60
    },
    playing: function () {
      if (this.play) {
        Tone.Transport.start('+0.1')
      } else {
        Tone.Transport.stop()
      }
      console.log(this.play)
      return this.play
    },
    loopTempo: function() {
      console.log(this.bpm)
      return Tone.Transport.bpm.value
    },
    toNote: function () {
      return Tone.Frequency(this.beatFrequency, "hz").toNote();
    },
  },
  created: function () {

    var synth = new Tone.MembraneSynth().connect(Tone.context.volume);

  //this function is called right before the scheduled time

  this.loop = new Tone.Loop(function(time){
    synth.triggerAttackRelease('A0', '8n', time);
    Tone.Draw.schedule(function(){
      let flash = document.getElementById('metro-flash');
		   flash.style.fill="red";
       setTimeout(function () {flash.style.fill="#444"}, 100)
	}, time)
  },'4n')

  this.loop.start(0).stop('1m');

  Tone.Transport.loopEnd = '1m'
  Tone.Transport.loop = true

  }
});
