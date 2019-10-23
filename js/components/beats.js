Vue.component("beat", {
  template: `<div class="rythm-box">
		<div class="metro-options">

			<div class="">
				<button class="button " :class="{pushed:play}" @click.prevent.stop="toggleTransport()">
      &#9654;
				</button>
			</div>

			<div class="">

				<button @click="tempo--" class="button">
						-
				</button>

				<button  @mousedown="tap()" @touchStart.prevent.stop="tap()" class="button ">
						{{tempo}} BPM
				</button>

				<button @click="tempo++" class="button ">
						+
				</button>

			</div>

			<div>

				<button :class="{active:beat}" class="button bpm  is-static">
						{{beatFrequency.toFixed(2)}} Hz
				</button>

				<button class="button is-static">
						{{toNote}}
				</button>
			</div>
		</div>

		<tracker v-for="(track,i) in tracks" :key="i" @delTrack="delTrack(i)" :trk="track"></tracker>

    <div class="tracker-options">
      <b-field label="TYPE" class="adsr">
        <b-radio-button v-for="(ins,key) in ['kick','dsh','metal']" v-model="newInstr" :key="key"
            :native-value="ins">
            <span>{{ins}}</span>
        </b-radio-button>
      </b-field>

      <b-field label="VALUE" class="adsr">
        <b-radio-button v-for="(dur,key) in durations" :key="key" v-model="newDuration"
            :native-value="dur.num">
            <span>{{ '1/'+ dur.num }}</span>
        </b-radio-button>
      </b-field>


        <button class="button" @click="addTrack()">

&#43; track
       </button>


    </div>
	</div>`,
  data: function() {
    return {
      play: false,
      pattern: [],
      beatCount: 16,
      tracks: [],
      loop: {},
      currentStep: 0,
      taps: [],
      beat: false,
      newDuration: 16,
      newInstr: "kick",
      playing: false,
      pressed: false,
      tempo: 90,
      durations:[{num:4,symbol:'&#9833;'},{num:8,symbol:'	&#9834;'},{num:16,symbol:'&#9835;'}, {num:32, symbol:'&#9836;'}],
      tracks: []
    };
  },
  computed: {
    trackCount() {
      return this.tracks.length;
    },
    beatFrequency: function() {
      Tone.Transport.bpm.value = this.tempo;
      return this.tempo / 60;
    },
    toNote: function() {
      return Tone.Frequency(this.beatFrequency, "hz").toNote();
    }
  },
  methods: {
    tap: function() {
      let tapCount = 3;
      let tempo;
      let sum = 0;
      let tap = new Date().getTime();
      if (this.taps.length < tapCount) {
        this.taps.push(tap);
      } else {
        this.taps.shift();
        this.taps.push(tap);
        for (let i = 0; i < tapCount - 1; i++) {
          sum += this.taps[i + 1] - this.taps[i];
        }

        let tempo = Math.round(60000 / (0.5 * sum));

        this.tempo = tempo > 30 ? tempo : 30;
      }
    },
    addTrack() {
      this.instrument = new Synth[this.newInstr]();
      this.tracks.push(this.instrument.getDefault(this.newDuration));
    },
    delTrack: function(i) {
      this.tracks.splice(i, 1);
    },
    toggleTransport: function() {
      this.play = !this.play;
      Tone.Transport.toggle();
    }
  },
  created() {
    this.beating = new Tone.Loop(time => {
      this.beat = !this.beat;
    }, "8n");
    this.beating.start();
  },
  mounted: function() {
  this.addTrack()}
});

