Vue.component('pitch-table', {
	template: `  <div id="pitch-table">
	  <div class="slider-holder">
			<b-field label="Pitch table octaves">
				<b-slider v-model="octaveRange" type="is-primary" :min="-6" :max="9">
					<template v-for="val in [-4,-2,0,2,4,6,8]">
									 <b-slider-tick :value="val" :key="val">{{ val }}</b-slider-tick>
							 </template>
				</b-slider>
			</b-field>
		</div>

		<div class="table-holder">
			<table class="pitch-table">
				<tr v-for="note in reversedNotes" class="note-block" >

					<td is="note-cell" v-for="octave in octaves" :key="octave" :root="rootFreq" :note="note" :octave="octave" :tuning="tuning" :filter="filter" :type="oscType"></td>


				</tr>
			</table>
		</div>

	<div class="control-row">
	<div>
		<b-field grouped group-multiline  label="Intonation system">
			<b-radio-button  size="is-small" native-value="equal" v-model="tuning" >EQUAL</b-radio-button>
			<b-radio-button  size="is-small" native-value="just" v-model="tuning">JUST</b-radio-button>
		</b-field>
	</div>
	<div>
		<b-field grouped group-multiline label="Oscillator type">
			<b-radio-button :key="type"  size="is-small" v-for="type in oscTypes"
				:native-value="type" v-model="oscType">{{type}}</b-radio-button>
		</b-field>
	</div>
	<div>
		<b-field label="Low Pass">
			<sqnob v-model="filterFreq" unit=" Hz" param="LP FILTER" :step="1" :min="20" :max="25000"></sqnob>
		</b-field>
	</div>

	<div>
		<b-field label="A4">
			<sqnob v-model="rootFreq" unit=" Hz" param="FREQUENCY" :step="1" :min="415" :max="500"></sqnob>
		</b-field>
	</div>


	</div>

	</div>`,
	data() {
    return {
      notes:Chroma.Notes,
      octaveRange:[0,6],
      frequency:1,
      oscType:'sawtooth',
      oscTypes:['sine','triangle','sawtooth','square'],
      tuning:'equal',
      sound:false,
      started:false,
      rootFreq:440,
			filterFreq: 350,
      osc:'',
			filter:Tone.context.createBiquadFilter()
	  }
  },
	computed: {
		reversedNotes() {
			let notes=[...this.notes]
			return notes.reverse();
		},
		octaves() {
			let octaves=[];
			for(i=this.octaveRange[0];i<=this.octaveRange[1];i++) {
				octaves.push(i)
			}
			return octaves
		}
	},
	methods: {

	},
	watch: {
		frequency() {
			this.osc && this.osc.frequency.setValueAtTime(this.frequency,Tone.context.currentTime)
		},
		filterFreq (val) {
			this.filter.frequency.value=val
		}
	},
	created() {
    this.filter.connect(Synth.volume);
  },
  beforeDestroy() {
		this.filter.disconnect();
	}
});


// grid-cell

Vue.component('note-cell', {
	template:`
	<td	class="note-button"
				:style="{backgroundColor:color, color:textColor}"
				@click="toggle()"
				:class="{'active-tempo':active}"
				>
		<div class="note-grid">

			<div class="begin">
				{{note.name}}<br />{{octave}}
			</div>
			<div class="note-freq">
				{{frequency}}&nbsp;Hz
			</div>
			<div class="note-freq">
				{{bpm}}&nbsp;BPM
			</div>

		</div>

	</td>
	`,
	props:['note','octave','root', 'tuning','type','filter'],
	data() {
		return {
			active:false,
			started:false,
			justCents:[0,112,204,316,386,498,590,702,814,884,1017,1088],
		}
	},
	computed: {
		frequency() {
			return this.calcFreq(this.note.pitch, this.octave)
		},
		bpm() {
			return (this.frequency*60).toFixed(1)
		},
		textColor() {
			if (Math.abs(this.octave+2)*8>40) {
				return 'hsla(0,0%,0%,'+(this.active  ? '1' : '0.8')+')'
			} else {
				return 'hsla(0,0%,1000%,'+(this.active  ? '1' : '0.8')+')'
			}
		},
		color() {
			return 'hsla('+this.note.pitch*30+','+ (this.active  ? '100' : '50') +'%,'+Math.abs(this.octave+2)*8+'%)'
		}
	},
	watch: {
		root() {
			this.refresh()
		},
		tuning() {
			this.refresh()
		},
		type(val) {
			if(this.osc) {
				this.osc.type=val;
			}
		}
	},
	methods:{
		refresh() {
			if(this.osc) {
				this.osc.frequency.setValueAtTime(this.calcFreq(this.note.pitch, this.octave),Tone.context.currentTime)
			}
		},
		toggle() {
			if(!this.active) {
				if(Tone.context.state=='suspended') {Tone.context.resume()}

					this.osc = Tone.context.createOscillator();
					this.osc.type=this.type;
					this.osc.frequency.value=this.frequency;

					this.osc.connect(this.filter);
					this.osc.start();
					this.started=true;

				this.active=true;
			} else {
				this.active=false;
				this.osc.stop();
				this.osc.disconnect();
			}
		},
		calcFreq(pitch, octave=3, root=this.root) {
			let hz=0;
			if (this.tuning=='equal') {
				hz = Number(root * Math.pow(2, octave - 4 + pitch / 12)).toFixed(2)
			}
			if(this.tuning=='just') {
				let diff = Number(Math.pow((Math.pow(2,1/1200)),this.justCents[pitch]));
				hz = Number(root*Math.pow(2,(octave-4))*diff).toFixed(2)

			}
			 return hz
		},
	}
})
