Vue.component("harmonics", {
  template: `
  <div id="harmonic-series">
		<svg id="artwork" viewBox="-10 -65 420 420">
			{{time}}

		<g v-for="(wave, harm) in waves">
			<polyline v-if="harm<harmNum && harm<7 && front" :points="wave.front.join(' ')" fill="transparent" stroke="rgba(255,0,0,0.3)" stroke-linejoin="round" stroke-miterlimit="5"></polyline>
			<polyline v-if="harm<harmNum && harm<7 && back" :points="wave.back.join(' ')" fill="transparent" stroke="rgba(0,0,255,0.3)" stroke-linejoin="round" stroke-miterlimit="5"></polyline>
			<polyline v-if="harm<harmNum && harm<7 && sum" :points="wave.sum.join(' ')" fill="transparent" stroke-width="2"  :stroke="colors[harm]" stroke-linejoin="round" stroke-miterlimit="5"></polyline>
		</g>
		<polyline :points="full.points.join(' ')" fill="transparent" stroke="black" stroke-linejoin="round" stroke-width="2" stroke-miterlimit="5"></polyline>
		<circle r="3" cx="0" cy="0" fill="black"></circle>
		<circle r="3" cx="400" cy="0" fill="black"></circle>


			<text v-for="num in harmonicsNumber" style="font-size:8px" x="3" :y="3+num*distance">{{(frequency*num).toFixed(2)}} Hz</text>
			<line v-for="semi in 48" :x1="length*2 - length*2/Math.pow(semitone,semi)" :x2="length*2 - length*2/Math.pow(semitone,semi)" y1="320" y2="350" stroke-width="1" stroke="grey"></line>
			<circle v-for="(dot,i) in dots" r="2" :cx="dot-8+i/1.7" cy="335" fill="grey">{{i}}</circle>
			<line x1="0" y1="0" x2="0" y2="340" stroke="black" ></line>
			<line x1="400" y1="0" x2="400" y2="340" stroke="black" ></line>
			<circle r="3" cx="0" cy="50" :fill="colors[0]"></circle>
			<circle r="3" :cx="length*2" cy="50" :fill="colors[0]"></circle>
			<rect x="0" width="400" y="320" height="30" stroke="black" fill="none"></rect>

			<g v-for="num in harmonicsNumber-1">
					<text style="font-size:10px" text-anchor="middle" v-for="col in num" :x="length*2/(num+1)*col" :y="90+(num-1)*distance - 10">1/{{num+1}}</text>

					<circle v-for="col in num" r="3" :cx="length*2/(num+1)*col" :cy="90+(num-1)*distance" :fill="colors[num]"></circle>
					<circle r="3" cx="0" :cy="90+(num-1)*distance" :fill="colors[num]"></circle>
					<circle r="3" :cx="length*2" :cy="90+(num-1)*distance" :fill="colors[num]"></circle>
					<line v-for="col in num" :x1="length*2/(num+1)*col" :y1="90+(num-1)*distance" :x2="length*2/(num+1)*col" y2="350" :stroke="colors[num]" >{{col}}</line>
					<text style="font-size:7px" v-for="col in num" :x="length*2/(num+1)*col" :y="327+(num-1)*4">1/{{num+1}}</text>
			</g>
		</svg>

		<div style="padding:0px 20px 20px 20px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr">
			<div>
				<input type="checkbox" v-model="front" /><span class="label">Front waves</span>
			</div>
			<div>
				<input type="checkbox" v-model="back" /><span class="label">Back waves</span>
			</div>
			<div>
				<input type="checkbox" v-model="sum" /><span class="label">Standing waves</span>
			</div>
			<div>
				<input type="checkbox" v-model="combine" /><span class="label">Combine waves</span>
			</div>
		</div>
			<div style="padding:0px 20px 100px 20px;display:grid;grid-template-columns:1fr 1fr">

        <b-field label="Frequency, Hz">
           <b-slider v-model="frequency" ticks :step="0.01" :min="0.05" :max="1"></b-slider>
        </b-field>


          <b-field label="Harmonics">
            <b-slider v-model="harmNum" ticks :step="1" :min="1" :max="25"></b-slider>
          </b-field>

			</div>

	</div>`,
  data: function() {
    return {
      semitone: 1.05946309436,
		frets:[3,5,7,9,12,15,17,19,21,24],
		length:200,
		distance:40,
		frequency: 0.5,
		amplitude: 10,
		time:0,
		date:new Date(),
		harmonics: [],
		harmonicsNumber:7,
		front:true,
		back:true,
		sum:true,
		combine:false,
		waves:[],
		full: {
			y:[],
			points:[]
		},
		harmNum:7,
		colors: ['grey','red','orange','yellow','green','blue', 'purple'],
		fillColors: ['rgba(0,0,0,0.05)',
								 'rgba(255,0,0,0.05)',
								 'rgba(255,165,0,0.05)',
								 'rgba(255,255,0,0.05)',
								 'rgba(0,128,0,0.05)',
								 'rgba(0,0,255,0.05)',
								 'rgba(128,0,128,0.05)',]
    };
  },
  props: {
    root: {
      default: 0
    }
  },
  watch: {
  		harmNum: function(){
  			for (i=0;i<this.harmNum;i++) {
  					this.waves[i]={
  						front:[],
  						back:[],
  						sum:[],
  						y:[]
  					}
  				}
  			}
  	},
  computed: {
		dots() {
			let vm=this;

			let dots=[];
			vm.frets.forEach(fret => {
				let dist = vm.length*2 - vm.length*2/Math.pow(vm.semitone,fret);
				dots.push(dist)
			})
			return dots
		}
	},
  methods: {
    draw () {
			let vm = this;

			vm.time=(Date.now()-vm.date)/1000;
			for (i=0; i<vm.harmonicsNumber; i++) {
				vm.harmonics[i].path=vm.calcPath(i)
			};

			let y1,y2,shift;
			for (x=0;x<=vm.length/2;x++) {
				vm.full.y[x]=0;
				for (i=0;i<vm.harmNum;i++) {
					if(vm.combine) {
						shift=0;
					} else {
						shift=10+(i+1)*40;
					}
					y1=vm.getY(i+1,x*4,true)/(i/2+1);
					y2=vm.getY(i+1,x*4,false)/(i/2+1);
					vm.waves[i].front[x]=x*4 + ',' + (y1 +shift).toFixed(2) ;
					vm.waves[i].back[x]=x*4 + ',' + (y2 +shift).toFixed(2);
					vm.waves[i].sum[x]=x*4 + ',' + (y1+y2+shift).toFixed(2);
					vm.full.y[x]+=y1+y2;
				}
				vm.full.points[x]=x*4 + ','+vm.full.y[x];
			}

			requestAnimationFrame(vm.draw);
		},

		calcPath (num) {
			let vm = this;
			let w = vm.length/(num+1);
			let h = 50 + num*vm.distance;
			let shift = Math.sin( vm.time * Math.PI * vm.frequency * (num+1) ) * vm.amplitude / (0.5*num+1);
			let harm=[];
			harm.push('M 0 ', h,' q ', w, ' ', shift, ' ', w*2, ' 0');
			for (j=0; j<num; j++) {
				harm.push(' t ', w*2, ' 0')
			}
			return harm.join('')

		},
		getY(num, x, way=true) {
			let vm=this;
			let y=0;
			let time = way ? -vm.time : vm.time;
			y=Math.sin(x/(vm.length*2)*Math.PI*num+time*Math.PI*num*vm.frequency)*vm.amplitude;
			return y
		}
  },
  created: function() {
    for (harm=0;harm<=this.harmonicsNumber;harm++) {
			this.harmonics.push({
				path:'M0 0',
				phase:0,
				shift:0,
				sign:true
			})
		}

		for (i=0;i<this.harmNum;i++) {
		this.waves[i]={
			front:[],
			back:[],
			sum:[],
			y:[]
		}
	}

		this.draw();
  }
});
