// KNOB

Vue.component("knob", {
  template: `    <svg width="50" height="70" viewBox="0 -15 34 65"
        class="knob" @mousedown.stop.prevent="activate"
        @touchstart.stop.prevent="activate">
          <text x="17" y="-4">{{value | round}}</text>
        
          <circle class="mainCircle" cx="17" cy="15" r="13" :class="{ active: active}" />
          <line x1="17" y1="15" x2="17" y2="3" :transform="knobRotation"/>
          <text x="17" y="45">{{param}}</text>
    </svg>`,
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
