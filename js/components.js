Vue.component('knob', {
    template:'#knob',
  props: ['max','min','value','step', 'param'],
  data () {
    return {
      internalValue: this.mapNumber(this.value, this.min, this.max, 0, 100),
      active: false,
      initialX: undefined,
      initialY: undefined,
      initialDragValue: undefined,
      shiftPressed: false
    }
  },
  created () {
    document.addEventListener('keydown', (e) => {
      if (e.key=='Shift') this.shiftPressed = true
    })
    document.addEventListener('keyup', (e) => {
      if (e.key=='Shift') this.shiftPressed = false
    })
  },
  watch: {
    value: function(newVal, oldVal){
      this.internalValue = this.mapNumber(newVal, this.min, this.max, 0, 100)
    }
  },
  filters: {
    round(val){
      return Math.floor(val*100)/100
    }
  },
  computed:{
    knobRotation(){
      let rotation = this.mapNumber(this.internalValue, 0,100,0,270)-135
      return `rotate( ${rotation} 17 15)`
    }
  },
  methods: {
    mapNumber(value,inputmin,inputmax,rangemin,rangemax){
      rangemax = parseFloat(rangemax)
      rangemin = parseFloat(rangemin)
      inputmax = parseFloat(inputmax)
      inputmin = parseFloat(inputmin)
      let result = (value- inputmin) * (rangemax - rangemin) / (inputmax - inputmin) + rangemin;

      return Math.round(result*(this.step||100))/(this.step||100)
    },
    activate(event){
      this.initialX = event.pageX || event.changedTouches[0].pageX
      this.initialY = event.pageY || event.changedTouches[0].pageY
      this.active = true
      this.initialDragValue = this.internalValue
      document.onmouseup = this.deactivate
      document.addEventListener('touchend', this.deactivate)
      document.onmousemove = this.dragHandler
      document.addEventListener('touchmove',this.dragHandler)
    },
    dragHandler(e){
      let xLocation = e.pageX || e.changedTouches[0].pageX
      let yLocation = e.pageY || e.changedTouches[0].pageY
      if (Math.abs(xLocation - this.initialX)> Math.abs(yLocation - this.initialY))
        {
          if(this.shiftPressed){
            this.internalValue = this.initialDragValue + (xLocation - this.initialX)/10
          } else {
            this.internalValue = this.initialDragValue + (xLocation - this.initialX)/2
          }
        } else {
          if(this.shiftPressed){
            this.internalValue = this.initialDragValue + (this.initialY-yLocation)/10
          } else {
            this.internalValue = this.initialDragValue + (this.initialY - yLocation)/2
          }
        }
      if (this.internalValue>100) this.internalValue = 100
      if (this.internalValue<0) this.internalValue = 0
      if(isNaN(this.internalValue)) this.internalValue = this.initialDragValue
      this.$emit('input', this.mapNumber(this.internalValue, 0,100,this.min,this.max))
    },
    deactivate(){
      document.onmouseup = undefined
      document.onmousemove = undefined
      document.removeEventListener('touchmove',this.dragHandler)
      document.removeEventListener('touchend',this.deactivate)
      this.active = false
    }
  }

})




// Synth adsr


Vue.component('synth', {
  template:"#synth",
  data: function() {
    return {
      attack: 0.030,
      decay: 1.5,
      sustain:0.5,
      release: 0.8,
      oscTypes: ['sine','triangle','square','sawtooth', 'pulse', 'pwm'],
      oscType: 'sine',
    }
  },
  filters: {
    tri: function(val) {
      return val.slice(0,3).toUpperCase()
    }
  },
  computed: {

  },
  watch: {
    oscType: function () {
      Tone.chromaSynth.set('oscillator.type',this.oscType);
      Tone.chromaOptions.oscillator.type=this.oscType;
    },
    attack: function () {
      Tone.chromaSynth.set('envelope.attack', this.attack);
      Tone.chromaOptions.envelope.attack=this.attack
    },
    decay: function () {
      Tone.chromaSynth.set('envelope.decay', this.decay);
      Tone.chromaOptions.envelope.decay=this.decay
    },
    sustain: function () {
      Tone.chromaSynth.set('envelope.sustain', this.sustain);
      Tone.chromaOptions.envelope.sustain=this.sustain
    },
    release: function () {
      Tone.chromaSynth.set('envelope.release', this.release);
      Tone.chromaOptions.envelope.release=this.release
    }
  }
});




// CHORDION


