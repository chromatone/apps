const midiBus = Vue.component('midi-bus', {
  template:`
    <div class="midi-bus" :class="{'absolute':absolute}">
      <div class="devices">
        <span class="status" :class="{'active':midi.supported, 'error':!midi.supported}">
          MIDI</span><span v-for="input in midi.inputs" class="status">{{input.name}}</span>
      </div>

    </div>
  `,
  props: ['bus', 'absolute'],
  data() {
    return {
      midi: {
        supported:WebMidi.supported,
        inputs:WebMidi.inputs,
        outputs:WebMidi.outputs
      },
      channels:{}
    }
  },
  watch: {
    'midi.inputs': function (inputs) {
      for (input of inputs) {
        this.setListeners(input)
      }

    }
  },
  methods: {
    resetChannels() {
      this.channels={};
    },
    checkChannel(ch) {
      if (!this.channels[ch]) {
        this.$set(this.channels, ch, {notes:{}, cc:{}})
      }
    },
    makeNote(ev) {
      let note=ev.note;
      let time = new Date();
      note.id=ev.note.name+note.octave+time.getTime();
      note.nameOct=note.name+note.octave;
      note.channel=ev.channel;
      note.velocity=ev.velocity;
      note.digit = (note.number+3)%12;
      return note
    },
    noteInOn(ev) {
      let note = this.makeNote(ev)
      this.bus.$emit('noteinon'+note.channel,note);
      this.checkChannel(ev.channel);
      this.$set(this.channels[ev.channel].notes, note.nameOct, note)
      this.$emit('update:channels', this.channels)
    },
    noteInOff(ev) {
      let note = this.makeNote(ev)
      this.bus.$emit('noteinoff', note)
      if (this.channels[ev.channel] && this.channels[ev.channel].notes && this.channels[ev.channel].notes[note.nameOct]) {
        this.channels[ev.channel].notes[note.nameOct].velocity=0;
      }
      this.$emit('update:channels', this.channels)
    },
    ccInChange(ev) {
      this.bus.$emit('controlchange',ev)
      this.checkChannel(ev.channel)
      this.$set(this.channels[ev.channel].cc,ev.controller.number,ev.value);
      this.$emit('update:channels', this.channels)
    },
    /*
    noteOutOn(note) {
      console.log(note)
      for (out in this.midi.outputs) {
        let output = this.midi.outputs[out]
        output.playNote(note.number, note.channel, {velocity:note.velocity})
      }
    },
    noteOutOff(note) {
      console.log(note)
      for (output in this.midi.outputs) {
        let output = this.midi.outputs[out]
        output.stopNote(note.number, note.channel, {velocity:note.velocity})
      }
    }, */
    reset(e) {
      this.resetChannels();
      this.bus.$emit('reset');
      this.$emit('update:channels', this.channels)
    },
    setListeners(input) {
      input.removeListener();
      input.addListener('noteon', "all", this.noteInOn);
      input.addListener('noteoff', "all", this.noteInOff);
      input.addListener('controlchange', "all", this.ccInChange);
      input.addListener('stop', 'all', this.reset)

    }
  },
  computed: {

  },
  created() {
    if (WebMidi.supported) {
      WebMidi.enable();
    }
  /*  this.bus.$on('noteouton', this.noteOutOn)
    this.bus.$on('noteoutoff', this.noteOutOff) */
  }
})
