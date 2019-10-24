Vue.component("radiation", {
  template: `<canvas class="zdog-canvas"></canvas>`,
  data: function() {
    return {
      illo:'',
      paths:{},
      waveGroup: {},
      waveNum:16,
      amplitude:300
    };
  },
  methods: {
    animate(time) {
      for(let i=0;i<this.waveNum;i++) {

        this.waveGroup.translate={x:time/28%200}
        this.waveGroup.rotate = {x: -time*Zdog.TAU/6000 }
        this.paths.mf.updatePath();
        this.paths.ef.updatePath();
      }

      this.illo.updateRenderGraph();
      requestAnimationFrame( this.animate );
    },
    createPath(begin={x:-this.illo.canvasWidth/2-200,y:0}, end={x:this.illo.canvasWidth/2+200,y:0}, waveNum=this.waveNum) {
      let path=[];
      path.push(begin);
      for (let i=0;i<waveNum;i++) {
        path.push({
          arc: [
            {x:begin.x+50+i*200,y:-100},
            {x:begin.x+100+i*200, y:0}
          ]
        })

        path.push({
          arc: [
            {x:begin.x+150+i*200,y:100},
            {x:begin.x+200+i*200, y:0}
          ]
        })

      }
      return path
    }
  },
  mounted() {
    this.illo = new Zdog.Illustration({
      element: '.zdog-canvas',
      dragRotate:true,
      resize:true,
      zoom:1,
      rotate:{ x: Zdog.TAU/8, z: Zdog.TAU/8 }
    });
    this.illo.onResize = () => {
      console.log(this.illo)
    }



    this.waveGroup = new Zdog.Group({
      addTo: this.illo,
    });

    this.paths.line =  new Zdog.Shape({
      addTo: this.waveGroup,
      path: [
        {x:-this.illo.canvasWidth/2,y:0},
        {x:this.illo.canvasWidth/2,y:0}
      ],
      closed: false,
      stroke: 2,
      color: '#000'
    });

    this.paths.mf = new Zdog.Shape({
      addTo:this.waveGroup,
      path: this.createPath(),
      closed: false,
      stroke: 10,
      color: '#636'
    });
    console.log(this.paths.mf)
    this.paths.ef =  new Zdog.Shape({
      addTo: this.waveGroup,
      path: this.createPath(),
      closed: false,
      stroke: 10,
      rotate: { x: Zdog.TAU/4 },
      color: '#f80'
    });


    for (let i=0;i<this.waveNum*2;i++) {
      this.paths[i*2] = new Zdog.Shape({
        addTo: this.waveGroup,
        path: [{x:(i-this.waveNum+6)*100+20,y:0}],
        stroke: 20,
        color: '#fff',
      });
    }

    this.animate();
  }
});
