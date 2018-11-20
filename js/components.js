// CHORD VISUALIZATION

Vue.component("visual", {
  template: "#visual",
  props: ["notes", "options"],
  data() {
    return {};
  },
  computed: {
    playing() {
      return Tone.playing;
    }
  },
  mounted() {
    var SVGNS = "http://www.w3.org/2000/svg";
    var input = document.getElementById("chordinput");
    var plot = document.getElementById("plot");
    console.log(plot);
    var g = document.createElementNS(SVGNS, "g");
    plot.appendChild(g);
    var panel = document.getElementById("panel");
    var options = {
      from: -0.04,
      to: 0.04,
      samples: 1800,
      translate: {
        x: 0,
        y: 150
      },
      scale: {
        x: 100000,
        y: 50
      },
      opacity: 0.3,
      plot: g,
      panel: panel,
      chordColor: "#1693a5",
      colors: [
        "#006ae0",
        "#ff0000",
        "#ff8f00",
        "#009a0a",
        "#23d8d8",
        "#fed600",
        "#cdff00"
      ]
    };

    var mouseDown,
      origo = { x: 0, y: 0 };
    plot.addEventListener(
      "mousedown",
      function(e) {
        mouseDown = { x: e.pageX, y: e.pageY };
      },
      false
    );

    plot.addEventListener(
      "mouseup",
      function(e) {
        origo.x = origo.x + (e.pageX - mouseDown.x);
        origo.y = origo.y + (e.pageY - mouseDown.y);
        mouseDown = null;
      },
      false
    );

    plot.addEventListener(
      "mousemove",
      function(e) {
        if (!mouseDown) {
          return;
        }
        var x = origo.x + e.pageX - mouseDown.x;
        var y = origo.y + e.pageY - mouseDown.y;
        g.setAttribute("transform", "translate(" + x + "," + y + ")");
      },
      false
    );

    // Draw chord, when ready
    this.plotChord([], options);
  },
  methods: {
    merge(obj1, obj2) {
      Object.assign(obj1, obj2);
      return obj1;
    },
    sample(from, to, count, fn) {
      var step = (to - from) / count;
      var samples = [];
      for (var i = 0; i < count; i++) {
        samples.push([from + step * i, fn(from + step * i)]);
      }

      return samples;
    },
    waveLambda(fq) {
      return function(x) {
        return Math.sin(fq * (2 * Math.PI * x));
      };
    },
    plotFunction(fn, options) {
      var samples = options.samples;
      var from = options.from;
      var to = options.to;
      var xtrans = options.translate ? options.translate.x : 0;
      var ytrans = options.translate ? options.translate.y : 0;
      var xscale = options.scale ? options.scale.x : 0;
      var yscale = options.scale ? options.scale.y : 0;
      var color = options.color ? options.color : "#006ae0";
      var width = options.width ? options.width : 1.5;
      var opacity = options.opacity ? options.opacity : 1;
      var line = "";
      var SVGNS = "http://www.w3.org/2000/svg";
      var path = document.createElementNS(SVGNS, "path");
      path.setAttribute("style", "opacity:" + opacity);
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", width);
      path.setAttribute("fill", "none");

      var samples = this.sample(from, to, samples, fn);

      line =
        "M " +
        (samples[0][0] * xscale + xtrans) +
        " " +
        (samples[0][1] * yscale + ytrans);

      samples.slice(1).forEach(function(sample) {
        line +=
          " L " +
          (sample[0] * xscale + xtrans) +
          " " +
          (sample[1] * yscale + ytrans);
      });

      path.setAttribute("d", line);
      return path;
    },
    plotChord(chord, options) {
      chord = [
        { name: "A4", value: 440 },
        { name: "C#5", value: 554.37 },
        { name: "E5", value: 659.26 },
        { name: "G#5", value: 830.61 }
      ];
      var fqs = [];
      var colors = options.colors || ["#006ae0", "#ff0000", "#ff8f00"];
      var chordColor = options.chordColor || colors[colors.length - 1];
      var plot = options.plot;

      // plot the notes
      chord.forEach((n, i) => {
        // Push the wave lambda to the sum stack
        fqs.push(this.waveLambda(n.value));

        // Plot the function
        var path = this.plotFunction(
          fqs[fqs.length - 1],
          this.merge(options, {
            color: colors[i % colors.length]
          })
        );

        // Append the path
        plot.appendChild(path);
      });

      // plot the chord wave
      var chord = this.plotFunction(function(x) {
        return fqs.reduce(function(a, b) {
          return a + b(x);
        }, 0);
      }, this.merge(options, { color: chordColor, opacity: 1, width: 2 }));
      plot.appendChild(chord);
    },
    purge(el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    },
    inputChanged() {
      purge(g);
      purge(panel);
      plotChord(chord, options);
    }
  }
});

