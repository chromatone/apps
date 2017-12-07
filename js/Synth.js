Chroma.Synth = new function () {
    var S={};
    // ALL AUDIO CONTEXT DEFINITIONS
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    S.audio = new AudioContext();
    S.output = S.audio.createGain();
    S.volume = S.output.gain;
    S.volume.value=0.2;
    S.output.connect(S.audio.destination);
    S.filter = S.audio.createBiquadFilter();
    S.filter.type='lowshelf';
    S.filter.frequency=15000;
    S.filter.Q=0.8;
    S.attack = 0.1;
    S.decay = 0.3;
    S.sustain = 0.4;
    S.release = 0.4;
    S.oscType='sawtooth';
    S.scale=Chroma.Scales['major'];
    S.octave=4;
    S.band = {};
    // Connections
    S.filter.connect(S.output);

//FUNCTIONS

    S.calcFrequency = function (pitch,octave,base) {
      // For a twelve-tone, equally-tempered tuning,
      // frequency is given by the general formula:
      // freq = baseFreq * 2 ^ (intervalInSemitones / 12 )
      base=base||440;
      octave=octave||0;
      return base * Math.pow(2, (octave-4) + (pitch / 12)); // center around octave == 4, pitch == 0
    }

    S.playNote = function (pitch,octave,shift) {
        //Creates an oscillator for each pitch and starts it
        //It makes a two-dimensional array for notes from 0 to 11 in every octave
        let note = Number(pitch);
        octave=Number(octave||0);
        if (shift) {octave=Number(octave)+Number(shift)};

         if (!S.band.hasOwnProperty(octave)) {
           S.band[octave] = [];
         }
         if (!S.band[octave].hasOwnProperty(note)) {
           S.band[octave][note]= {};
           S.band[octave][note].osc = S.audio.createOscillator();
           S.band[octave][note].type=S.oscType;
           S.band[octave][note].gain=S.audio.createGain();
           S.band[octave][note].gain.gain.value=0;
           S.band[octave][note].osc.connect(S.band[octave][note].gain);
           S.band[octave][note].gain.connect(S.filter);
           S.band[octave][note].osc.frequency.value = S.calcFrequency(note,octave);
           S.band[octave][note].osc.start();
           S.band[octave][note].playing=true;
         }
         S.band[octave][note].gain.gain.setTargetAtTime(0, S.audio.currentTime,100);
         S.band[octave][note].gain.gain.setTargetAtTime(1, S.audio.currentTime,S.attack);
         S.band[octave][note].gain.gain.setTargetAtTime(S.sustain, S.audio.currentTime+S.attack,S.decay);
  }

  S.stopNote = function (pitch,octave,shift) {
      let note = Number(pitch);
      octave=Number(octave||0);
      if (shift) {octave=Number(octave)+Number(shift)};
       if (S.band && S.band.hasOwnProperty(octave) && S.band[octave].hasOwnProperty(note)) {
         S.band[octave][note].playing=false;
         S.band[octave][note].gain.gain.cancelScheduledValues(S.audio.currentTime);
         S.band[octave][note].gain.gain.setTargetAtTime(0, S.audio.currentTime,S.release);
       }
    }


    return S;
}
