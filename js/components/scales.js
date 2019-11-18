import Chroma from '../Scales.js'

export const scales = {
  template: `   <div class="scale-select level wrap is-mobile">
    <div class="level-item">
        Scale
    </div>

    <div class="level-item scale-select">
        <b-field>
          <b-select size="is-small" v-model="scale">
            <option v-for="scal in scales" v-bind:value="scal">
              {{ scal.name }}
            </option>
          </b-select>
        </b-field>
    </div>
    <div class="level-item">

      <svg @touchstart.stop.prevent="1" width="100%" viewbox="0 0 390 40">
        <g v-for="(note, i) in activeNotes"
           :key="note"
            @touchstart.stop.prevent="root=note.pitch"
            @mousedown.stop.prevent="root=note.pitch"
            class="root-select">
          <circle
                r="14"
                :cx="20+i*32"
                :cy="20"
                :data-pitch="note.pitch"
                :data-active="note.active"
                :class="{'is-root':note.pitch==root}"
                :style="{stroke:notes[root].color}"></circle>
          <text
              :x="20+i*32"
              y="25"
              text-anchor="middle"
              fill="white"
              style="font-size:14px;font-weight:bold;text-anchor: middle;">{{note.name}}</text>
        </g>
      </svg>
    </div>
  </div>`,
  props: ["max", "min", "value", "step", "param"],
  data() {
    return {
      internalValue: this.mapNumber(this.value, this.min, this.max, 0, 100),
      active: false,
      initialX: undefined,
      initialY: undefined,
      initialDragValue: undefined,
      shiftPressed: false,
      scales:Chroma.Scales,
      scale:[],
      activeNotes:[]
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
}
