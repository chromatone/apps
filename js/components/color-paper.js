const colorPaper = Vue.component('paper',{
  template: `
    <canvas class="paper" id="canvas" data-paper-resize="true">
      <arp v-if="channels[7]" :channel="channels[7]" :bus="bus"></arp>
    </canvas>
  `,
  props: ['channels','bus'],
  data() {
    return {
      layers:{},
      notes:{}
    }
  },
  methods: {
    reset() {
      this.layers={};
      this.createBackground();
    },
    createBackground() {
      this.layers[0] = new paper.Layer({
        name:'background'
      });
      var rect = new paper.Path.Rectangle({
          point: [0, 0],
          size: paper.view.bounds.size,
          fillColor: '#fff'
      });
      window.addEventListener('resize', () => {
        rect.bounds.size=paper.view.bounds.size;
      })
      rect.sendToBack();
    },

  },
  watch: {

  },
  created() {
  //  this.bus.$on('noteon',this.onNote);
    this.bus.$on('reset',this.reset);
  //  this.bus.$on('noteoff', this.noteOff)
  //  this.bus.$on('controlchange')

  },
  mounted() {
    paper.setup(this.$el);
    this.createBackground();
  }
})


/*



var path = new Path.Circle({
	center: [100, 100],
	radius: 50,
	fillColor: '#f00'
});

var circles={};

console.log(globals.WebMidi.inputs)
var channels=globals.colorControl.channels;

// The onFrame function is called up to 60 times a second:
function onFrame(event) {
    rect.fillColor.hue=channels[16].cc[20];
    for (var note in channels[7].notes) {
      if (!circles[note]) {
        circles[note] = new Path.Circle({
          center:[Math.random()*200+100,Math.random()*200+100],
          radius:50,
          fillColor:'green'
        })
      } else {

      }
    }
    for (var circle in circles) {
      if (!channels[7].notes[circle]) {
        if (circles[circle].opacity>0.05) {

          circles[circle].opacity-=0.005
        }
        else {

          circles[circle].visible=false;
          circles[circle].remove();
          delete circles[circle]
        }

      } else {
          circles[circle].opacity=1
      }
    }
    path.position.x=channels[1].cc[2]||0;


}


// The amount of symbol we want to place;
var count = 50;

// Create a symbol, which we will use to place instances of later:
var path = new Path.Circle({
	center: [0, 0],
	radius: 50,
	fillColor: '#f00',
	strokeColor: 'black'
});

var symbol = new Symbol(path);

// Place the instances of the symbol:
for (var i = 0; i < count; i++) {
	// The center position is a random point in the view:
	var center = Point.random() * view.size;
	var placed = symbol.place(center);
	placed.scale(i / count * 0.9);
	placed.data.vector = new Point({
		angle: Math.random() * 360,
		length : (i / count) * Math.random() * 2
	});
}

var vector = new Point({
	angle: 45,
	length: 0
});

var mouseVector = vector.clone();

function onMouseMove(event) {
	mouseVector = view.center - event.point;
	return false; // Prevent touch scrolling
}
console.log(project.activeLayer.children[0])
// The onFrame function is called up to 60 times a second:
function onFrame(event) {
	vector = vector + (mouseVector - vector) / 30;
  path.fillColor.hue += vector.length/100;
	// Run through the active layer's children list and change
	// the position of the placed symbols:
	for (var i = 0; i < count; i++) {
		var item = project.activeLayer.children[i];
		var size = item.bounds.size;
		var length = -vector.length / 10 * size.width / 1000;
		item.position += vector.normalize(length) + item.data.vector;

		keepInView(item);
	}
}

function keepInView(item) {
	var position = item.position;
	var viewBounds = view.bounds;
	if (position.isInside(viewBounds))
		return;
	var itemBounds = item.bounds;
	if (position.x > viewBounds.width + 50) {
		position.x = -item.bounds.width;
	}

	if (position.x < -itemBounds.width - 50) {
		position.x = viewBounds.width;
	}

	if (position.y > viewBounds.height + 50) {
		position.y = -itemBounds.height;
	}

	if (position.y < -itemBounds.height - 50) {
		position.y = viewBounds.height
	}
}
*/
