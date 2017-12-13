//KEY stack

Vue.component('key-stack', {
  template:'#key-stack',
  data: function () {
    return {
      octaves:[2,4],
      scale:Chroma.scales.major,
      root:0
    }
  },
  computed: {
    octavesNum: function() {
      let octs = [];
      for (let i=this.octaves[1];i>=this.octaves[0];i--) {
        octs.push(i);
      }
      return octs
    }
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


// KEYS

Vue.component ('keys' ,{
  template:'#keys',
  data: function() {
    return {
      notes:Chroma.Notes
    }
  },
  props: {
    octave: {
      default:4
    },
    shift: {
      default:0
    },
    steps: {
      type: Array
    },
    root: {
      type: Number
    },
    r: {
      default:65
    }
  },
  mounted: function() {

  },
  computed:  {
    activeNotes: function () {
  //    console.log(this.notes)
      return this.notes
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
});

Vue.component ('field', {
  template:'#field',
  data: function () {
    return {
      x:0,
      y:0,
      notes:Chroma.Notes,
      ongoingTouches:[],
      root:0
    }
  },
  props: {
    steps: {
      type:Array
    }
  },
  computed: {
    activeSteps: function () {
      let activeSteps = [];
      activeSteps=activeSteps.concat(this.steps.slice(-this.root),this.steps.slice(0,12-this.root));
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
    updateXY: function(event) {
      let rect=document.getElementById('chroma-frame').getBoundingClientRect();
      let pitch = Math.floor((event.clientX-rect.left)/(rect.width/12));
      let octave = Math.floor((rect.bottom-event.clientY)/(rect.height/9));
      if (pitch>11) {pitch=11} else if (pitch<0) {pitch=0};
      if (octave>8) {octave=8} else if (octave<0) {octave=0};
      console.log(pitch,octave);
    },
    touchStart: function (event) {
      var rect = event.target.getBoundingClientRect();
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {
        let copy = this.copyTouch(touches[i],rect);
        this.ongoingTouches.push(copy);
    //    playNote(copy.identifier,copy.pitch,copy.octave,copy.active);
        console.log(copy.pitch,copy.octave)
      }
    },
    copyTouch: function (touch,rect) {
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
    }
  }
})
