const arp = Vue.component('arp',{
  template: '<div></div>',
  props: ['channel', 'bus'],
  data() {
    return {
      layer: new paper.Layer({
        name:'arp'
      }),
      chNum:7
    }
  },
  watch: {
    'channel.notes'(notes) {

    }
  },
  methods: {
    randomCircle(note) {
      let bounds = paper.view.bounds
      let circle = new paper.Shape.Circle({
        nameOct:note.nameOct,
        center:[Math.random()*bounds.width, Math.random()*bounds.height*0.8+bounds.height*0.2],
        radius:Math.abs(210 - note.number*2),
        layer:this.layer,
        fillColor:{
          hue:note.digit*30,
          lightness:note.velocity,
          saturation:1
        }
      })
      circle.tween({
        opacity:0,
        'position.y':circle.position.y+Math.random()*300-150,
        'position.x':circle.position.x - Math.random()*paper.view.bounds.width
      },{
        duration:9000,
        easing:'easeOutQuad'
      }).then((t)=>{

      })
    }
  },
  mounted() {
    console.log(this.channel)
    this.bus.$on('noteon'+this.chNum, this.randomCircle)
  }
})