// KNOB

Vue.component("knob", {
  template: "#knob",
  props: ["max", "min", "value", "step", "param"],
  data() {
    return {
      internalValue: this.mapNumber(this.value, this.min, this.max, 0, 100),
      active: false,
      initialX: undefined,
      initialY: undefined,
      initialDragValue: undefined,
      shiftPressed: false
    };
  },
  created() {
    document.addEventListener("keydown", e => {
      if (e.key == "Shift") this.shiftPressed = true;
    });
    document.addEventListener("keyup", e => {
      if (e.key == "Shift") this.shiftPressed = false;
    });
  },
  watch: {
    value: function(newVal, oldVal) {
      this.internalValue = this.mapNumber(newVal, this.min, this.max, 0, 100);
    }
  },
  filters: {
    round(val) {
      return Math.floor(val * 100) / 100;
    }
  },
  computed: {
    knobRotation() {
      let rotation = this.mapNumber(this.internalValue, 0, 100, 0, 270) - 135;
      return `rotate( ${rotation} 17 15)`;
    }
  },
  methods: {
    mapNumber(value, inputmin, inputmax, rangemin, rangemax) {
      rangemax = parseFloat(rangemax);
      rangemin = parseFloat(rangemin);
      inputmax = parseFloat(inputmax);
      inputmin = parseFloat(inputmin);
      let result =
        (value - inputmin) * (rangemax - rangemin) / (inputmax - inputmin) +
        rangemin;

      return Math.round(result * (this.step || 100)) / (this.step || 100);
    },
    activate(event) {
      this.initialX = event.pageX || event.changedTouches[0].pageX;
      this.initialY = event.pageY || event.changedTouches[0].pageY;
      this.active = true;
      this.initialDragValue = this.internalValue;
      document.onmouseup = this.deactivate;
      document.addEventListener("touchend", this.deactivate);
      document.onmousemove = this.dragHandler;
      document.addEventListener("touchmove", this.dragHandler);
    },
    dragHandler(e) {
      let xLocation = e.pageX || e.changedTouches[0].pageX;
      let yLocation = e.pageY || e.changedTouches[0].pageY;
      if (
        Math.abs(xLocation - this.initialX) >
        Math.abs(yLocation - this.initialY)
      ) {
        if (this.shiftPressed) {
          this.internalValue =
            this.initialDragValue + (xLocation - this.initialX) / 10;
        } else {
          this.internalValue =
            this.initialDragValue + (xLocation - this.initialX) / 2;
        }
      } else {
        if (this.shiftPressed) {
          this.internalValue =
            this.initialDragValue + (this.initialY - yLocation) / 10;
        } else {
          this.internalValue =
            this.initialDragValue + (this.initialY - yLocation) / 2;
        }
      }
      if (this.internalValue > 100) this.internalValue = 100;
      if (this.internalValue < 0) this.internalValue = 0;
      if (isNaN(this.internalValue)) this.internalValue = this.initialDragValue;
      this.$emit(
        "input",
        this.mapNumber(this.internalValue, 0, 100, this.min, this.max)
      );
    },
    deactivate() {
      document.onmouseup = undefined;
      document.onmousemove = undefined;
      document.removeEventListener("touchmove", this.dragHandler);
      document.removeEventListener("touchend", this.deactivate);
      this.active = false;
    }
  }
});

