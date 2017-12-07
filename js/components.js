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
    down: function (note, ev) {

      if (ev.type=="touchstart") {
        for (let i=0;i<ev.changedTouches.length;i++) {
          this.$emit('play', note , ev.changedTouches[i].identifier)

        }
      } else {
        this.$emit('play', note, 0)
      }


    },
    up: function (note,ev) {

      if (ev.type=="touchend" || ev.type=="touchcancel") {
        for (let i=0;i<ev.changedTouches.length;i++) {
          this.$emit('stop', note, ev.changedTouches[i].identifier)

        }
      } else {
          this.$emit('stop', note, 0)
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
