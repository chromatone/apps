// BEAT

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
      <b-field label="TYPE">
        <b-radio-button v-for="(ins,key) in ['kick','dsh','metal']" v-model="newInstr" :key="key"
            :native-value="ins">
            <span>{{ins}}</span>
        </b-radio-button>
      </b-field>

      <b-field label="VALUE">
        <b-radio-button v-for="(dur,key) in [4,8,16,32]" :key="key" v-model="newDuration"
            :native-value="dur">
            <span>{{ '1/'+ dur }}</span>
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



// TRACKER

Vue.component("tracker", {
  template: `<div class="track" :class="{open:open}">

		<div class="beat-row">

			<div class="beat-mute" :class="{'unmute':play}" @click="toggleLoop" @touchstart.prevent.stop="toggleLoop">
			<svg viewBox="0 1 40 40">
				<g :class="{'playing-track':play}">
											<path class="speaker" d="M8.6,22.9v-5.7c0-1.2,1-2.1,2.1-2.1h2.9l4.9-4.7c0.3-0.4,0.9-0.4,1.3-0.1c0.2,0.2,0.3,0.4,0.3,0.7v18.2
c0,0.5-0.4,0.9-0.9,0.9c-0.3,0-0.5-0.1-0.7-0.3L13.6,25h-2.9C9.5,25,8.6,24,8.6,22.9L8.6,22.9z"/>
											<g class="speaker-waves">
											<path d="M24.1,24c2.2-2.2,2.2-5.8,0-8c-0.3-0.3-0.7-0.3-1,0c-0.1,0.1-0.2,0.3-0.2,0.5v7c0,0.4,0.3,0.7,0.7,0.7
	C23.8,24.2,24,24.1,24.1,24z"/>
											<path d="M24.9,30.3c5.7-2.7,8.2-9.5,5.5-15.2c-1.1-2.4-3.1-4.4-5.5-5.5c-0.7-0.3-1.6,0.1-1.8,0.9c-0.2,0.7,0,1.4,0.6,1.7
	c4.3,2,6.1,7.1,4.1,11.4c-0.8,1.8-2.3,3.2-4.1,4.1c-0.7,0.4-0.9,1.3-0.5,2C23.5,30.3,24.2,30.6,24.9,30.3z"/>
										</g>
									</g>
			</svg>
			</div>
			<div class="beat-group">
				<div class="beat-block" :class="{active: beat.active,act: currentStep==j, fourth: j%4==0}" v-for="(beat,j) in trk.pattern"
												@mousedown="act(j)"
												@touchstart.prevent.stop="act(j)"
												@touchend.prevent.stop="pressed=false">
				</div>
			</div>
			<div class="beat-open" :class="{open:open}" @click="open=!open" @touchstart.prevent.stop="open=!open">
				<svg viewBox="0 0 20 20">
									<polygon class="arrow-collapse" points="8,7 12,7 10,12"/>
				</svg>
			</div>

		</div>



		<b-collapse class="track-options" :class="{closed:!open}" :open.sync="open">

			<div class="level field wrap is-mobile">

				<label class="track-label">
					{{trk.instrument.toUpperCase()}}&nbsp;
				</label>

				<button @click="delTrack()" class="button  del-track">
					X
				</button>

				<div class="level-item">
					<button @click="delBeat()" class="button">
							-
					</button>
					<button class="button is-static" :class="{'is-primary':play}">
						{{trk.pattern.length+'/'+ trk.duration.split('n')[0]}}
					</button>
					<button @click="addBeat()" class="button ">
						+
					</button>
				</div>

				<div class="level-item  has-text-centered">
					<knob min="0" max="0.9" param="VOL" v-model="trk.gain"></knob>
				</div>

				<div v-if="trk.options" class="level-item level adsr">
					<div class="level-item has-text-centered">
						OPT
					</div>

					<div v-for="option in synth.options" class="level-item has-text-centered">
						<knob :min="option.min"
									:max="option.max"
									:param="option.param"
									v-model="trk.options[option.name]"></knob>
					</div>
				</div>

				<div v-if="trk.envelope" class="level-item level adsr">
					<div class="level-item has-text-centered">
						ENV
					</div>
					<div v-for="param in synth.envelope" class="level-item has-text-centered">
						<knob :min="param.min"
									:max="param.max"
									:param="param.param"
									v-model="trk.envelope[param.name]"></knob>
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