// SYNTH

Vue.component("synth", {
  template: "#synth",
  data() {
    return {
      volume: 0,
      options: Tone.chromaOptions,
      synth: new Tone.mainSynth(Tone.volume)
    };
  },
  filters: {
    tri: function(val) {
      return val.slice(0, 3).toUpperCase();
    }
  },
  computed: {},
  watch: {}
});

// CHORDION

Vue.component("chordion", {
  template: "#chordion",
  data: function() {
    return {
      notes: Chroma.Notes,
      chords: Chroma.Chords,
      inversion: -1,
      playing: false,
      synth: {}
    };
  },
  props: {
    scale: {
      type: Object
    },
    root: {
      default: 0
    }
  },
  computed: {
    activeSteps: function() {
      let activeSteps = Tone.arrayRotate(this.scale.steps, -this.root);

      return activeSteps;
    },
    activeNotes: function() {
      for (let i = 0; i < 12; i++) {
        this.notes[i].active = this.activeSteps[i];
      }
      return this.notes;
    }
  },
  methods: {
    invert: function(chord, inv) {
      let invChord = chord.slice();
      for (i = 0; i < inv; i++) {
        invChord.push(invChord.shift());
        invChord[chord.length - 1] += 12;
      }
      return invChord;
    },
    chordTranslate: function(index, size, shift, top, topshift) {
      let translate = "translate(";

      if (index > 5) {
        translate += Number(index - 6) * size + shift + " " + topshift + ")";
      } else {
        translate +=
          Number(index * size + shift) + " " + Number(top + topshift) + ")";
      }
      return translate;
    },

    changeChord: function(pitch, chord, inv) {
      let octave = pitch < this.root ? 4 : 3;
      this.synth[pitch + chord.handle] = this.synth[pitch + chord.handle] || {};
      time = Tone.Transport.state == "started" ? Tone.quantization : "+0.001";

      console.log(chord.inversion, inv);

      if (chord.inversion != inv) {
        let toStop = [];
        let playing = this.invert(chord.steps, chord.inversion);
        for (i of playing) {
          if (this.synth[pitch + chord.handle][i]) {
            this.synth[pitch + chord.handle][i].triggerRelease();
          }
        }
        chord.inversion = inv;
      }
      let invChord = this.invert(chord.steps, inv);
      let toPlay = [];
      for (let i of invChord) {
        this.synth[pitch + chord.handle][i] = new Tone.mainSynth(Tone.volume);
        this.synth[pitch + chord.handle][i].triggerAttack(
          Tone.calcFrequency(pitch + i, octave),
          time,
          Tone.chromaOptions
        );
      }
    },
    stopChord: function(pitch, chord, event) {
      if (this.playing) {
        this.playing = false;
        let octave = pitch < this.root ? 4 : 3;
        let time =
          Tone.Transport.state == "started" ? Tone.quantization : "+0.002";
        for (let i in this.synth[pitch + chord.handle]) {
          console.log(i);
          this.synth[pitch + chord.handle][i].triggerRelease();
          setTimeout(() => {
            if (
              !this.playing &&
              this.synth[pitch + chord.handle] &&
              this.synth[pitch + chord.handle][i]
            ) {
              this.synth[pitch + chord.handle][i].synth.dispose();
              this.synth = {};
            }
          }, Tone.chromaOptions.envelope.release * 1000);
        }

        chord.inversion = -1;
      }
    },

    slideChord: function(pitch, chord, event) {
      if (event.type == "mousedown" || event.type == "touchstart") {
        this.playing = true;
      }
      for (
        i = 0;
        i < (event.changedTouches ? event.changedTouches.length : 1);
        i++
      ) {
        let clientX = event.changedTouches
          ? event.changedTouches[i].clientX
          : event.clientX;
        let clientY = event.changedTouches
          ? event.changedTouches[i].clientY
          : event.clientY;
        let rect = event.changedTouches
          ? event.changedTouches[i].target.getBoundingClientRect()
          : event.target.getBoundingClientRect();
        let x = clientX - rect.x - rect.width / 2;
        let y = clientY - rect.y - rect.height / 2;
        if (chord.handle == "min") {
          y = -y;
        }

        if (this.playing) {
          if (
            chord.inversion != 2 &&
            x > 0 &&
            y > 0 &&
            Math.sqrt(3) * x + y > 50
          ) {
            this.changeChord(pitch, chord, 2);
          } else if (
            chord.inversion != 1 &&
            x < 0 &&
            y > 0 &&
            Math.sqrt(3) * Math.abs(x) + y > 50
          ) {
            this.changeChord(pitch, chord, 1);
          } else if (
            chord.inversion != 0 &&
            (Math.sqrt(3) * Math.abs(x) + y < 50 || y < 0)
          ) {
            this.changeChord(pitch, chord, 0);
          }
        }
      }
    }
  }
});

