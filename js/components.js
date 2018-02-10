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
  components: {
    'vueSlider': window[ 'vue-slider-component' ]
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







// METRONOME

Vue.component('metronome', {
  template:'#metronome',
  data: function () {
    return {
      play:0,
      pattern:[],
      beatCount: 16,
      tracks:[],
      loop: {},
      currentStep: 0,
      secondsPerStep: 0,
     lastScheduledTime: 0,
     nextStepTime: 0,
     mutes: [],
     playing: false,
     pressed:false,
     tempo: 120,
     audioTime: undefined,
     instruments: [
       {
         name:'kick'
       },
       {
         name:'dsh'
       }
     ],
     presets: [
    {
      name: "Default",
      pattern: [
      [
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
      [
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: true },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: true },
        { active: false },
        { active: false },
        { active: false }
      ],
      [
        { active: true },
        { active: false },
        { active: false },
        { active: false },
        { active: true },
        { active: false },
        { active: false },
        { active: false },
        { active: true },
        { active: false },
        { active: true },
        { active: false },
        { active: true },
        { active: false },
        { active: true },
        { active: false }
      ],
      [
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: true },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: true }
      ]
    ],
      tracks: [
        {
          instrument:'kick',
          freq: 15,
          duration: '8n',
          open:false,
          gain:0.8,
          decay: 0.15
        },
        {
          instrument:'dsh',
          open:true,
          freq: 110,
          gain: 0.3,
          decay: 0.15,
          endPitch: 0.9,
          sineNoiseMix: 0.75
        },
        {
          instrument:'dsh',
          open:false,
          freq: 80,
          gain: 0.1,
          decay: 0.06,
          endPitch: 1,
          sineNoiseMix: 0.75
        },
        {
          instrument:'dsh',
          open:false,
          freq: 55,
          gain: 0.4,
          decay: 0.65,
          endPitch: 1,
          sineNoiseMix: 0.001
        }
      ],
      tempo: 90
    }]
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
    playing: function () {
      if (this.play) {
        Tone.Transport.start('+0.1')
      } else {
        Tone.Transport.stop()
      }
      return this.play
    },
    loopTempo: function() {
      return Tone.Transport.bpm.value
    },
    toNote: function () {
      return Tone.Frequency(this.beatFrequency, "hz").toNote();
    },
    pattern: function () {
      let array = [];
      array.length=this.loopLength;
      for (let col=0;col<array.length; col++) {
        array[col]=[];
        array[col].length=this.loopTracks
      }
      return array
    }
  },
  methods: {
  addTrack: function () {
      this.tracks.push({
        freq: 100,
        gain: 0.2,
        decay: 0.01,
        endPitch: 0.01,
        sineNoiseMix: 0.01
      });
      let track = [];
      for (let beat=0;beat<this.beatCount;beat++) {
        track[beat]={};
        track[beat].active=false;
      }
      this.pattern.push(track)
        console.log(this.pattern)

  },
    delTrack: function () {
      this.tracks.pop();
      this.pattern.pop();
      console.log(this.pattern)
    },
    addBeat: function () {
      this.beatCount++;
      for (let track=0;track<this.pattern.length; track++) {
        this.pattern[track].push({active:false});
      }
      console.log(this.pattern)
    },
    delBeat: function () {
      this.beatCount--;
      for (let track=0;track<this.pattern.length; track++) {
        this.pattern[track].pop();
      }
      console.log(this.pattern)
    },
    act: function (i, j,pressed) {
      if (pressed || this.pressed) {
        this.pressed=true;
        this.pattern[i][j].active=!this.pattern[i][j].active;
      }

      console.log(i +' '+ j)

    },
    toggle: function (track) {
      console.log(track);
    },
    loadPreset(preset){
      let loadedPreset = JSON.parse(JSON.stringify(preset))
      this.pattern = loadedPreset.pattern,
      this.tempo = loadedPreset.tempo,
      this.tracks = loadedPreset.tracks
      for(let mute in this.mutes){
        this.mutes[mute] = false
      }
    },
    scheduleNote(track,startTime){

      if (track.instrument=='kick') {
        this.tom.triggerAttackRelease(track.freq, '8n', startTime);
      }

      if(track.instrument=='dsh') {

        let osc = Tone.context.createOscillator()
        let mainGainNode = Tone.context.createGain()
        let whiteNoise = Tone.context.createBufferSource();

        let oscVol = Tone.context.createGain()
        osc.connect(oscVol)
        oscVol.gain.setValueAtTime((1-track.sineNoiseMix)*2, startTime)
        oscVol.connect(mainGainNode)
        mainGainNode.connect(Tone.volume)
        osc.start(startTime)
        osc.stop(startTime+track.decay)
        osc.frequency.setValueAtTime(track.freq, startTime)
        osc.frequency.exponentialRampToValueAtTime(track.freq*track.endPitch, startTime+track.decay)

        let noiseVol = Tone.context.createGain()
        whiteNoise.buffer = this.noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(noiseVol);
        noiseVol.gain.setValueAtTime(track.sineNoiseMix*2, startTime)
        noiseVol.connect(mainGainNode)
        whiteNoise.start(startTime);
        whiteNoise.stop(startTime+track.decay)
        mainGainNode.gain.setValueAtTime(track.gain, startTime)
        mainGainNode.gain.exponentialRampToValueAtTime(0.01, startTime+track.decay)

      }

    },
    getSchedule(step,currentTime){
      let stepTime = step * this.secondsPerStep + ( currentTime - currentTime % (this.secondsPerStep * this.beatCount))
      if (stepTime<currentTime) { // skip to the next pattern if it's already too late
        stepTime += this.secondsPerStep * this.beatCount
      }
      return stepTime
    },
    updateAudioTime(){
      if(this.playing){
        const LOOK_AHEAD = 0.1
        this.secondsPerStep = 60/this.tempo/4
        this.audioTime = Tone.context.currentTime
        this.currentStep = Math.floor(this.audioTime/this.secondsPerStep % this.beatCount)
        for (let track in this.pattern){
        //  if(!this.mutes[track]){
            for (let step in this.pattern[track]){
              if (this.pattern[track][step].active){
                let schedule = this.getSchedule(step, this.audioTime)
                if (schedule > 0 && schedule-this.audioTime<LOOK_AHEAD && schedule>this.lastScheduledTime){
                  this.scheduleNote(this.tracks[track], schedule)
                }
              }
            }
        //  }
        }

        this.lastScheduledTime = this.audioTime+LOOK_AHEAD
      }
      requestAnimationFrame(this.updateAudioTime)
    }

  },
  created: function () {

    for (let i=0; i<4; i++){
      this.addTrack();
    }

    let bufferSize = 2 * Tone.context.sampleRate,
    noiseBuffer = Tone.context.createBuffer(1, bufferSize, Tone.context.sampleRate),
    output = noiseBuffer.getChannelData(0);
    this.noiseBuffer=noiseBuffer;
for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
}
  this.tom = new Tone.MembraneSynth().connect(Tone.volume);

    // Create empty patterns

   for(let i=0; i<this.trackCount; i++){
     this.pattern.push([])
     for(let j=0; j<this.beatCount; j++){
       this.pattern[i].push({active: false})
     }
   }






  //this function is called right before the scheduled time



  },
  mounted: function () {
    this.loadPreset(this.presets[0])
    let pattern=[];
    for (let i=0;i<this.pattern[0].length;i++) {
      pattern.push(this.pattern[0][i].active ? 'A0' : null)
    }
    console.log(pattern);
    var synth = new Tone.MembraneSynth().connect(Tone.volume);
    this.loop = new Tone.Sequence(function(time,pitch){
      console.log(pitch)
      synth.triggerAttackRelease('A0', '8n', time);
  //    Tone.Draw.schedule(function(){
  //      let flash = document.getElementById('metro-flash');
  //		   flash.style.fill="red";
  //       setTimeout(function () {flash.style.fill="#444"}, 100)
  //	}, time)
},[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])

    this.loop.start(0).stop('0:20');

    Tone.Transport.loopEnd = '0:20'
    Tone.Transport.loop = true
  //  Tone.Transport.start();

    this.updateAudioTime();
    if(!window.AudioContext) this.playing = false // Safari fix
  },

});
