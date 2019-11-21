import Synth from '../Synth.js'

// Oscilloscope

export const oscilloscope = {
  template: ` <div id="oscilloscope">
    <svg viewBox="0 0 800 800">
      <polyline id="scope" fill="transparent"
      stroke="rgba(0,0,0,0.3)" stroke-width="2"
      :points="points.join(',')"/>
    </svg>
  </div>`,
  data() {
    return {
      sliceWidth:0,
      bufferLength:0,
      dataArray: new Uint8Array(Synth.analyser.fftSize),
      points:[]
    }
  },
 created() {
    this.bufferLength = Synth.analyser.fftSize;
    this.dataArray= new Uint8Array(Synth.analyser.fftSize);
    Synth.analyser.input.getByteTimeDomainData(this.dataArray);
    this.sliceWidth = window.innerWidth / this.bufferLength * 2.0;
    this.draw();

  },
  computed: {
    pointsSvg() {
      return this.points.join(',');
    }
  },
  methods: {
    draw() {
      Synth.analyser.input.getByteTimeDomainData(this.dataArray);
      let x=0;
      this.points=[];
      let firstZero;
      for (let i=1; i<this.bufferLength; i++) {
        let y = this.dataArray[i] / 128 * 400;
        if (firstZero !== undefined) {
          this.points.push(x,y);
          x+= this.sliceWidth;
        }
        if((this.dataArray[i] >= 128 && this.dataArray[i-1] < 128)
           || (this.dataArray[i] <= 128 && this.dataArray[i-1] > 128)) {
          if(firstZero === undefined && (this.dataArray[i] >= 128 &&
                                         this.dataArray[i-1] < 128)) {
            firstZero = i;
          }
        }
      }
      requestAnimationFrame(this.draw)
    }
  }
}
