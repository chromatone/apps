Vue.component("longitudal", {
  template: `

  <div id="longitudal-waves">

    <svg id="air-sound" width="100%" viewbox="0 0 250 150">

    <path :d="string" stroke="#000" stroke-width="2" fill="transparent" stroke-linecap="round"></path>

    <line v-for="line in displacements" :x1="22+line" :x2="22+line" y1="30" :y2="-10 + length*2" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-dasharray="0 3"></line>
    </svg>
    <div style="padding:0px 20px 0 20px;display:grid;grid-template-columns:1fr 1fr">
      <div>
        <span class="label">Frequency, Hz</span>
        <b-slider v-model="frequency" :step="0.05" :max="4"></b-slider>
      </div>
      <div>
        <span class="label">Amplitude, px</span>
        <b-slider v-model="amplitude" :step="0.1" :min="2" :max="20" ></b-slider>
      </div>
    </div>
</div>

  `,
  data() {
    return {
      string:'M20 10 q 20 10 0 20',
  		length:40,
  		distance:40,
  		lines:[],
  		displacements:[],
  		linesNum:117,
  		frequency: 0.5,
  		amplitude: 20,
  		time:0,
  		date:new Date()
    };
  },
  methods: {
		draw() {
			let vm = this;

			vm.time=(Date.now()-vm.date)/1000;
		  vm.string=vm.calcPath();
			for (i=0;i<vm.lines.length;i++) {
				vm.displacements[i]=vm.lines[i] + Math.sin((vm.time-i/10)*Math.PI*vm.frequency)*vm.amplitude/2;

			}

			requestAnimationFrame(vm.draw);
		},
		calcPath() {
			let vm = this;
			let shift = Math.sin( vm.time * Math.PI * vm.frequency ) * vm.amplitude;
			let wave=[];
			wave.push('M 20 10 q ', shift, ' ', vm.length, ' 0 ', vm.length*2);
			return wave.join('')

		}
	},
	watch: {
	},
	mounted: function(){

		for (x=0;x<this.linesNum;x++) {
			this.lines.push(x*4)
		}

		this.draw();

	}
});
