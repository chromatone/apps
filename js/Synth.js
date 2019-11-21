import Tone from '../assets/Tone.min.js'

const Synth = {
  arrayRotate (A, n, l = A.length) {
    const offset = ((n % l) + l) % l;
    return A.slice(offset).concat(A.slice(0, offset));
  },
  calcFrequency (pitch, octave = 3) {
    return Number(440 * Math.pow(2, octave - 4 + pitch / 12));
  }
};

Synth.rythm = {};

Synth.kick = function() {
  return {
    name: "kick",
    options: {
      pitchDecay: {
        min: 0.01,
        max: 0.5,
        default: 0.05,
        name: "pitchDecay",
        param: "DECAY"
      },
      octaves: {
        min: 1,
        max: 20,
        default: 7.5,
        name: "octaves",
        param: "OCT"
      },
      freq: {
        min: 10,
        max: 110,
        default: 27.5,
        name: "freq",
        param: "FREQ"
      }
    },
    getDefault,
    connect,
    envelope: {
      attack: {
        min: 0.001,
        max: 0.5,
        default: 0.001,
        name: "attack",
        param: "ATT"
      },
      decay: {
        min: 0.001,
        max: 1,
        default: 0.4,
        name: "decay",
        param: "DECAY"
      },
      sustain: {
        min: 0.01,
        max: 1,
        default: 0.01,
        name: "sustain",
        param: "SUS"
      }
    },
    vol: new Tone.Gain(0.8),
    init() {
      this.initiated = true;
      this.synth = new Tone.MembraneSynth().connect(this.vol);
    },
    play(freq, time, opts = { gain: 1, duration: "8n" }) {
      if (!this.initiated) {
        this.init();
      }
      this.vol.gain.value = opts.gain;
      Object.assign(this.synth, opts.options || {});
      Object.assign(this.synth.envelope, opts.envelope || {});
      this.synth.triggerAttackRelease(opts.options.freq, opts.duration, time);
    }
  };
};

Synth.metal = function() {
  return {
    name: "metal",
    getDefault,
    connect,
    options: {
      harmonicity: {
        min: 0.1,
        max: 7,
        default: 1,
        name: "harmonicity",
        param: "HARM"
      },

      octaves: {
        min: 0.1,
        max: 3,
        default: 1.5,
        name: "octaves",
        param: "OCT"
      },
      modulationIndex: {
        min: 10,
        max: 110,
        default: 42,
        name: "modulationIndex",
        param: "MOD"
      },
      resonance: {
        min: 1,
        max: 8000,
        default: 5000,
        name: "resonance",
        param: "RES"
      }
    },
    envelope: {
      attack: {
        min: 0.005,
        max: 0.5,
        default: 0.005,
        name: "attack",
        param: "ATT"
      },
      decay: {
        min: 0.001,
        max: 3,
        default: 0.05,
        name: "decay",
        param: "DECAY"
      }
    },
    vol: new Tone.Gain(0.8),
    init() {
      this.initiated = true;
      this.synth = new Tone.MetalSynth().connect(this.vol);
    },
    play(freq, time, opts = { gain: 1, duration: "8n" }) {
      if (!this.initiated) {
        this.init();
      }
      this.vol.gain.value = opts.gain;
      Object.assign(this.synth, opts.options || {});
      Object.assign(this.synth.envelope, opts.envelope || {});
      this.synth.triggerAttackRelease(opts.duration, time);
    }
  };
};

Synth.dsh = function() {
  return {
    name: "dsh",
    getDefault,
    connect,
    options: {
      freq: {
        min: 10,
        max: 8800,
        default: 30,
        name: "freq",
        param: "FREQ"
      },
      decay: {
        min: 0.005,
        max: 1,
        default: 0.08,
        name: "decay",
        param: "DECAY"
      },
      endPitch: {
        min: 0.005,
        max: 1,
        default: 0.5,
        name: "endPitch",
        param: "ENV"
      },
      sineNoiseMix: {
        min: 0.05,
        max: 1,
        default: 0.7,
        name: "sineNoiseMix",
        param: "NOISE"
      }
    },
    vol: new Tone.Gain(0.8),
    init() {
      this.initiated = true;
      let bufferSize = 2 * Tone.context.sampleRate;
      let noiseBuffer = Tone.context.createBuffer(
          1,
          bufferSize,
          Tone.context.sampleRate
      );
      let output = noiseBuffer.getChannelData(0);
      this.noiseBuffer = noiseBuffer;
      for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    },
    triggerAttackRelease(opts, startTime) {
      let { gain, options: { freq, decay, endPitch, sineNoiseMix } } = opts;
      let osc = new Tone.Oscillator();
      let mainGainNode = new Tone.Gain();
      let whiteNoise = new Tone.Player(this.noiseBuffer);
      let oscVol = new Tone.Gain();
      osc.connect(oscVol);
      oscVol.connect(mainGainNode.gain);
      mainGainNode.connect(this.vol);
      let noiseVol = new Tone.Gain();
      whiteNoise.connect(noiseVol);
      noiseVol.connect(mainGainNode);
      oscVol.gain.setValueAtTime((1 - sineNoiseMix) * 2, startTime);
      osc.start(startTime);
      osc.stop(startTime + decay);
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(
        freq * endPitch,
        startTime + decay
      );
      noiseVol.gain.setValueAtTime(sineNoiseMix * 2, startTime);
      whiteNoise.start(startTime);
      whiteNoise.stop(startTime + decay);
      mainGainNode.gain.setValueAtTime(gain, startTime);
      mainGainNode.gain.exponentialRampToValueAtTime(0.01, startTime + decay);
    },
    play(freq, time, opts = { gain: 1, duration: "8n" }) {
      if (!this.initiated) {
        this.init();
      }
      this.vol.gain.value = opts.gain;
      this.triggerAttackRelease(opts, time);
    }
  };
};

