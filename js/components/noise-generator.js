Vue.component("noise", {
  template: `

  <div id="noise-generator">
      <b-field grouped>

          <div :class="{'is-primary': active}" class="button" @mousedown="playNoise()" @mouseup="stopNoise()">NOISE</div>

        <b-switch v-model="active"></b-switch>

        <b-field>
          <b-radio-button :key="type" v-model="synth.noise.type"
            v-for="type in types"
               :native-value="type"
               >

               <span>{{type}}</span>
           </b-radio-button>
        </b-field>
    	   <sqnob v-model="noiseOptions.volume" unit=" dB" param="VOL" :step="1" :min="-32" :max="0"></sqnob>
         <sqnob v-model="synth.noise.playbackRate" unit="" param="SPEED" :step="0.005" :min="0.1" :max="4"></sqnob>

      <b-field>
       <sqnob v-for="(env,i) in noiseOptions.envelope" v-model="synth.envelope[i]" :key="i" unit="" :param="i | trim" :step="0.01" :min="0.001" :max="4"></sqnob>
      </b-field>
    </b-field>

</div>

  `,
  data() {
    return {
      noiseOptions: {
        noise : {
          type : 'brown'
        },
        envelope : {
          attack : 0.005 ,
          decay : 0.1 ,
          sustain : 0.9,
          release: 1
        },
        volume:-10
      },
      types:['brown','pink','white'],
      active:false,
      filter: new Tone.AutoFilter(),
      synth: new Tone.NoiseSynth()
    }
  },
  filters: {
    trim(val) {
      let short = val.slice(0,3)
      return short.toUpperCase()
    }
  },
  methods: {
    playNoise() {
      this.synth.triggerAttack();
      this.active=true;
    },
    stopNoise() {
      this.synth.triggerRelease();
      this.active=false;
    }
	},
	watch: {
    'active'(val) {
      if(val) {
        this.synth.triggerAttack();
      } else {
        this.synth.triggerRelease()
      }
    },
    'noiseOptions.volume'(val) {
      this.synth.volume.setValueAtTime(val)
    }
	},
	mounted() {
    this.synth.set(this.noiseOptions)
    this.synth.envelope.attackCurve='sine';
    this.synth.connect(Synth.volume)
    console.log(this.synth)
	},
  beforeDestroy() {
    this.synth.triggerRelease();
  }
});
