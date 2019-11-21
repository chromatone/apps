import Chroma from '../Scales.js'
import Synth from '../Synth.js'

const circleNote = {
	template:`<g><circle
	@mousedown.stop.prevent="playNote"
	@touchstart.stop.prevent="playNote"
	@mouseup.stop.prevent="stopNote"
	@mouseleave.stop.prevent="stopNote"
	@touchend.stop.prevent="stopNote"
	:r="r" :cx="0" :cy="0"
  :class="{deactivated:!active,root:root==note.pitch}"
	class="note-circle"
  stroke-width="2"
	:fill="note.color"></circle>

	<text text-anchor="middle" class="note-name" fill="white"
	:x="0" :y="8">{{note.name}}</text></g>`,
	props:['note','r','active','root'],
	data() {
		return {
			playing:false
		}
	},
	methods: {
		playNote() {
			if(!Tone.contextStarted) {Tone.context.resume()}
			this.playing=true;
      Synth.chromaSynth.set(Synth.chromaOptions);
      let octave = this.root > this.note.pitch ? 4:3;
			Synth.chromaSynth.triggerAttack(Synth.calcFrequency(this.note.pitch,octave))
		},
		stopNote() {
			this.playing=false;
      let octave = this.root > this.note.pitch ? 4:3;
			Synth.chromaSynth.triggerRelease(Synth.calcFrequency(this.note.pitch,octave))
		}
	}
}

//Chord-trigger

const chordTrigger ={
	template:`<polygon
	:transform="'rotate('+60*p+')'"
	@mousedown.stop.prevent="playChord"
	@touchstart.stop.prevent="playChord"
	@mouseleave.stop.prevent="stopChord"
	@mouseup.stop.prevent="stopChord"
	@touchend.stop.prevent="stopChord"
	class="chord-trigger"
  :class="{deactivated:!active}"
	:fill="note.color"
	points="0,0 80,0 80,46.188 40,69.28"/>`,
	props: ['note','p', 'chord','activeSteps'],
	methods: {
		playChord() {
			if(!Tone.contextStarted) {Tone.context.resume()};
      Synth.chromaSynth.set(Synth.chromaOptions);
			Synth.chromaSynth.triggerAttack(Tone.calcChord(this.theChord))
		},
		stopChord() {
			Synth.chromaSynth.triggerRelease(Tone.calcChord(this.theChord))
		}
	},
	computed: {
    active() {
      let active=true;
      let chord = this.theChord.map( x => x>11 ? x%12:x);
      let activity = chord.map( note => {
        if (!this.activeSteps[note]) {active=false}
      })
      return active
    },
		theChord() {
			return this.chord.map( x => x+this.note.pitch)
		}
	}
}

// MAIN Tonnetz-grid

export const tonalArray = {
	components: {
		'chord-trigger':chordTrigger,
		'circle-note':circleNote,
		vueSlider: window["vue-slider-component"]
	},
	template: `<svg id="tonal-array" viewBox="-80 -110 1040 770">
  <clipPath id="grid-mask">
    <rect x="-80" y="-110" width="1040" height="770" ry="20" rx="20"></rect>
  </clipPath>

			<g clip-path="url(#grid-mask)" v-for="(shift,n) in bgRows">
				<g v-for="(note, i) in rotate(fifths,shift-1).splice(0,7)" :transform="'translate('+ ((i-1)*2*dx + ((n+1)%2)*dx) +','+(n-1)*dy+')'">
					<polygon class="chord-triangle"
:class="{deactivated:hasMinor(note.pitch)}"
:fill="note.color" points="0,0 160,0 80,138.56"></polygon>
					<polygon class="chord-triangle major"
:class="{deactivated:hasMajor(note.pitch)}"
:fill="note.color" points="0,0 160,0 80,-138.56"></polygon>
					<text text-anchor="middle" class="chord-name" fill="white" :x="80" :y="-40">
{{note.name}}
</text>
					<text text-anchor="middle" class="chord-name" fill="white" :x="80" :y="55">{{note.name}}m</text>
				</g>
			</g>

			<g v-for="(shift,n) in rows">
				<g v-for="(note, i) in rotate(fifths,shift).splice(0,7)" :transform="'translate('+ (i*2*dx + (n%2)*dx) +','+n*dy+')'">
					<chord-trigger v-for="(chord, p) in chords" :key="p" :activeSteps="activeSteps" :chord="chord" :p="p" :note="note"></chord-trigger>
				</g>
			</g>

			<g v-for="(shift,n) in rows">
				<g v-for="(note, i) in rotate(fifths,shift).splice(0,6)" :transform="'translate('+ (i*2*dx + (n%2)*dx) +','+n*dy+')'">
					<circle-note :active="activeSteps[note.pitch]" :root="root" :note="note" :r="r"></circle-note>
				</g>
			</g>

		</svg>`,
  props: ['steps','root'],
	data() {
    return {
      notes: Chroma.Notes,
      r:28,
      dx:80,
      rowNum:12,
      colNum:12,
      rows:[0,9,5,2,10],
      bgRows:[4,0,9,5,2,10,7],
      scale: Chroma.Scales.major,
      chords:[
        [0,3,7],
        [0,3,8],
        [0,5,8],
        [0,5,9],
        [0,4,9],
        [0,4,7]
      ]
    }
	},
	methods: {
		rotate(A,n) {
      return Synth.arrayRotate(A,n)
    },
    hasMajor(pitch) {
     return !this.activeSteps[pitch] || !this.activeSteps[(pitch+4)%12] || !this.activeSteps[(pitch+7)%12]
    },
    hasMinor(pitch) {
     return !this.activeSteps[pitch] || !this.activeSteps[(pitch+3)%12] || !this.activeSteps[(pitch+7)%12]
    }
	},
	watch: {

	},
	created(){
		Synth.volume = Synth.volume ? Synth.volume : new Synth.volume(-10).toMaster();
		Tone.calcChord = function (chord) {
			return chord.map(x => Synth.calcFrequency(x))
		}
		Tone.synth = new Tone.PolySynth(8, Tone.Synth).connect(Synth.volume);

		Tone.synth.set(Synth.chromaOptions)
	},
	computed: {
    activeSteps: function() {
      let activeSteps = Synth.arrayRotate(this.scale.steps, this.root);
      return activeSteps;
    },
		dy() {
			return this.dx*2*0.866
		},
		fifths() {
			let fifths=[];
			for (let n=0;n<12;n++) {
				fifths[n]=this.notes[(7*n)%12]
			}
			return fifths
		}
	}
}