Synth.mono = function(output) {
  let vol = new Tone.Gain(0.8).connect(output);
  let synth = new Tone.Synth().connect(vol);
  return {
    name: "mono",
    oscType: "triangle",
    oscTypes: ["sine", "triangle", "square", "sawtooth", "pulse", "pwm"],
    vol,
    options: {
      portamento: {
        min: 0,
        max: 0.2,
        default: 0,
        name: "portamento",
        param: "PORT"
      }
    },
    envelope: {
      attack: {
        min: 0.001,
        max: 0.5,
        default: 0.001,
        name: "attack",
        param: "ATT"
      },
      decay: {
        min: 0.001,
        max: 1,
        default: 0.4,
        name: "decay",
        param: "DECAY"
      },
      sustain: {
        min: 0.01,
        max: 1,
        default: 0.01,
        name: "sustain",
        param: "SUS"
      },
      release: {
        min: 0.01,
        max: 2,
        default: 0.5,
        name: "release",
        param: "REL"
      }
    },
    synth,
    triggerAttack(freq, time, opts = { gain: 1, duration: "8n" }) {

      this.vol.gain.value = opts.gain;
      this.synth.set("oscillator.type", opts.oscillator.type);
      this.synth.set("portamento", opts.portamento || 0);
      this.synth.set("envelope", opts.envelope || {});
      this.synth.triggerAttack(freq, time);
    },
    triggerRelease(freq, time) {
      this.synth.triggerRelease(freq, time);
    }
  };
};

Synth.fm = function(output) {
  vol = new Tone.Gain(0.8).connect(output);
  synth = new Tone.PolySynth(4, Tone.FMSynth).connect(vol);
  return {
    name: "mono",
    oscType: "triangle",
    oscTypes: ["sine", "triangle", "square", "sawtooth", "pulse", "pwm"],
    vol,
    options: {
      portamento: {
        min: 0,
        max: 0.2,
        default: 0,
        name: "portamento",
        param: "PORT"
      }
    },
    envelope: {
      attack: {
        min: 0.001,
        max: 0.5,
        default: 0.001,
        name: "attack",
        param: "ATT"
      },
      decay: {
        min: 0.001,
        max: 1,
        default: 0.4,
        name: "decay",
        param: "DECAY"
      },
      sustain: {
        min: 0.01,
        max: 1,
        default: 0.01,
        name: "sustain",
        param: "SUS"
      },
      release: {
        min: 0.01,
        max: 2,
        default: 0.5,
        name: "release",
        param: "REL"
      }
    },
    synth,
    triggerAttack(freq, time, opts = { gain: 1, duration: "8n" }) {
      console.log(freq, time);
      this.vol.gain.value = opts.gain;
      this.synth.set("oscillator.type", opts.oscillator.type);
      this.synth.set("portamento", opts.portamento || 0);
      this.synth.set("envelope", opts.envelope || {});
      this.synth.triggerAttack(freq, time);
    },
    triggerRelease(freq, time) {
      console.log(freq, time);
      this.synth.triggerRelease(freq, time);
    },
    releaseAll() {
      this.synth.releaseAll();
    }
  };
};


// SYNTH base

Synth.chromaOptions = {
  gain: 1,
  portamento: 0,
  oscillator: {
    type: "triangle"
  },
  envelope: {
    attack: 0.15,
    decay: 0.4,
    sustain: 0.7,
    release: 1
  }
};

Synth.chromaSynth = new Tone.PolySynth(12, Tone.Synth);
Synth.analyser = new Tone.Analyser('fft',2048);
Synth.analyser.toMaster();
Synth.volume = new Tone.Volume(0).connect(Synth.analyser);
Synth.synthVolume = new Tone.Volume(1).connect(Synth.volume);
Synth.chromaSynth.connect(Synth.synthVolume);
Synth.mainSynth = Synth.mono;
Synth.quantization = "@32n";

export default Synth

function getDefault(duration = 16) {
  let setup = {
    instrument: this.name,
    pattern: [
      { active: true, num: 0 },
      { active: false, num: 1 },
      { active: false, num: 2 },
      { active: true, num: 3 },
      { active: false, num: 4 },
      { active: false, num: 5 },
      { active: true, num: 6 },
      { active: false, num: 7 }
    ],
    duration: duration + "n",
    gain: 0.6
  };
  setup.options = {};
  for (let option in this.options) {
    setup.options[option] = this.options[option].default;
  }
  if (this.envelope) {
    setup.envelope = {};
    for (let env in this.envelope) {
      setup.envelope[env] = this.envelope[env].default;
    }
  }
  return setup;
};

function connect(output) {
  this.vol.connect(output);
};
