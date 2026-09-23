const keyConfig = {
  'c-key': { keyboard: 'c', frequency: 261.63 },
  'c-sharp-key': { keyboard: 'w', frequency: 277.18 },
  'd-key': { keyboard: 'd', frequency: 293.66 },
  'd-sharp-key': { keyboard: 'e', frequency: 311.13 },
  'e-key': { keyboard: 'e', frequency: 329.63 },
  'f-key': { keyboard: 'f', frequency: 349.23 },
  'f-sharp-key': { keyboard: 't', frequency: 369.99 },
  'g-key': { keyboard: 'g', frequency: 392 },
  'g-sharp-key': { keyboard: 'y', frequency: 415.3 },
  'a-key': { keyboard: 'a', frequency: 440 },
  'a-sharp-key': { keyboard: 'u', frequency: 466.16 },
  'b-key': { keyboard: 'b', frequency: 493.88 },
  'high-c-key': { keyboard: 'v', frequency: 523.25 },
};

const notes = new Map();
const keyboardMap = new Map();
const activeNotes = new Map();
let audioContext;

Object.entries(keyConfig).forEach(([id, config]) => {
  const key = document.getElementById(id);
  key.tabIndex = 0;
  key.setAttribute('role', 'button');
  key.setAttribute('aria-label', `Piano note, keyboard key ${config.keyboard.toUpperCase()}`);
  notes.set(id, key);
  keyboardMap.set(config.keyboard, id);
});

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
};

const playNote = (id) => {
  if (activeNotes.has(id)) return;
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.value = keyConfig[id].frequency;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.02);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();

  notes.get(id).classList.add('is-playing');
  activeNotes.set(id, { oscillator, gain });
};

const stopNote = (id) => {
  const sound = activeNotes.get(id);
  if (!sound) return;
  const context = getAudioContext();
  sound.gain.gain.cancelScheduledValues(context.currentTime);
  sound.gain.gain.setValueAtTime(Math.max(sound.gain.gain.value, 0.0001), context.currentTime);
  sound.gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.08);
  sound.oscillator.stop(context.currentTime + 0.09);
  notes.get(id).classList.remove('is-playing');
  activeNotes.delete(id);
};

notes.forEach((key, id) => {
  key.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    key.setPointerCapture?.(event.pointerId);
    playNote(id);
  });
  key.addEventListener('pointerup', () => stopNote(id));
  key.addEventListener('pointercancel', () => stopNote(id));
  key.addEventListener('lostpointercapture', () => stopNote(id));
  key.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      playNote(id);
    }
  });
  key.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' || event.key === ' ') stopNote(id);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.repeat || ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
  const id = keyboardMap.get(event.key.toLowerCase());
  if (!id) return;
  event.preventDefault();
  playNote(id);
});

document.addEventListener('keyup', (event) => {
  const id = keyboardMap.get(event.key.toLowerCase());
  if (id) stopNote(id);
});

const nextOne = document.getElementById('first-next-line');
const nextTwo = document.getElementById('second-next-line');
const nextThree = document.getElementById('third-next-line');
const startOver = document.getElementById('fourth-next-line');
const lastLyric = document.getElementById('column-optional');
const words = ['one', 'two', 'three', 'four', 'five', 'six'].map((name) => document.getElementById(`word-${name}`));
const lyricNotes = ['one', 'two', 'three', 'four', 'five', 'six'].map((name) => document.getElementById(`letter-note-${name}`));

const setLyrics = (line, notesForLine) => {
  line.forEach((word, index) => { words[index].textContent = word; });
  notesForLine.forEach((note, index) => { lyricNotes[index].textContent = note; });
};

nextTwo.hidden = true;
nextThree.hidden = true;
startOver.hidden = true;

nextOne.addEventListener('click', () => {
  nextOne.hidden = true;
  nextTwo.hidden = false;
  setLyrics(['HAP-', 'PY', 'BIRTH-', 'DAY', 'TO', 'YOU'], ['C', 'C', 'D', 'C', 'G', 'F']);
});

nextTwo.addEventListener('click', () => {
  nextTwo.hidden = true;
  nextThree.hidden = false;
  words[4].textContent = 'DEAR';
  words[5].textContent = 'FRI-';
  setLyrics(['HAP-', 'PY', 'BIRTH-', 'DAY', 'DEAR', 'FRIEND'], ['C', 'C', 'C5', 'A', 'F', 'E']);
  lastLyric.style.display = 'inline-block';
});

nextThree.addEventListener('click', () => {
  nextThree.hidden = true;
  startOver.hidden = false;
  setLyrics(['HAP-', 'PY', 'BIRTH-', 'DAY', 'TO', 'YOU!'], ['A#', 'A#', 'A', 'F', 'G', 'F']);
  lastLyric.style.display = 'none';
});

startOver.addEventListener('click', () => {
  startOver.hidden = true;
  nextOne.hidden = false;
  lastLyric.style.display = 'none';
  setLyrics(['HAP-', 'PY', 'BIRTH-', 'DAY', 'TO', 'YOU'], ['C', 'C', 'D', 'C', 'F', 'E']);
});