Vue.component("tracker", {
  template: `<div class="track" :class="{open:open}">

		<div class="beat-row">

			<div class="beat-mute" :class="{'unmute':play}" @click="toggleLoop" @touchstart.prevent.stop="toggleLoop">
        <span>{{trk.instrument.toUpperCase()}}</span>
        <span>{{trk.pattern.length+'/'+ trk.duration.split('n')[0]}}</span>

			</div>
      <button @click="delBeat()" class="beat-block plus">
          -
      </button>
			<div class="beat-group">

				<div class="beat-block" :class="{active: beat.active,act: currentStep==j, fourth: j%4==0}" v-for="(beat,j) in trk.pattern"
												@mousedown="act(j)"
												@touchstart.prevent.stop="act(j)"
												@touchend.prevent.stop="pressed=false">
				</div>
			</div>


      <button @click="addBeat()" class="beat-block plus">
        +
      </button>
			<div class="beat-open" :class="{open:open}" @click="open=!open" @touchstart.prevent.stop="open=!open">

<span class="arrow-collapse">&#9660;</span>
			</div>

		</div>



		<b-collapse class="track-options" :class="{closed:!open}" :open.sync="open">

			<div class="level field wrap is-mobile">

        <button @click="delTrack()" class="beat-open del-track">

          &#10060;
        </button>

				<div class="level-item  has-text-centered">
					<sqnob min="0" max="0.9" param="VOL" v-model="trk.gain"></sqnob>
				</div>

				<div v-if="trk.options" class="level-item level adsr">
					<div class="level-item has-text-centered">
						OPT
					</div>

					<div v-for="option in synth.options" class="level-item has-text-centered">
						<sqnob :min="option.min"
									:max="option.max"
									:param="option.param"
									v-model="trk.options[option.name]"></sqnob>
					</div>
				</div>

				<div v-if="trk.envelope" class="level-item level adsr">
					<div class="level-item has-text-centered">
						ENV
					</div>
					<div v-for="param in synth.envelope" class="level-item has-text-centered">
						<sqnob :min="param.min"
									:max="param.max"
									:param="param.param"
									v-model="trk.envelope[param.name]"></sqnob>
					</div>
				</div>

			</div>


	</b-collapse>

	</div>`,
  props: {
    active: {
      default: true
    },
    trk: {
      default: {
        instrument: "kick"
      }
    }
  },
  data: function() {
    return {
      currentStep: 0,
      play: false,
      instruments: {},
      pressed:'',
      open: false,
      gain: 0,
      beat: false,
      instrument: ""
    };
  },
  computed: {
    beatCount: function() {
      return this.trk.pattern.length;
    },
    pattern: function() {
      return this.trk.pattern;
    },
    duration: function() {
      var pos = this.trk.duration.indexOf("n");
      var word = pos > 0 ? this.trk.duration.substr(0, pos) : this.trk.duration;
      console.log(word);
    }
  },
  methods: {
    act: function(pos) {
      this.loop.at(pos, { active: !this.trk.pattern[pos].active, num: pos });
      this.trk.pattern[pos].active = !this.trk.pattern[pos].active;
    },
    delTrack: function() {
      this.loop.stop();
      this.$emit("delTrack");
    },
    toggleLoop: function() {
      if (!this.play) {
        this.gain.gain.value = 1;
      } else {
        this.gain.gain.value = 0;
      }
      this.play = !this.play;
    },
    addBeat: function() {
      this.loop.add(this.trk.pattern.length, {
        active: false,
        num: this.trk.pattern.length
      });
      this.trk.pattern.push({ active: false, num: this.trk.pattern.length });
      this.loop.loopEnd = this.trk.pattern.length + "*" + this.trk.duration;
    },
    delBeat: function() {
      if (this.trk.pattern.length > 1) {
        this.loop.remove(this.trk.pattern.length - 1);
        this.trk.pattern.pop();
        this.loop.loopEnd = this.trk.pattern.length + "*" + this.trk.duration;
      }
    }
  },
  created: function() {
    this.gain = new Tone.Gain(0).connect(Synth.volume);

    this.synth = new Synth[this.trk.instrument]();
    this.synth.connect(this.gain);

    this.beat = function(num) {
      this.currentStep = num;
    };

    this.loop = new Tone.Sequence(
      (time, pitch) => {
        if (pitch.active) {
          this.synth.play(undefined, time, this.trk);
        }
        this.beat(pitch.num);
      },
      this.trk.pattern,
      this.trk.duration
    );

    this.loop.loop = true;
    this.loop.start(0);
    this.toggleLoop();
  }
});
