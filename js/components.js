Vue.component ('keys' ,{
  template:'#keys',
  data: function() {
    return {
      notes:Chroma.Notes
    }
  },
  props: {
    octave: {
      default:4
    },
    shift: {
      default:0
    },
    r: {
      default:65
    }
  },
  mounted: function() {

  },
  methods: {
    down: function (pitch,octave,shift,ev) {

      if (ev.type=="touchstart") {
        for (let i=0;i<ev.changedTouches.length;i++) {
          this.$emit('play', ev.changedTouches[i].identifier, pitch,octave,shift)
        }
      } else {
        this.$emit('play', 0, pitch,octave,shift)
      }


    },
    up: function (pitch,octave,shift,ev) {

      if (ev.type=="touchend" || ev.type=="touchcancel") {
        for (let i=0;i<ev.changedTouches.length;i++) {
          this.$emit('stop', ev.changedTouches[i].identifier, pitch,octave,shift)
        }
      } else {
          this.$emit('stop', 0, pitch,octave,shift)
        }
      

    }
  }
});

Vue.component ('field', {
  template:'#field',
  data: function () {
    return {
      x:0,
      y:0,
    }
  },
  methods: {
    updateXY: function(event) {
      this.x=event.offsetX;
      this.y=event.offsetY;
    }
  }
})
