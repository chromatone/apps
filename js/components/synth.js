// SYNTH

Vue.component("synth", {
  template: `<div class="">
		<div class="level adsr-sliders">

			<div class="level-item">
				<knob min="-30" max="0" param="VOL" v-model="volume" />
			</div>

			<div v-for="option in synth.options" class="level-item">
				<knob :min="option.min" :max="option.max" :param="option.param" v-model="options[option.name]"  />
			</div>

			<div class="level-item level  adsr  adsr-sliders">
				<div class="level-item has-text-centered">ENV</div>
					<div v-for="(env,i) in synth.envelope" class="level-item">
						<knob :min="env.min" :max="env.max" :param="env.param" v-model="options.envelope[i]" />
					</div>
				</div>

			<div class="level-item level">

				<div class="level-item oscs">
						OSC:
				</div>

				<div class="level-item">
					<b-field >
						<b-radio-button v-for="type in synth.oscTypes" :key="type" v-model="options.oscillator.type" :native-value="type" size="is-small">
							{{type | tri}}
						</b-radio-button>
					</b-field>
				</div>

		</div>

		</div>
	</div>`,
  data() {
    return {
      volume: 1,
      options: Tone.chromaOptions,
      synth: new Tone.mainSynth(Tone.synthVolume)
    };
  },
  filters: {
    tri: function(val) {
      return val.slice(0, 3).toUpperCase();
    }
  },
  computed: {},
  watch: {
    volume(val) {
       Tone.synthVolume.volume.value=this.volume;
    }
  }
});
