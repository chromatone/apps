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
    steps: {
      type: Array
    },
    root: {
      type: Number
    },
    r: {
      default:65
    }
  },
  mounted: function() {

  },
  computed:  {
    activeNotes: function () {
      console.log(this.notes)
      return this.notes
    }
  },
  methods: {
    down: function (note, octave, ev) {
      console.log(note, octave)
        ev.target.parentNode.style.opacity=1;
      if (ev.type=="touchstart") {
        for (let i=0;i<ev.changedTouches.length;i++) {
          this.$emit('play', note, octave , ev.changedTouches[i].identifier)
        }
      } else {
        this.$emit('play', note, octave, 0)
      }
    },
    up: function (note,octave, ev) {

        ev.target.parentNode.style.opacity=0.8;
      if (ev.type=="touchend" || ev.type=="touchcancel") {
        for (let i=0;i<ev.changedTouches.length;i++) {

          this.$emit('stop', note, octave, ev.changedTouches[i].identifier)

        }
      } else {
          this.$emit('stop', note, octave, 0)
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
      notes:Chroma.Notes,
      root:2
    }
  },
  props: {
    steps: {
      type:Array
    }
  },
  computed: {
    notes108: function () {

      let notes = [];
      for (let i=0;i<9;i++) {
        notes[i]=[];
        for (let j=0;j<12;j++) {
          notes[i][j]=this.notes[j];
        }
      }
      console.log(notes)
      return notes
    }
  },
  methods: {
    updateXY: function(event) {
      this.x=event.offsetX;
      this.y=event.offsetY;
    }
  }
})
