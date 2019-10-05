//KEY stack

Vue.component("key-stack", {
  template: ` <div>
      <div class="octave-slider">
        <vue-slider v-model="octaves" :dot-size="24" :max="8" :height="12" direction="horizontal" :piecewise="true" :piecewise-label="true" :tooltip="false"></vue-slider>
      </div>
      <div class="keys-container">
        <div v-for="(octave, ind) in octavesNum">
          <svg @touchstart.stop.prevent="1" viewBox="30 0 1090 280">
           <rect x="30" rx="42" y="0" width="1090" height="280" style="opacity:0.75" :class="'octave'+octave"/>
            <g class="note"
              v-for="(note, pitch) in notes"
              :data-octave="octave"
              :fill="note.color"
              :class="note.name + octave"
              @touchstart.stop.prevent="down(note, octave,$event)"
              @touchend.stop.prevent="up(note, octave,$event)"
              @touchcancel.stop.prevent="up(note, octave,$event)"
              @mousedown.stop.prevent="down(note, octave,$event)"
              @mouseup.stop.prevent="up(note, octave,$event)"
              @mouseout.stop.prevent="up(note, octave,$event)">
                <circle :cx="120+note.posX*70" :cy="200-note.posY*120" :r="r "/>
                <text
                  text-anchor="middle"
                  :x="120+note.posX*70"
                  :y="225-note.posY*120" class="letters">{{note.name}}</text>
            </g>
        </svg>
        </div>
      </div>
    </div>`,
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
