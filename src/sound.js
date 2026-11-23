/* Procedural room audio: switches, doors, TV, fans and footsteps. No audio files are loaded. */
window.createRoomSound = function () {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, noise = null, fanBus = null, waterBus = null, airBus = null, muted = false, failed = !AudioCtor;

  function ensure() {
    if (failed) return null;
    try {
      if (!ctx) {
        ctx = new AudioCtor();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.85;
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -10; limiter.ratio.value = 6;
        master.connect(limiter).connect(ctx.destination);
        const length = ctx.sampleRate * 2;
        noise = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    } catch (error) {
      failed = true; console.warn('Room audio unavailable:', error); return null;
    }
  }
  const ready = () => ctx && ctx.state === 'running' && !muted;

  function burst({ type = 'bandpass', freq = 2000, freqEnd, q = 1, gain = .3, attack = .002, decay = .06, delay = 0, rate = 1 }) {
    if (!ready()) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource(); src.buffer = noise; src.playbackRate.value = rate;
    const filter = ctx.createBiquadFilter(); filter.type = type; filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, t);
    if (freqEnd) filter.frequency.exponentialRampToValueAtTime(freqEnd, t + attack + decay);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    src.connect(filter).connect(env).connect(master);
    src.start(t, Math.random() * 1.5); src.stop(t + attack + decay + .05);
  }
  function tone({ freq = 440, freqEnd, type = 'sine', gain = .1, attack = .005, decay = .2, delay = 0 }) {
    if (!ready()) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator(); osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + attack + decay);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    osc.connect(env).connect(master); osc.start(t); osc.stop(t + attack + decay + .05);
  }

  function startFanBus() {
    if (fanBus || !ready()) return;
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
    const low = ctx.createBiquadFilter(); low.type = 'lowpass'; low.frequency.value = 520; low.Q.value = .4;
    const motor = ctx.createOscillator(); motor.type = 'triangle'; motor.frequency.value = 96;
    const motorGain = ctx.createGain(); motorGain.gain.value = .12;
    const gain = ctx.createGain(); gain.gain.value = 0;
    src.connect(low).connect(gain); motor.connect(motorGain).connect(gain); gain.connect(master);
    src.start(); motor.start();
    fanBus = { gain, low, motor };
  }

  function loopBus(type, freq, q) {
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = type; filter.frequency.value = freq; filter.Q.value = q;
    const gain = ctx.createGain(); gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(master); src.start();
    return { gain, filter };
  }
  function setBus(bus, level, peak) {
    if (!bus || !ctx) return;
    bus.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * peak, ctx.currentTime, .2);
  }

  return {
    setWater(level) {
      if (!ready()) { setBus(waterBus, 0, 0); return; }
      if (level > .001 && !waterBus) waterBus = loopBus('bandpass', 1700, .5);
      setBus(waterBus, level, .16);
    },
    setAir(level) {
      if (!ready()) { setBus(airBus, 0, 0); return; }
      if (level > .001 && !airBus) airBus = loopBus('lowpass', 900, .3);
      setBus(airBus, level, .07);
    },
    beep() { tone({ freq: 2200, gain: .05, decay: .09 }); tone({ freq: 2900, gain: .04, decay: .08, delay: .11 }); },
    flush() {
      burst({ type: 'bandpass', freq: 1200, q: 3, gain: .25, decay: .05 });
      burst({ type: 'lowpass', freq: 500, freqEnd: 1800, gain: .5, attack: .4, decay: 1.6, delay: .1 });
      burst({ type: 'bandpass', freq: 2200, freqEnd: 600, q: .8, gain: .25, attack: .8, decay: 1.8, delay: .4 });
    },
    rustle() { burst({ type: 'bandpass', freq: 900, freqEnd: 500, q: .7, gain: .22, attack: .08, decay: .45 }); tone({ freq: 70, freqEnd: 45, gain: .12, attack: .05, decay: .25, delay: .15 }); },
    unlock() { ensure(); },
    isMuted() { return muted; },
    setMuted(value) {
      muted = !!value;
      if (master) master.gain.setTargetAtTime(muted ? 0 : .85, ctx.currentTime, .05);
    },
    click(on) {
      burst({ type: 'highpass', freq: on ? 3200 : 2600, gain: .5, decay: .025 });
      burst({ type: 'bandpass', freq: on ? 1400 : 1100, q: 3, gain: .25, decay: .04, delay: .012 });
    },
    door(opening) {
      // Latch release or strike, then a soft swing of air and a hinge creak.
      burst({ type: 'bandpass', freq: 1800, q: 4, gain: .35, decay: .05 });
      tone({ freq: opening ? 520 : 480, freqEnd: opening ? 360 : 330, type: 'sawtooth', gain: .018, attack: .08, decay: .45, delay: .05 });
      burst({ type: 'lowpass', freq: 700, freqEnd: 220, gain: .12, attack: .15, decay: .55, delay: .05 });
    },
    latch() {
      tone({ freq: 95, freqEnd: 55, gain: .35, attack: .003, decay: .14 });
      burst({ type: 'bandpass', freq: 2400, q: 5, gain: .3, decay: .04, delay: .01 });
    },
    tv(on) {
      burst({ type: 'highpass', freq: 2800, gain: .25, decay: .02 });
      if (on) { tone({ freq: 60, gain: .05, attack: .04, decay: .5 }); tone({ freq: 15800, gain: .006, attack: .02, decay: .7 }); }
      else tone({ freq: 180, freqEnd: 60, gain: .05, decay: .18 });
    },
    footstep(surface = 'tile', strength = 1) {
      const s = Math.max(.25, Math.min(1, strength));
      const pitch = .9 + Math.random() * .2;
      if (surface === 'stair') {
        tone({ freq: 120 * pitch, freqEnd: 70, gain: .2 * s, attack: .003, decay: .09 });
        burst({ type: 'bandpass', freq: 900 * pitch, q: 1.2, gain: .12 * s, decay: .07 });
      } else {
        tone({ freq: 85 * pitch, freqEnd: 50, gain: .14 * s, attack: .004, decay: .08 });
        burst({ type: 'highpass', freq: 3000 * pitch, gain: .05 * s, decay: .035 });
      }
    },
    setFan(level) {
      if (!ready()) { if (fanBus && ctx) fanBus.gain.gain.setTargetAtTime(0, ctx.currentTime, .1); return; }
      if (level > .001) startFanBus();
      if (!fanBus) return;
      const t = ctx.currentTime, l = Math.max(0, Math.min(1, level));
      fanBus.gain.gain.setTargetAtTime(l * .1, t, .25);
      fanBus.low.frequency.setTargetAtTime(260 + l * 420, t, .25);
      fanBus.motor.frequency.setTargetAtTime(60 + l * 45, t, .25);
    },
    dispose() { if (ctx) ctx.close().catch(() => {}); ctx = null; fanBus = waterBus = airBus = null; }
  };
};