//KEY stack

Vue.component("key-stack", {
  template: "#key-stack",
  data: function() {
    return {
      octaves: [2, 4],
      notes: Chroma.Notes
    };
  },
  components: {
    vueSlider: window["vue-slider-component"]
  },
  props: {
    steps: {
      type: Array
    },
    root: {
      default: 0
    },
    r: {
      default: 65
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
    activeSteps: function() {
      let activeSteps = [];
      activeSteps = activeSteps.concat(
        this.steps.slice(-this.root),
        this.steps.slice(0, 12 - this.root)
      );
      return activeSteps;
    }
  },
  methods: {
    down: function(note, octave, ev) {
      ev.target.parentNode.style.opacity = 1;
      let touches = ev.changedTouches;
      if (ev.type == "touchstart") {
        for (let i = 0; i < touches.length; i++) {
          this.$emit("play", note, octave, touches[i].identifier);
        }
      } else {
        this.$emit("play", note, octave, 0);
      }
    },
    up: function(note, octave, ev) {
      ev.target.parentNode.style.opacity = 0.8;
      let touches = ev.changedTouches;
      if (ev.type == "touchend" || ev.type == "touchcancel") {
        for (let i = 0; i < touches.length; i++) {
          this.$emit("stop", note, octave, touches[i].identifier);
        }
      } else {
        this.$emit("stop", note, octave, 0);
      }
    }
  }
});

// FIELD

Vue.component("field", {
  template: "#field",
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
        this.synth[id][octave].gain = new Tone.Gain(octMix.toFixed(2)).toMaster();
        this.synth[id][octave].synth = new Tone.mainSynth(this.synth[id][octave].gain);
      }
      if (!this.synth[id][octTwo]) {
        this.synth[id][octTwo] = {}
        this.synth[id][octTwo].gain = new Tone.Gain((1-octMix).toFixed(2)).toMaster();
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
        this.synth[id][octave].gain = new Tone.Gain(octMix.toFixed(2)).toMaster();
        this.synth[id][octave].synth = new Tone.mainSynth(this.synth[id][octave].gain);
      }
      if (!this.synth[id][octTwo]) {
        this.synth[id][octTwo] = {}
        this.synth[id][octTwo].gain = new Tone.Gain((1-octMix).toFixed(2)).toMaster();
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
      
      console.log('Change: ',id, pitch, octave, octMix, octTwo)
      
      let time =
        Tone.Transport.state == "started"
          ? Tone.quantization
          : Tone.context.now();
      
       if (!this.synth[id][octave]) {
        this.synth[id][octave] = {}
        this.synth[id][octave].gain = new Tone.Gain(octMix.toFixed(2)).toMaster();
        this.synth[id][octave].synth = new Tone.mainSynth(this.synth[id][octave].gain);
      }
      if (!this.synth[id][octTwo]) {
        this.synth[id][octTwo] = {}
        this.synth[id][octTwo].gain = new Tone.Gain((1-octMix).toFixed(2)).toMaster();
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
      console.log(copy.pitch, copy.octave, copy.octMix, copy.octTwo, 1-copy.octMix);
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

// TRACKER

Vue.component("tracker", {
  template: "#tracker",
  props: {
    active: {
      default: true
    },
    trk: {
      default: {
        instrument: "kick"
      }
    }
  },
  data: function() {
    return {
      currentStep: 0,
      play: false,
      instruments: {},
      open: true,
      gain: 0,
      beat: false,
      instrument: ""
    };
  },
  computed: {
    beatCount: function() {
      return this.trk.pattern.length;
    },
    pattern: function() {
      return this.trk.pattern;
    },
    duration: function() {
      var pos = this.trk.duration.indexOf("n");
      var word = pos > 0 ? this.trk.duration.substr(0, pos) : this.trk.duration;
      console.log(word);
    }
  },
  methods: {
    act: function(pos) {
      this.loop.at(pos, { active: !this.trk.pattern[pos].active, num: pos });
      this.trk.pattern[pos].active = !this.trk.pattern[pos].active;
    },
    delTrack: function() {
      this.loop.stop();
      this.$emit("delTrack");
    },
    toggleLoop: function() {
      if (!this.play) {
        this.gain.gain.value = 1;
      } else {
        this.gain.gain.value = 0;
      }
      this.play = !this.play;
    },
    addBeat: function() {
      this.loop.add(this.trk.pattern.length, {
        active: false,
        num: this.trk.pattern.length
      });
      this.trk.pattern.push({ active: false, num: this.trk.pattern.length });
      this.loop.loopEnd = this.trk.pattern.length + "*" + this.trk.duration;
    },
    delBeat: function() {
      if (this.trk.pattern.length > 1) {
        this.loop.remove(this.trk.pattern.length - 1);
        this.trk.pattern.pop();
        this.loop.loopEnd = this.trk.pattern.length + "*" + this.trk.duration;
      }
    }
  },
  created: function() {
    this.gain = new Tone.Gain(0).connect(Tone.volume);

    this.synth = new Synth[this.trk.instrument]();
    this.synth.connect(this.gain);

    this.beat = function(num) {
      this.currentStep = num;
    };

    this.loop = new Tone.Sequence(
      (time, pitch) => {
        if (pitch.active) {
          this.synth.play(undefined, time, this.trk);
        }
        this.beat(pitch.num);
      },
      this.trk.pattern,
      this.trk.duration
    );

    this.loop.loop = true;
    this.loop.start(0);
  }
});

// METRONOME

Vue.component("metronome", {
  template: "#metronome",
  data: function() {
    return {
      play: false,
      pattern: [],
      beatCount: 16,
      tracks: [],
      loop: {},
      currentStep: 0,
      taps: [],
      beat: false,
      newDuration: "16",
      newInstr: "kick",
      playing: false,
      pressed: false,
      tempo: 90,
      tracks: []
    };
  },
  computed: {
    trackCount() {
      return this.tracks.length;
    },
    beatFrequency: function() {
      Tone.Transport.bpm.value = this.tempo;
      return this.tempo / 60;
    },
    toNote: function() {
      return Tone.Frequency(this.beatFrequency, "hz").toNote();
    }
  },
  methods: {
    tap: function() {
      let tapCount = 3;
      let tempo;
      let sum = 0;
      let tap = new Date().getTime();
      if (this.taps.length < tapCount) {
        this.taps.push(tap);
      } else {
        this.taps.shift();
        this.taps.push(tap);
        for (let i = 0; i < tapCount - 1; i++) {
          sum += this.taps[i + 1] - this.taps[i];
        }

        let tempo = Math.round(60000 / (0.5 * sum));

        this.tempo = tempo > 30 ? tempo : 30;
      }
    },
    addTrack() {
      this.instrument = new Synth[this.newInstr]();
      this.tracks.push(this.instrument.getDefault(this.newDuration));
    },
    delTrack: function(i) {
      this.tracks.splice(i, 1);
    },
    toggleTransport: function() {
      this.play = !this.play;
      Tone.Transport.toggle();
    }
  },
  created() {
    this.beating = new Tone.Loop(time => {
      this.beat = !this.beat;
    }, "8n");
    this.beating.start();
  },
  mounted: function() {}
});