Vue.component('chordion', {
  template:'#chordion',
  data: function () {
    return {
      notes:Chroma.Notes,
      chords:Chroma.Chords,
      inversion:-1
    }
  },
  props: {
    scale: {
      type: Object
    },
    root: {
      default:0
    }
  },
  computed: {
    activeSteps: function () {
      let activeSteps=Tone.arrayRotate(this.scale.steps, -this.root);

      return activeSteps
    },
    activeNotes: function () {
      for (let i=0;i<12;i++) {
          this.notes[i].active = this.activeSteps[i];
        }
      return this.notes
    }
  },
  methods:{
    invert: function(chord, inv) {
      let invChord=chord.slice();
      for (i=0;i<inv;i++) {
        invChord.push(invChord.shift())
        invChord[chord.length-1]+=12;
      }
      return invChord
    },
    changeChord: function  (pitch,chord,inv) {
      let octave=2;
      if (pitch<this.root) {
        octave++
      }
      if(chord.inversion !=inv) {
        let toStop = [];
        let playing = this.invert(chord.steps,chord.inversion);
        for (i=0;i<playing.length; i++) {
          toStop[i]=Tone.calcFrequency(pitch+playing[i],octave);
        }
        Tone.chromaSynth.triggerRelease(toStop);
        chord.inversion=inv;
      }
      let invChord=this.invert(chord.steps,inv);
      let toPlay = [];
      for (i=0;i<invChord.length; i++) {
        toPlay[i]=Tone.calcFrequency(pitch+invChord[i],octave);
      }

      Tone.chromaSynth.triggerAttack(toPlay,'+0.001');
    },
    slideChord: function (pitch, chord, event) {

      for (i=0;i<event.changedTouches.length;i++) {
        let clientX=event.changedTouches[i].clientX;
        let clientY=event.changedTouches[i].clientY;
        let rect=event.changedTouches[i].target.getBoundingClientRect();
        let x=clientX-rect.x-rect.width/2;
        let y= clientY-rect.y-rect.height/2;
        if (chord.handle == 'min') {
          y=-y;
        }
            if (chord.inversion!=2 && x>0 && y>0 && Math.sqrt(3)*x+y>50) {
              this.changeChord(pitch,chord,2)

            } else if (chord.inversion!=1 && x<0 && y>0  && Math.sqrt(3)*Math.abs(x)+y>50){
              this.changeChord(pitch,chord,1)

            } else if (chord.inversion!=0 && (Math.sqrt(3)*Math.abs(x)+y<50 || y<0)){
              this.changeChord(pitch,chord,0);

            }
      }

    },
    chordTranslate: function (index, size, shift, top, topshift) {
      let translate = 'translate(';

      if (index>5) {
        translate+=Number(index-6)*size+shift+' '+topshift+')'
      } else {
        translate+=Number(index*size+shift)+' '+Number(top+topshift)+')'
      }
      return translate
    },
    stopChord: function (pitch, chord, event) {
      let octave=2;
      if (pitch<this.root) {
        octave++
      }
        let toStop = [];
        let playing = this.invert(chord.steps,chord.inversion);
        for (i=0;i<playing.length; i++) {
          toStop[i]=Tone.calcFrequency(pitch+playing[i],octave);
        }

        Tone.chromaSynth.triggerRelease(toStop);
        chord.inversion=-1;

    },
  }
})




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
      let activeSteps=Tone.arrayRotate(this.steps,-this.root);
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
          Tone.field[id]= new Tone.Synth(Tone.chromaOptions).connect(Tone.volume);
      //    console.log(Tone.field[id])
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
    //      console.log(Tone.field)
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
      //    console.log('play '+copy.identifier +' '+ copy.pitch+' '+ copy.octave, this.ongoingTouches)
        }

      }
    },
    touchEnd: function(event) {
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {

      var idx = Tone.ongoingTouchIndexById(this.ongoingTouches,touches[i].identifier);

      if (idx >= 0) {

        this.ongoingTouches.splice(idx, 1);  // remove it; we're done
  //      console.log('stop '+ touches[i].identifier, this.ongoingTouches)
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
  //            console.log('change' + touches[i].identifier + ' to '+ copy.pitch+' '+copy.octave)
            }

          } else {
            let copy = Tone.copyTouch(touches[i],rect);
            if (Tone.checkActive(copy.pitch, this.root, this.steps)) {
              this.ongoingTouches.push(copy);
              this.playNote(copy.identifier,copy.pitch,copy.octave);
  //            console.log('play '+copy.identifier +' '+ copy.pitch+' '+ copy.octave, this.ongoingTouches)
            }
          }

      }
    }
  },
  created: function() {
    Tone.field={};
  }
})


