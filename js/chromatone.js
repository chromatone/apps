
if (window.Buefy) {  Vue.use(Buefy.default); }

const ct = new Vue({
  el:"#chromatone",
  data: {
    midiBus:new Vue(),
    channels:{}
  },
  mounted: function() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      StartAudioContext(Tone.context, "button").then(function() {});
    }
  }

})
