import WebMidi from '../../assets/webmidi.js'

export const midiBus = {
  template:`
    <div class="midi-bus" :class="{'absolute':absolute}">
      <div class="devices">
        <span class="status" :class="{'active':midi.supported, 'error':!midi.supported}">
          MIDI</span><span v-for="input in midi.inputs" class="status">{{input.name}}</span>
      </div>

    </div>
  `,
  props: ['absolute'],
  data() {
    return {
      midi: {
        supported:WebMidi.supported,
        inputs:WebMidi.inputs,
        outputs:WebMidi.outputs
      },
      opz:{},
      lc:{},
      channels:{}
    }
  },
  watch: {
    'midi.inputs': function (inputs) {
      console.log(inputs)
      inputs.forEach((input) => {
        this.setListeners(input)
      }) 

    }
  },
  methods: {
    resetChannels() {
      this.channels={};
    },
    checkChannel(ch) {
      if (!this.channels[ch]) {
        this.$set(this.channels, ch, {num:ch,notes:{}, cc:{}})
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
      this.$midiBus.$emit('noteinon'+note.channel,note);
      this.checkChannel(ev.channel);
      this.$set(this.channels[ev.channel].notes, note.nameOct, note)
      this.$emit('update:channels', this.channels)
    },
    noteInOff(ev) {
      let note = this.makeNote(ev)
      this.$midiBus.$emit('noteinoff'+note.channel, note)
      if (this.channels[ev.channel] && this.channels[ev.channel].notes && this.channels[ev.channel].notes[note.nameOct]) {
        this.channels[ev.channel].notes[note.nameOct].velocity=0;
      }
      this.$emit('update:channels', this.channels)
    },
    ccInChange(ev) {
      this.$midiBus.$emit(ev.channel+'cc'+ev.controller.number,ev.value)
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
      this.$midiBus.$emit('reset');
      this.$emit('update:channels', this.channels)
    },
    setListeners(input) {
      input.removeListener();
      input.addListener('noteon', "all", this.noteInOn);
      input.addListener('noteoff', "all", this.noteInOff);
      input.addListener('controlchange', "all", this.ccInChange);
      input.addListener('stop', 'all', this.reset)

    },
    onMIDISuccess(midiAccess) {
      console.log( "MIDI ready!", midiAccess );
      midiAccess.inputs.forEach(input => {
        if (input.name == 'OP-Z') {
          this.opz.in=input;
          this.opz.in.onmidimessage = this.opzMIDIMessage
        }
        if (input.name == 'Launch Control XL') {
          this.lc.in = input;
          this.lc.in.onmidimessage = this.lcMIDIMessage
        }
      })
      midiAccess.outputs.forEach(output => {
        console.log(output.name)
        if (output.name == 'OP-Z') {
          this.opz.out=output
        } else if (output.name == 'Launch Control XL') {
          this.lc.out = output
        }
      })
    },
    onMIDIFailure(msg) {
      console.log( "Failed to get MIDI access - " + msg );
    },
    opzMIDIMessage(event) {
      if (event.data == 248) {return}
      if(event.data[1]!=1) {
        this.lc.out.send(event.data, event.timestamp)
      }
    },
    lcMIDIMessage(event) {
      this.opz.out.send(event.data, event.timestamp)
    }
  },
  computed: {

  },
  created() {
    if (WebMidi.supported) {
      WebMidi.enable();


    navigator.requestMIDIAccess().then( this.onMIDISuccess, this.onMIDIFailure );
    }
  /*  this.$midiBus.$on('noteouton', this.noteOutOn)
    this.$midiBus.$on('noteoutoff', this.noteOutOff) */
  }
}