// TRACK




Vue.component('tracker', {
  template: "#tracker",
  props: {
    active: {
      default:true
    },
    trk: {
      default: {
        instrument:'kick',
        pattern: [
          { active: true },
          { active: false },
          { active: true },
          { active: false },
          { active: false },
          { active: false},
          { active: true },
          { active: false },
          { active: true },
          { active: false },
          { active: false },
          { active: false },
          { active: false },
          { active: false },
          { active: false },
          { active: false }
        ],
        options: {
          freq: 15,
          decay: 0.15
        },
        duration: '8n',
        gain:0.8,
      }
    }
  },
  data: function () {
    return {
      currentStep:0,
      play:false,
      instruments: {
        kick: {
          name:'kick',
          options: {
          }
        },
        dsh: {
          name:'dsh',
          options: {
            freq: {
              min:10,
              max:8800,
              default:30,
              name:'freq',
              param:'FREQ'
            },
            decay: {
              min:0.005,
              max:1,
              default:0.005,
              name:'decay',
              param:'DECAY'
            },
            endPitch: {
              min:0.005,
              max:1,
              default:0.5,
              name:'endPitch',
              param:'ENV'
            },
            sineNoiseMix: {
              min:0.05,
              max:1,
              default:0.7,
              name:'sineNoiseMix',
              param:'NOISE'
            }
          }
        }
      },
      open:true,
      gain:0,

      instrument:''
    }
  },
  computed: {
    beatCount: function () {
      return this.trk.pattern.length
    },
    pattern: function () {
      return this.trk.pattern
    },
    duration: function () {
      var pos = this.trk.duration.indexOf('n');
      var word = (pos > 0) ? this.trk.duration.substr(0, pos) : this.trk.duration;
      console.log(word)
    }
  },
  methods: {
    act: function (pos) {
      this.loop.at(pos, {active:!this.trk.pattern[pos].active, num:pos});
      this.trk.pattern[pos].active=!this.trk.pattern[pos].active

    },
    toggleLoop: function () {
      if (!this.play) {
        this.gain.gain.value=1;

        console.log('loopStart' , this.gain)
      } else {
        this.gain.gain.value=0;
        console.log('loopStop', this.gain)
      }
      this.play=!this.play;
    },
    addBeat: function () {
      this.loop.add(this.trk.pattern.length,{'active':false, num:this.trk.pattern.length});
      this.trk.pattern.push({'active':false, num:this.trk.pattern.length});
      this.loop.loopEnd=this.trk.pattern.length+'*'+this.trk.duration;
    },
    delBeat: function () {
      if (this.trk.pattern.length>1) {
        this.loop.remove(this.trk.pattern.length-1);
        this.trk.pattern.pop();
        this.loop.loopEnd=this.trk.pattern.length+'*'+this.trk.duration;
      }
    }
  },
  created: function () {
    var that=this;
    this.gain = new Tone.Gain(0).connect(Tone.volume);
    let synth = {};
    if (this.trk.instrument == 'kick') {


      let kickVol = new Tone.Gain(0.8).connect(this.gain);
      synth = new Tone.MembraneSynth().connect(kickVol);
      synth.play = function (time) {
        kickVol.gain.value=that.trk.gain;
        synth.triggerAttackRelease('A0', '8n', time);
      };

    }
    synth.beat = function (num) {
      that.currentStep=num;

    }

    if (this.trk.instrument == 'dsh') {


      let bufferSize = 2 * Tone.context.sampleRate,
          noiseBuffer = Tone.context.createBuffer(1, bufferSize, Tone.context.sampleRate),
          output = noiseBuffer.getChannelData(0);
      this.noiseBuffer=noiseBuffer;
      for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }



      synth.triggerAttackRelease = function (gain,freq, decay, endPitch, sineNoiseMix, startTime) {

        let osc = Tone.context.createOscillator()
        let mainGainNode = Tone.context.createGain()
        let whiteNoise = Tone.context.createBufferSource();
        let oscVol = Tone.context.createGain()
        osc.connect(oscVol)
        oscVol.connect(mainGainNode)
        mainGainNode.connect(that.gain)
        let noiseVol = Tone.context.createGain()
        whiteNoise.buffer = that.noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(noiseVol);
        noiseVol.connect(mainGainNode)

        oscVol.gain.setValueAtTime((1-sineNoiseMix)*2, startTime)


        osc.start(startTime)
        osc.stop(startTime+decay)
        osc.frequency.setValueAtTime(freq, startTime)
        osc.frequency.exponentialRampToValueAtTime(freq*endPitch, startTime+decay)
        noiseVol.gain.setValueAtTime(sineNoiseMix*2, startTime)
        whiteNoise.start(startTime);
        whiteNoise.stop(startTime+decay)
        mainGainNode.gain.setValueAtTime(gain, startTime)
        mainGainNode.gain.exponentialRampToValueAtTime(0.01, startTime+decay)
      }
    let options=this.trk.options;
    options.gain=this.trk.gain;
    synth.play = function (time) {
      synth.triggerAttackRelease(that.trk.gain, options.freq, options.decay, options.endPitch, options.sineNoiseMix, time)
    }


    }

    this.loop = new Tone.Sequence(function(time,pitch){
      if(pitch.active) {
          synth.play(time)

      }
      synth.beat(pitch.num);
  //    Tone.Draw.schedule(function(){
  //      let flash = document.getElementById('metro-flash');
  //		   flash.style.fill="red";
  //       setTimeout(function () {flash.style.fill="#444"}, 100)
  //	}, time)
},this.trk.pattern, this.trk.duration)

    this.loop.loop=true;
    this.loop.start(0);

//    Tone.Transport.start();
  }
});






