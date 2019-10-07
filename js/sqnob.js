// KNOB

Vue.component("sqnob", {
  template: `
  <div @mousedown.stop.prevent="activate"
  @touchstart.stop.prevent="activate" class="sqnob">
    <div class="sqnob-info">
      {{value | round}}<br>
      {{param}}

    </div>
    <div class="sqnob-value" :style="{height:internalValue+'%'}"></div>
  </div>
  `,
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
      return Math.floor(val * 10) / 10;
    }
  },
  computed: {
    knobRotation() {
      let rotation = this.mapNumber(this.internalValue, 0, 100, 0, 270) - 135;
      return rotation;
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

      if (this.shiftPressed) {
        this.internalValue =
          this.initialDragValue + (this.initialY - yLocation) / 10;
      } else {
        this.internalValue =
          this.initialDragValue + (this.initialY - yLocation) / 2;
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
