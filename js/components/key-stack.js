//KEY stack

export const keyStack = {
  template: ` <div>
      <div class="octave-slider">
        <b-slider v-model="octaves" :max="8" :height="12" :step="1"></b-slider>
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
    down(note, octave, ev) {

      Synth.chromaSynth.triggerAttack(Synth.calcFrequency(note.pitch, octave));
    },
    up(note, octave, ev) {
        Synth.chromaSynth.triggerRelease(Synth.calcFrequency(note.pitch, octave));
    }
  }
}