// METRONOME

Vue.component('metronome', {
  template:'#metronome',
  data: function () {
    return {
      play:false,
      pattern:[],
      beatCount: 16,
      tracks:[],
      loop: {},
      currentStep: 0,
     taps: [],
     newDuration:'16',
     playing: false,
     pressed:false,
     tempo: 90,
     tracks: [
        {
          instrument:'kick',
          pattern: [
            { active: true, num:0 },
            { active: false, num:1 },
            { active: true, num:2 },
            { active: false, num:3 },
            { active: false, num:4 },
            { active: false, num:5},
            { active: true, num:6 },
            { active: false, num:7}
          ],
          duration: '8n',
          gain:0.8
        },
        {
          instrument:'dsh',
          pattern: [
            { active: false, num:0 },
            { active: false, num:1 },
            { active: false, num:2 },
            { active: false, num:3 },
            { active: true, num:4 },
            { active: false, num:5},
            { active: false, num:6 },
            { active: false, num:7}
          ],
          options: {
            freq: 110,
            decay: 0.15,
            endPitch: 0.9,
            sineNoiseMix: 0.75
          },
          gain: 0.5,
          duration:'8n'
        }
      ]
    }
  },
  computed: {
    trackCount(){
      return this.tracks.length
    },
    beatFrequency: function () {
      Tone.Transport.bpm.value=this.tempo;
      return this.tempo/60
    },
    toNote: function () {
      return Tone.Frequency(this.beatFrequency, "hz").toNote();
    }
  },
  methods: {
    tap: function () {
      let tapCount=3;
      let tempo;
      let sum=0;
      let tap = (new Date()).getTime();
      if (this.taps.length<tapCount) {
         this.taps.push(tap);
      } else {
        this.taps.shift();
        this.taps.push(tap);
        for (let i=0;i<tapCount-1;i++) {
          sum+=this.taps[i+1] - this.taps[i];
        }

        let tempo = Math.round(60000/(0.5*sum));

        this.tempo = tempo>30 ? tempo: 30;
      }
    },
    addTrack: function () {
      this.tracks.push(
        {
          instrument:'dsh',
          pattern: [
            { active: false, num:0 },
            { active: false, num:1 },
            { active: false, num:2 },
            { active: false, num:3 },
            { active: false, num:4 },
            { active: false, num:5},
            { active: false, num:6 },
            { active: false, num:7}
          ],
          options: {
            freq: 110,
            decay: 0.05,
            endPitch: 0.9,
            sineNoiseMix: 0.9
          },
          gain: 0.3,
          duration:this.newDuration+'n'
        }
      )
    },
    delTrack: function () {
      this.tracks.pop();
      this.pattern.pop();
      console.log(this.pattern)
    },
    toggleTransport: function () {
      if (!this.play) {
        this.play=true;
        Tone.Transport.start();
      } else {
        this.play=false;
        Tone.Transport.stop();
      }
    },
    loadPreset(preset){
      let loadedPreset = JSON.parse(JSON.stringify(preset))
      this.pattern = loadedPreset.pattern,
      this.tempo = loadedPreset.tempo,
      this.tracks = loadedPreset.tracks
      for(let mute in this.mutes){
        this.mutes[mute] = false
      }
    }

  },
  created: function () {


  },
  mounted: function () {


    if(!window.AudioContext) this.playing = false // Safari fix
  },

});
