// TONE-GRID !!!!!!

Vue.component("tone-grid", {
  template: `<div class="tone-grid">

    <div class="grid-block"
    @mousedown.stop.prevent= "clickStart($event)"
    @mousemove.stop.prevent= "clickChange($event)"
    @mouseenter.stop.prevent="clickChange($event)"
    @mouseup.stop.prevent= "clickStop()"
    @mouseout.stop.prevent= "clickStop()"
    @touchstart.stop.prevent="touchStart($event)"
    @touchend.stop.prevent="touchEnd($event)"
    @touchmove.stop.prevent="touchMove($event)"
    @touchcancel.stop.prevent="touchEnd($event)">

      <div class="grid-cover"></div>

      <table class="tone-table">
        <tr v-if="activeSteps[note.pitch] || showInactive"  v-for="note in reversedNotes">
          <td class="grid-note" :style="{backgroundColor:'hsla(0,0%,'+octave*10+'%)'}" v-for="(octave,oct) in octaves">
            <div :class="{inactive:!activeSteps[note.pitch]}" :style="{backgroundColor:'hsla('+note.pitch*30+',80%,'+(octave*6+20)+'%)', color:'hsla(0,0%,'+(octave*6+20 > 40 ? 0 : 100)+'%)'}" class="grid-note-dot">{{note.name}}{{octave}}</div>
          </td>
        </tr>
      </table>
    </div>

    <div class="grid-controls">
       <button class="button" :class="{pushed:showInactive}" @click="showInactive=!showInactive">
          Show inactive
        </button>
        <b-field class="slider-holder" label="Octaves">
          <b-slider v-model="octaveRange" ticks :step="1" :min="0" :max="8"></b-slider>
        </b-field>
    </div>




  </div>`,
  data: function() {
    return {
      octaveRange: [0, 8],
      showInactive: true,
      x: 0,
      y: 0,
      notes: Chroma.Notes,
      octaveColors: Chroma.octaves,
      ongoingTouches: [],
      pressed: false
    };
  },

  props: {
    steps: {
      type: Array,
      default() {
        return [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]
      }
    },
    root: {
      default: 0
    }
  },
  computed: {
    reversedNotes() {
      let notes = [...this.notes];
      return notes.reverse();
    },
    octaves() {
      let octaves = [];
      for (i = this.octaveRange[0]; i <= this.octaveRange[1]; i++) {
        octaves.push(i);
      }
      return octaves;
    },
    activeSteps() {
      let activeSteps = Synth.arrayRotate(this.steps, -this.root);
      return activeSteps;
    },
    activeNotes() {
      let steps = [];
      for (step = 0; step < this.activeSteps.length; step++) {
        if (this.activeSteps[step]) {
          steps.push(step);
        }
      }
      return steps;
    }
  },
  methods: {

    ongoingTouchIndexById(ongoingTouches, idToFind) {
      for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;
        if (id == idToFind) {
          return i;
        }
      }
      return -1; // not found
    },
    checkActive(pitch, root, steps) {
      let act = pitch - root;
      if (act < 0) {
        act = act + 12;
      }
      return steps[act];
    },
    copyTouch(touch, rect) {
      let clientX = touch.clientX;
      let clientY = touch.clientY;
      let pitch,
        pitchH,
        pitchY,
        octave,
        octMix,
        octTwo,
        active = 0;

      //    PITCH

      if (this.showInactive) {
        pitchH = rect.height / 12;
        pitch = Math.floor(Math.abs((rect.bottom - clientY) / pitchH));
      } else {
        pitchH = rect.height / this.activeNotes.length;
        pitchY = Math.floor(Math.abs((rect.bottom - clientY) / pitchH));
        pitch = this.activeNotes[pitchY];
      }
      if (pitch > 11) {
        pitch = 11;
      } else if (pitch < 0) {
        pitch = 0;
      }

      // OCTAVE

      let octW = rect.width / this.octaves.length;
      let octX = clientX - rect.left;
      octave = Math.floor(octX / octW);
      if (octave > 8) {
        octave = 8;
      } else if (octave < 0) {
        octave = 0;
      }
      octave = this.octaves[octave];

      //OCTAVE MIX

      let octaveCenter = (octave + 0.5) * octW;
      if (octX > octaveCenter) {
        octTwo = octave + 1;
        octMix = (octX - octaveCenter) / octW;
      } else {
        octTwo = octave - 1;
        octMix = (octaveCenter - octX) / octW;
      }

    //  console.log(pitch, octave, octMix, octTwo);

      return {
        identifier: touch.identifier || 0,
        clientX: touch.clientX,
        clientY: touch.clientY,
        pitch,
        octave,
        octTwo,
        octMix
      };
    },
    playNote(id, pitch, octave, octMix = 0, octTwo) {
      this.synth = this.synth || {};

      this.synth[id] = new Synth.mainSynth(Synth.volume);

      if (!this.synth[id][octave]) {
        this.synth[id][octave] = {};
        this.synth[id][octave].gain = new Tone.Gain(octMix.toFixed(2)).connect(
          Synth.volume
        );
        this.synth[id][octave].synth = new Synth.mainSynth(
          this.synth[id][octave].gain
        );
      }

      if (!this.synth[id][octTwo]) {
        this.synth[id][octTwo] = {};
        this.synth[id][octTwo].gain = new Tone.Gain(
          (1 - octMix).toFixed(2)
        ).connect(Synth.volume);
        this.synth[id][octTwo].synth = new Synth.mainSynth(
          this.synth[id][octTwo].gain
        );
      }

      let time =
        Tone.Transport.state == "started"
          ? Synth.quantization
          : Tone.context.now();

      this.synth[id].triggerAttack(
        Synth.calcFrequency(pitch, octave),
        time,
        Synth.chromaOptions
      );

      this.synth[id][octave].synth.triggerAttack(
        Synth.calcFrequency(pitch, octave),
        time,
        Synth.chromaOptions
      );
      this.synth[id][octTwo].synth.triggerAttack(
        Synth.calcFrequency(pitch, octave),
        time,
        Synth.chromaOptions
      );
    },
    changeNote(id, pitch, octave, octMix, octTwo) {
      let time =
        Tone.Transport.state == "started"
          ? Synth.quantization
          : Tone.context.now();

      this.synth[id].synth.setNote(
        Synth.calcFrequency(pitch, octave),
        time,
        Synth.chromaOptions
      );
      this.synth[id][octave].gain.gain.setValueAtTime(octMix, time);
      this.synth[id][octave].synth.setNote(
        Synth.calcFrequency(pitch, octave),
        time,
        Synth.chromaOptions
      );
      this.synth[id][octTwo].gain.gain.setValueAtTime(1 - octMix, time);
      this.synth[id][octTwo].synth.setNote(
        Synth.calcFrequency(pitch, octTwo),
        time,
        Synth.chromaOptions
      );
    },
    stopNote: function(id) {
      let time =
        Tone.Transport.state == "started"
          ? Synth.quantization
          : Tone.context.now();
      console.log(id, this.synth);
      this.synth[id].triggerRelease();
      this.synth[id].forEach(line => {
        line.synth.triggerRelease();
      });

      if (id) {
        setTimeout(() => {
          this.synth[id].synth.dispose();
          this.synth[id] = null;
          delete this.synth[id];
        }, Synth.chromaOptions.envelope.release * 1000);
      }
    },
    playNotes(id, pitch, octave, octMix, octTwo) {
      console.log("Play: ", id, pitch, octave, octMix, octTwo);

      let time =
        Tone.Transport.state == "started"
          ? Synth.quantization
          : Tone.context.now();

      this.synth = this.synth || {};
      if (!this.synth[id]) {
        this.synth[id] = [];
      }

      if (!this.synth[id][octave]) {
        this.synth[id][octave] = {};
        this.synth[id][octave].gain = new Tone.Gain(
          1 - octMix.toFixed(2)
        ).connect(Synth.volume);
        this.synth[id][octave].synth = new Synth.mainSynth(
          this.synth[id][octave].gain
        );
      }

      if (octTwo) {
        if (!this.synth[id][octTwo]) {
          this.synth[id][octTwo] = {};
          this.synth[id][octTwo].gain = new Tone.Gain(
            octMix.toFixed(2)
          ).connect(Synth.volume);
          this.synth[id][octTwo].synth = new Synth.mainSynth(
            this.synth[id][octTwo].gain
          );
          this.synth[id].octTwo = octTwo;
        }
        this.synth[id][octTwo].synth.triggerAttack(
          Synth.calcFrequency(pitch, octave),
          time,
          Synth.chromaOptions
        );
      }

      this.synth[id].octave = octave;

      this.synth[id][octave].synth.triggerAttack(
        Synth.calcFrequency(pitch, octave),
        time,
        Synth.chromaOptions
      );
    },
    changeNotes(id, pitch, octave, octMix, octTwo, trigger = true) {
      //   console.log('Change: ',id, pitch, octave, octMix, octTwo)

      let time =
        Tone.Transport.state == "started"
          ? Synth.quantization
          : Tone.context.now();

      if (
        this.synth[id][octave] &&
        this.synth[id].octave != octave &&
        this.synth[id].octave != octTwo
      ) {
        this.synth[id][octave].synth.triggerRelease();
        this.synth[id].octave = octave;
        console.log(octave);
      }
      if (
        this.synth[id][octTwo] &&
        this.synth[id].octTwo != octave &&
        this.synth[id].octTwo != octTwo
      ) {
        this.synth[id][octTwo].synth.triggerRelease();
        this.synth[id].octTwo = octTwo;
        console.log(octTwo);
      }

      if (!this.synth[id][octave]) {
        this.synth[id][octave] = {};
        this.synth[id][octave].gain = new Tone.Gain(
          1 - octMix.toFixed(2)
        ).connect(Synth.volume);
        this.synth[id][octave].synth = new Synth.mainSynth(
          this.synth[id][octave].gain
        );
      }

      if (octTwo) {
        if (!this.synth[id][octTwo]) {
          this.synth[id][octTwo] = {};
          this.synth[id][octTwo].gain = new Tone.Gain(
            octMix.toFixed(2)
          ).connect(Synth.volume);
          this.synth[id][octTwo].synth = new Synth.mainSynth(
            this.synth[id][octTwo].gain
          );
        }
        this.synth[id][octTwo].gain.gain.setValueAtTime(
          octMix.toFixed(2),
          time
        );
        if (trigger) {
          this.synth[id][octTwo].synth.triggerAttack(
            Synth.calcFrequency(pitch, octTwo),
            time,
            Synth.chromaOptions
          );
        } else {
          this.synth[id][octTwo].synth.synth.setNote(
            Synth.calcFrequency(pitch, octTwo),
            time
          );
        }
      }

      this.synth[id][octave].gain.gain.setValueAtTime(
        1 - octMix.toFixed(2),
        time
      );

      if (trigger) {
        this.synth[id][octave].synth.triggerAttack(
          Synth.calcFrequency(pitch, octave),
          time,
          Synth.chromaOptions
        );
      } else {
        this.synth[id][octave].synth.synth.setNote(
          Synth.calcFrequency(pitch, octave),
          time
        );
      }
    },
    stopNotes: function(id) {
      console.log("Stop: ", id);
      let time =
        Tone.Transport.state == "started"
          ? Synth.quantization
          : Tone.context.now();

      this.synth[id].forEach(line => {
        line.synth.triggerRelease();
      });

      if (id) {
        setTimeout(() => {
          this.synth[id].forEach(line => {
            line.synth.dispose();
            line.synth = null;
            line.gain.dispose();
          });
          this.synth[id] = null;
          delete this.synth[id];
        }, Synth.chromaOptions.envelope.release * 1000);
      }
    },

    clickStart: function(event) {
      var rect = event.target.getBoundingClientRect();
      let copy = this.copyTouch(event, rect);
      this.pressed = copy;
      if (this.checkActive(copy.pitch, this.root, this.steps)) {
        this.playNotes(0, copy.pitch, copy.octave, copy.octMix, copy.octTwo);
      }
    },
    clickChange: function(event) {
      if (this.pressed) {
        var rect = event.target.getBoundingClientRect();
        let copy = this.copyTouch(event, rect);

        if (this.checkActive(copy.pitch, this.root, this.steps)) {
          if (
            this.pressed.octave != copy.octave ||
            this.pressed.octTwo != copy.octTwo ||
            this.pressed.octMix != copy.octMix
          ) {
            this.changeNotes(
              0,
              copy.pitch,
              copy.octave,
              copy.octMix,
              copy.octTwo,
              true
            );
          } else if (this.pressed.pitch != copy.pitch) {
            this.changeNotes(
              0,
              copy.pitch,
              copy.octave,
              copy.octMix,
              copy.octTwo,
              false
            );
          }
          this.pressed = copy;
        }
      }
    },
    clickStop: function() {
      if (this.pressed) {
        this.pressed = false;
        this.stopNotes(0);
      }
    },
    touchStart: function(event) {
      var rect = event.target.getBoundingClientRect();
      var touches = event.changedTouches;

      for (var i = 0; i < touches.length; i++) {
        let copy = this.copyTouch(touches[i], rect);

        if (this.checkActive(copy.pitch, this.root, this.steps)) {
          this.ongoingTouches.push(copy);
          this.playNote(copy.identifier, copy.pitch, copy.octave);
        }
      }
    },
    touchEnd: function(event) {
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {
        var idx = this.ongoingTouchIndexById(
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
        var idx = this.ongoingTouchIndexById(
          this.ongoingTouches,
          touches[i].identifier
        );
        if (idx >= 0) {
          let copy = this.copyTouch(touches[i], rect);
          if (
            this.checkActive(copy.pitch, this.root, this.steps) &&
            (this.ongoingTouches[idx].pitch != copy.pitch ||
              this.ongoingTouches[idx].octave != copy.octave)
          ) {
            this.ongoingTouches.splice(idx, 1, copy); // swap in the new touch record
            this.changeNote(copy.identifier, copy.pitch, copy.octave);
            //            console.log('change' + touches[i].identifier + ' to '+ copy.pitch+' '+copy.octave)
          }
        } else {
          let copy = this.copyTouch(touches[i], rect);
          if (this.checkActive(copy.pitch, this.root, this.steps)) {
            this.ongoingTouches.push(copy);
            this.playNote(copy.identifier, copy.pitch, copy.octave);
            //            console.log('play '+copy.identifier +' '+ copy.pitch+' '+ copy.octave, this.ongoingTouches)
          }
        }
      }
    }
  },
  created: function() {}
});
