// ##################################################################################################### \\
//                                                                                                       \\
//              WolfMusic                                                                                \\
//              --------------------                                                                     \\
//              Build Number: 10386                                                                      \\
//              Version: 1.2.0                                                                           \\
//              Libraries: mido (python3.x)                                                              \\
//              Release: O2                                                                              \\
//              Verified: True                                                                           \\
//              Public ID: 00011221572                                                                   \\
//              Verificode: V1RO2-VT-P3X-BN10386-U001PU00011221572-YOPAP192026-MUSIC                     \\
//              Network: WolfNet Systems 2.1 APATN                                                       \\
//                                                                                                       \\
//              This data is only usable within WolfNet Systems 2.1 and later,                           \\
//              Please keep a copy of your Verificode in case you lose the program                       \\
//                                                                                                       \\
// ##################################################################################################### \\

let songData = []; 
let isPlaying = false;
let playbackStartTime = 0;
const PIANO_HEIGHT = 120;
const SCROLL_SPEED = 150; 
const START_NOTE = 21;
const END_NOTE = 108;
let noteColor = "#c391ff";
let glowColor = "#c391ff";
let keyColor = "#c391ff";
let particleColor = "#c391ff"
let soundFile = "note-5.wav";
let particles = [];

function loadSelectedSong() {
    const file = document.getElementById("songSelect").value;

    fetch(file)
        .then(res => res.json())
        .then(data => {
            songData = data;
            console.log("Loaded preset:", file);
        })
        .catch(err => console.error("Failed to load:", err));
}

async function loadSound(file) {
    try {
        const response = await fetch(file);
        const arrayBuffer = await response.arrayBuffer();
        pianoBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        console.log("Loaded sound:", file);
    } catch (err) {
        console.error("Failed to load sound:", err);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = -Math.random() * 2 - 1;
        this.alpha = 1;
        this.color = color;
        this.size = Math.random() * 4 + 4;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.01;
        this.size *= 0.96;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isDead() {
        return this.alpha <= 0 || this.size <= 0;
    }
}

function emitParticles(x, y, colorHex, amount = 1) {
    const rgb = hexToRgb(colorHex);
    for (let i = 0; i < amount; i++) {
        particles.push(new Particle(x, y, rgb));
    }
}

function updateParticles() {
    const ctx = drawingContext;
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.isDead()) particles.splice(i, 1);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const pPicker = document.getElementById("particleColorPicker");

    pPicker.addEventListener("input", (e) => {
        particleColor = e.target.value;
        console.log("Color changed:", particleColor);
    });
});

window.addEventListener("DOMContentLoaded", () => {
    const picker = document.getElementById("noteColorPicker");

    picker.addEventListener("input", (e) => {
        noteColor = e.target.value;
        console.log("Color changed:", noteColor);
    });
});

window.addEventListener("DOMContentLoaded", () => {
    const kpicker = document.getElementById("keyColorPicker");

    kpicker.addEventListener("input", (e) => {
        keyColor = e.target.value;
        console.log("Color changed:", keyColor);
    });
});

window.addEventListener("DOMContentLoaded", () => {
    const gpicker = document.getElementById("glowColorPicker");

    gpicker.addEventListener("input", (e) => {
        glowColor = e.target.value;
        console.log("Color changed:", glowColor);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                songData = JSON.parse(e.target.result);
                console.log("Loaded JSON from file!", songData);
            } catch (err) {
                console.error("Invalid JSON file:", err);
            }
        };

        reader.readAsText(file);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const soundInput = document.getElementById("soundInput");

    soundInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            audioCtx.decodeAudioData(arrayBuffer).then(buffer => {
                pianoBuffer = buffer; 
                console.log("Custom WAV loaded!");
            }).catch(err => {
                console.error("Failed to decode WAV:", err);
            });
        };

        reader.readAsArrayBuffer(file);
    });
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let alreadyPlaying = new Set(); 

async function loadSongData(jsonFile) {
    try {
        const response = await fetch(jsonFile);
        if (!response.ok) throw new Error("Failed to load JSON");
        songData = await response.json();
        console.log("Song loaded!", songData);
    } catch (err) {
        console.error(err);
    }
}

async function loadPianoSampleFromFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    pianoBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    console.log("Custom WAV loaded!");
}

async function loadDefaultPianoSample(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    pianoBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    console.log("Default piano sample loaded!");
}

document.addEventListener("DOMContentLoaded", () => {
    const soundInput = document.getElementById("soundInput");

    soundInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await loadPianoSampleFromFile(file);
        } catch (err) {
            console.error("Failed to load WAV:", err);
        }
    });
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    loadSongData("dark.json");
    if (!pianoBuffer) loadDefaultPianoSample('note-5.wav');
}

function playMusic() {
    if (songData.length === 0) {
        console.warn("No song loaded yet!");
        return;
    }
    playbackStartTime = millis();
    isPlaying = true;
    alreadyPlaying.clear(); 
}

let pianoBuffer = null;

async function loadPianoSample(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    pianoBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    console.log("Piano sample loaded!");
}

function playNote(midi, duration) {
    if (!pianoBuffer) return; 

    const source = audioCtx.createBufferSource();
    source.buffer = pianoBuffer;

    const semitoneDiff = midi - 60;
    source.playbackRate.value = Math.pow(2, semitoneDiff / 12);

    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01); 
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.2); 

    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.02; 
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.25;
    delay.connect(feedback);
    feedback.connect(delay);

    source.connect(gain);
    gain.connect(delay);
    delay.connect(audioCtx.destination);
    gain.connect(audioCtx.destination); 

    source.start(); 
}

