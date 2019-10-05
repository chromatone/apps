Vue.component("field", {
  template: `<svg @touchstart.stop.prevent="1" version="1.1" id="Chromatone" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 100 1072 1155" style="enable-background:new 0 100 1072 1155;" xml:space="preserve">
     <defs>
         <clipPath id="clip-frame">
           <rect width="1028" :height="1008" x="21.5" y="220" rx="42px"/>
         </clipPath>
     </defs>

      <rect id="body" rx="50" class="chr0" x="0" y="108" width="1072" height="1150"/>

      <g id="cols" class="chr1" style="clip-path: url(#clip-frame);">
        <rect v-for="oct in 9" x="21.5"
        :y="1118-(oct-1)*112"
        :class="{['octave'+(oct-1)]:true}" width="1028" height="112"/>
      </g>

      <g id="plank">
      	<rect
        class="scroller"
        width="84"
        height="1090"
        :x="33+84*root" y="132" rx="42"/>
      	<circle class="scroller" :cx="75+84*root" cy="177" r="34"/>
      </g>

      <g id="108notes">
        <g v-for="(octave,octInd) in notes108">
          <circle
          v-for="note in octave"
          :cx="75 + 84*note.pitch"
          :cy="1175-112*octInd"
          r="38"
          :fill="note.color"
          :data-octave="octInd"
          :data-active="note.active"/>
        </g>
      </g>

      <g  id="chroma-frame" class="frame"
      @mousedown.stop.prevent= "clickStart($event)"
      @mousemove.stop.prevent= "clickChange($event)"
      @mouseenter.stop.prevent="clickChange($event)"
      @mouseup.stop.prevent= "clickStop()"
      @mouseout.stop.prevent= "clickStop()"
      @touchstart.stop.prevent="touchStart($event)"
      @touchend.stop.prevent="touchEnd($event)"
      @touchmove.stop.prevent="touchMove($event)"
      @touchcancel.stop.prevent="touchEnd($event)"
       >
      	<path style="transform:translateY(90px)" class="frame-out" d="M63.5,1150.7c-26.3,0-47.7-21.4-47.7-47.7V179c0-26.3,21.4-47.7,47.7-47.7h944c26.3,0,47.7,21.4,47.7,47.7v924c0,26.3-21.4,47.7-47.7,47.7H63.5z"/>
      	<path style="transform:translateY(90px)" class="frame-in" d="M1007.5,137c23.1,0,42,18.9,42,42v924c0,23.1-18.9,42-42,42h-944c-23.1,0-42-18.9-42-42V179c0-23.1,18.9-42,42-42H1007.5 M1007.5,125.7h-944c-29.4,0-53.3,23.9-53.3,53.3v924c0,29.4,23.9,53.3,53.3,53.3h944c29.4,0,53.3-23.9,53.3-53.3V179C1060.9,149.6,1036.9,125.7,1007.5,125.7L1007.5,125.7z"/>
      </g>

      <g>
        <g v-for="(note,ind) in notes">
        <text
        text-anchor="middle"
        :x="75+ind*84"
        y="192"
        class="field-notes"
        :data-pitch="ind"
        >
        {{note.name}}</text>
        <circle @touchstart.stop.prevent="root=ind" @mousedown.stop.prevent="root=ind" :cx="75+ind*84" cy="177" r="30" class="scroller-button"/>
        </g>
      </g>
    </svg>`,
  data: function() {
    return {
      x: 0,
      y: 0,
      notes: Chroma.Notes,
      ongoingTouches: [],
      pressed: false
    };
  },
  props: {
    steps: {
      type: Array
    },
    root: {
      default: 0
    }
  },
  computed: {
    activeSteps: function() {
      let activeSteps = Tone.arrayRotate(this.steps, -this.root);
      return activeSteps;
    },
    notes108: function() {
      let notes = [];

      for (let i = 0; i < 9; i++) {
        notes[i] = [];
        for (let j = 0; j < 12; j++) {
          notes[i][j] = this.notes[j];
          notes[i][j].active = this.activeSteps[j];
        }
      }
      return notes;
    }
  },
  methods: {
     playNote(id, pitch, octave, octMix, octTwo) {
      this.synth = this.synth || {};
      if (!this.synth[id]) {
        this.synth[id] = new Tone.mainSynth(Tone.volume);
      }

      if (!this.synth[id][octave]) {
        this.synth[id][octave] = {}
        this.synth[id][octave].gain = new Tone.Gain(octMix.toFixed(2)).connect(Tone.volume);
        this.synth[id][octave].synth = new Tone.mainSynth(this.synth[id][octave].gain);
      }
      if (!this.synth[id][octTwo]) {
        this.synth[id][octTwo] = {}
        this.synth[id][octTwo].gain = new Tone.Gain((1-octMix).toFixed(2)).connect(Tone.volume);
        this.synth[id][octTwo].synth = new Tone.mainSynth(this.synth[id][octTwo].gain);
      }


      let time =
        Tone.Transport.state == "started"
          ? Tone.quantization
          : Tone.context.now();

      this.synth[id].triggerAttack(
        Tone.calcFrequency(pitch, octave),
        time,
        Tone.chromaOptions
      );

       this.synth[id][octave].synth.triggerAttack(
        Tone.calcFrequency(pitch, octave),
        time,
        Tone.chromaOptions
      );
      this.synth[id][octTwo].synth.triggerAttack(
        Tone.calcFrequency(pitch, octave),
        time,
        Tone.chromaOptions
      );
    },
    changeNote(id, pitch, octave, octMix, octTwo) {
      let time =
        Tone.Transport.state == "started"
          ? Tone.quantization
          : Tone.context.now();
      this.synth[id].triggerAttack(
        Tone.calcFrequency(pitch, octave),
        time,
        Tone.chromaOptions
      );
        this.synth[id][octave].gain.gain.setValueAtTime(octMix, time);
        this.synth[id][octave].synth.triggerAttack(
        Tone.calcFrequency(pitch, octave),
        time,
        Tone.chromaOptions
      );
      this.synth[id][octTwo].gain.gain.setValueAtTime(1-octMix, time);
      this.synth[id][octTwo].synth.triggerAttack(
        Tone.calcFrequency(pitch, octTwo),
        time,
        Tone.chromaOptions
      );
    },
    stopNote: function(id) {
      let time =
        Tone.Transport.state == "started"
          ? Tone.quantization
          : Tone.context.now();
      this.synth[id].triggerRelease();
      this.synth[id].forEach( line => {
          line.synth.triggerRelease();
        }
      );

      if (id) {
        setTimeout(() => {
          this.synth[id].synth.dispose();
          this.synth[id] = null;
          delete this.synth[id];
        }, Tone.chromaOptions.envelope.release * 1000);
      }
    },
    playNotes(id, pitch, octave, octMix, octTwo) {
      console.log('Play: ',id, pitch, octave, octMix, octTwo)
      this.synth = this.synth || {};
      if (!this.synth[id]) {
        this.synth[id] = [];
      }

      if (!this.synth[id][octave]) {
        this.synth[id][octave] = {}
        this.synth[id][octave].gain = new Tone.Gain(octMix.toFixed(2)).connect(Tone.volume);
        this.synth[id][octave].synth = new Tone.mainSynth(this.synth[id][octave].gain);
      }
      if (!this.synth[id][octTwo]) {
        this.synth[id][octTwo] = {}
        this.synth[id][octTwo].gain = new Tone.Gain((1-octMix).toFixed(2)).connect(Tone.volume);
        this.synth[id][octTwo].synth = new Tone.mainSynth(this.synth[id][octTwo].gain);
      }

      let time =
        Tone.Transport.state == "started"
          ? Tone.quantization
          : Tone.context.now();

       this.synth[id][octave].synth.triggerAttack(
        Tone.calcFrequency(pitch, octave),
        time,
        Tone.chromaOptions
      );
      this.synth[id][octTwo].synth.triggerAttack(
        Tone.calcFrequency(pitch, octave),
        time,
        Tone.chromaOptions
      );


    },
    changeNotes(id, pitch, octave, octMix, octTwo, trigger=true) {

   //   console.log('Change: ',id, pitch, octave, octMix, octTwo)

      let time =
        Tone.Transport.state == "started"
          ? Tone.quantization
          : Tone.context.now();

       if (!this.synth[id][octave]) {
        this.synth[id][octave] = {}
        this.synth[id][octave].gain = new Tone.Gain(octMix.toFixed(2)).connect(Tone.volume);
        this.synth[id][octave].synth = new Tone.mainSynth(this.synth[id][octave].gain);
      }
      if (!this.synth[id][octTwo]) {
        this.synth[id][octTwo] = {}
        this.synth[id][octTwo].gain = new Tone.Gain((1-octMix).toFixed(2)).connect(Tone.volume);
        this.synth[id][octTwo].synth = new Tone.mainSynth(this.synth[id][octTwo].gain);
      }

        this.synth[id][octave].gain.gain.setValueAtTime(octMix.toFixed(2), time);
        this.synth[id][octTwo].gain.gain.setValueAtTime((1-octMix).toFixed(2), time);
        if (trigger) {
          this.synth[id][octave].synth.triggerAttack(
        Tone.calcFrequency(pitch, octave),
        time,
        Tone.chromaOptions
      );
          this.synth[id][octTwo].synth.triggerAttack(
        Tone.calcFrequency(pitch, octTwo),
        time,
        Tone.chromaOptions
      );
        }

    },
    stopNotes: function(id) {
      console.log('Stop: ',id)
      let time =
        Tone.Transport.state == "started"
          ? Tone.quantization
          : Tone.context.now();

      this.synth[id].forEach( line => {
          line.synth.triggerRelease();
        }
      );

      if (id) {
        setTimeout(() => {
          this.synth[id].forEach( line => {
            line.synth.dispose();
            line.synth = null;
            line.gain.dispose();
          }
        );
          this.synth[id] = null;
          delete this.synth[id];
        }, Tone.chromaOptions.envelope.release * 1000);
      }
    },

    clickStart: function(event) {

      var rect = event.target.getBoundingClientRect();
      let copy = Tone.copyTouch(event, rect);
      console.log(copy.pitch, copy.octave, copy.octMix, copy.octTwo);
      this.pressed = copy;
      if (Tone.checkActive(copy.pitch, this.root, this.steps)) {
        this.playNotes(0, copy.pitch, copy.octave, copy.octMix, copy.octTwo);
      }
    },
    clickChange: function(event) {

      var rect = event.target.getBoundingClientRect();
      let copy = Tone.copyTouch(event, rect);
   //   console.log(copy.pitch, copy.octave, copy.octMix, copy.octTwo, 1-copy.octMix);
      if (
        this.pressed &&
        Tone.checkActive(copy.pitch, this.root, this.steps)
      ) {
        if (this.pressed.pitch != copy.pitch ) {
          this.changeNotes(0, copy.pitch, copy.octave, copy.octMix, copy.octTwo, true);
        }
        if (this.pressed.octave != copy.octave
         || this.pressed.octTwo != copy.octTwo
         || this.pressed.octMix != copy.octMix) {
          this.changeNotes(0, copy.pitch, copy.octave, copy.octMix, copy.octTwo, true);
        }
        this.pressed = copy;
      }

    },
    clickStop: function() {
      var rect = event.target.getBoundingClientRect();
      let copy = Tone.copyTouch(event, rect);
      if (this.pressed) {
        this.pressed = false;
        this.stopNotes(0);
      }
    },
    touchStart: function(event) {
      var rect = event.target.getBoundingClientRect();
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {
        let copy = Tone.copyTouch(touches[i], rect);
        if (Tone.checkActive(copy.pitch, this.root, this.steps)) {
          this.ongoingTouches.push(copy);
          this.playNote(copy.identifier, copy.pitch, copy.octave);
          //    console.log('play '+copy.identifier +' '+ copy.pitch+' '+ copy.octave, this.ongoingTouches)
        }
      }
    },
    touchEnd: function(event) {
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {
        var idx = Tone.ongoingTouchIndexById(
          this.ongoingTouches,
          touches[i].identifier
        );

        if (idx >= 0) {
          this.ongoingTouches.splice(idx, 1); // remove it; we're done
          //      console.log('stop '+ touches[i].identifier, this.ongoingTouches)
          this.stopNote(touches[i].identifier);
        }
      }
    },
    touchMove: function(event) {
      var rect = event.target.getBoundingClientRect();
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {
        var idx = Tone.ongoingTouchIndexById(
          this.ongoingTouches,
          touches[i].identifier
        );
        if (idx >= 0) {
          let copy = Tone.copyTouch(touches[i], rect);
          if (
            Tone.checkActive(copy.pitch, this.root, this.steps) &&
            (this.ongoingTouches[idx].pitch != copy.pitch ||
              this.ongoingTouches[idx].octave != copy.octave)
          ) {
            this.ongoingTouches.splice(idx, 1, copy); // swap in the new touch record
            this.changeNote(copy.identifier, copy.pitch, copy.octave);
            //            console.log('change' + touches[i].identifier + ' to '+ copy.pitch+' '+copy.octave)
          }
        } else {
          let copy = Tone.copyTouch(touches[i], rect);
          if (Tone.checkActive(copy.pitch, this.root, this.steps)) {
            this.ongoingTouches.push(copy);
            this.playNote(copy.identifier, copy.pitch, copy.octave);
            //            console.log('play '+copy.identifier +' '+ copy.pitch+' '+ copy.octave, this.ongoingTouches)
          }
        }
      }
    }
  },
  created: function() {
    Tone.field = {};
  }
});
