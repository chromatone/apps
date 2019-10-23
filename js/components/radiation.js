Vue.component("radiation", {
  template: `<canvas class="zdog-canvas" width="400" height="400"></canvas>`,
  data: function() {
    return {
      illo:'',
      paths:{}
    };
  },
  methods: {
    animate() {
      this.illo.updateRenderGraph();
      requestAnimationFrame( this.animate );
    }
  },
  mounted() {
    this.illo = new Zdog.Illustration({
      element: '.zdog-canvas',
      dragRotate: true,
    });

    this.paths.mf = new Zdog.Shape({
      addTo: this.illo,
      path: [
        { x: -100, y: 0 },   // start
        { arc: [
          { x:  -50, y: -100 }, // corner
          { x:  0, y:  0 }, // end point
        ]},
        { arc: [ // start next arc from last end point
          { x:  50, y:  100 }, // corner
          { x:  100, y:  0 }, // end point
        ]},
      ],
      closed: false,
      stroke: 20,
      color: '#636'
    });

    this.paths.mf2 = this.paths.mf.copy({
      rotate: { x: Zdog.TAU/4 },
      color: '#f80'
    })

    this.animate();
  }
});