function lightenColor(color, percent) {
    let num = parseInt(color.slice(1), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;

    return "#" + (
        0x1000000 +
        (Math.min(255, r) << 16) +
        (Math.min(255, g) << 8) +
        Math.min(255, b)
    ).toString(16).slice(1);
}

function darkenColor(color, percent) {
    let num = parseInt(color.slice(1), 16);
    let r = (num >> 16) - percent;
    let g = ((num >> 8) & 0x00FF) - percent;
    let b = (num & 0x0000FF) - percent;

    return "#" + (
        0x1000000 +
        (Math.max(0, r) << 16) +
        (Math.max(0, g) << 8) +
        Math.max(0, b)
    ).toString(16).slice(1);
}

function hexToRgb(hex) {
    let num = parseInt(hex.slice(1), 16);
    return {
        r: num >> 16,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function draw() {
    background(20);
    if (!isPlaying) {
        drawKeyboard([]); 
        return;
    }

    let currentTime = (millis() - playbackStartTime) / 1000;
    let activeMidiNotes = [];

    songData.forEach(item => {
        let x = getNoteX(item.midi);
        let noteWidth = getNoteWidth(item.midi);

        let timeUntilStart = item.start - currentTime;
        let yBottom = (height - PIANO_HEIGHT) - (timeUntilStart * SCROLL_SPEED);
        let noteHeight = item.duration * SCROLL_SPEED;
        let yTop = yBottom - noteHeight;

        let hitY = height - PIANO_HEIGHT;

        let velocity = item.velocity ? item.velocity / 127 : 0.7;

        let isActive = currentTime >= item.start && currentTime <= (item.start + item.duration);

        if (isActive) {
            activeMidiNotes.push(item.midi);

            emitParticles(
                x + noteWidth / 2,
                height - PIANO_HEIGHT,
                particleColor,
                1 
            );

            if (!alreadyPlaying.has(item)) {
                playNote(item.midi, item.duration);
                alreadyPlaying.add(item);
            }

            let ctx = drawingContext;

            let progress = (currentTime - item.start) / item.duration;
            let fadeIn = Math.min(1, (currentTime - item.start) * 8);
            let intensity = fadeIn * (1 - progress * 0.6);

            let size = 100 + velocity * 80;

            let glow = ctx.createRadialGradient(
                x + noteWidth / 2, hitY, 0,
                x + noteWidth / 2, hitY, size
            );

            let rgb = hexToRgb(glowColor);

            glow.addColorStop(0, `rgba(255,255,255,${0.8 * intensity})`);
            glow.addColorStop(0.3, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.6 * intensity})`);
            glow.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = glow;

            ctx.beginPath();
            ctx.arc(x + noteWidth / 2, hitY, size, 0, Math.PI * 2);
            ctx.fill();
        }

        if (yBottom > 0 && yTop < height) {
            let ctx = drawingContext;

            let gradient = ctx.createLinearGradient(x, yTop, x, yTop + noteHeight);
            gradient.addColorStop(0, lightenColor(noteColor, 40));
            gradient.addColorStop(0.5, noteColor);
            gradient.addColorStop(1, darkenColor(noteColor, 40));

            ctx.shadowColor = noteColor;

            ctx.fillStyle = gradient;

            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.roundRect(x, yTop, noteWidth, noteHeight, 6);
            ctx.fill();

            ctx.shadowBlur = 0; 
        }
    });

    drawKeyboard(activeMidiNotes);
    updateParticles();
}

function drawKeyboard(activeNotes) {
    let keyWidth = width / 52; 
    let whiteKeyIndex = 0;

    let rgb = hexToRgb(keyColor);

    for (let i = START_NOTE; i <= END_NOTE; i++) {
        if (!isBlackKey(i)) {
            let x = whiteKeyIndex * keyWidth;

            if (activeNotes.includes(i)) {
                fill(rgb.r, rgb.g, rgb.b); 

                drawingContext.shadowColor = keyColor;
                drawingContext.shadowBlur = 15;
            } else {
                fill(255);
                drawingContext.shadowBlur = 0;
            }

            stroke(0);
            rect(x, height - PIANO_HEIGHT, keyWidth, PIANO_HEIGHT);
            whiteKeyIndex++;
        }
    }

    drawingContext.shadowBlur = 0;

    whiteKeyIndex = 0;

    for (let i = START_NOTE; i <= END_NOTE; i++) {
        if (isBlackKey(i)) {
            let x = (whiteKeyIndex * keyWidth) - (keyWidth * 0.3);

            if (activeNotes.includes(i)) {
                fill(rgb.r * 0.6, rgb.g * 0.6, rgb.b * 0.6);

                drawingContext.shadowColor = keyColor;
                drawingContext.shadowBlur = 10;
            } else {
                fill(0);
                drawingContext.shadowBlur = 0;
            }

            rect(x, height - PIANO_HEIGHT, keyWidth * 0.6, PIANO_HEIGHT * 0.6);
        } else {
            whiteKeyIndex++;
        }
    }

    drawingContext.shadowBlur = 0;
}

function isBlackKey(midi) {
    let n = midi % 12;
    return (n === 1 || n === 3 || n === 6 || n === 8 || n === 10);
}

function getNoteX(midi) {
    let whiteKeyWidth = width / 52;
    let whiteKeyCount = 0;
    for (let i = START_NOTE; i < midi; i++) {
        if (!isBlackKey(i)) whiteKeyCount++;
    }
    
    let x = whiteKeyCount * whiteKeyWidth;
    if (isBlackKey(midi)) {
        x -= (whiteKeyWidth * 0.3);
    }
    return x;
}

function getNoteWidth(midi) {
    let whiteKeyWidth = width / 52;
    return isBlackKey(midi) ? whiteKeyWidth * 0.6 : whiteKeyWidth;
}

function startEverything() {
    playMusic();
    console.log("Started!");
}
