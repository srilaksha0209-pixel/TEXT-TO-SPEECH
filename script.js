// ===== Grab all the elements we need =====
const textArea = document.getElementById('textToSpeak');
const charCount = document.getElementById('charCount');
const voiceSelect = document.getElementById('voiceSelect');
const rateSlider = document.getElementById('rateSlider');
const pitchSlider = document.getElementById('pitchSlider');
const volumeSlider = document.getElementById('volumeSlider');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const volumeValue = document.getElementById('volumeValue');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const statusMsg = document.getElementById('statusMsg');

const synth = window.speechSynthesis;
let voices = [];

// ===== 1. Character counter =====
// Updates live as the user types, so they always know how close to the limit they are
textArea.addEventListener('input', () => {
    charCount.textContent = textArea.value.length;
});

// ===== 2. Populate the voice dropdown =====
// getVoices() is sometimes empty on first call because the browser loads
// voices asynchronously — that's why we also listen for 'voiceschanged'
function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

loadVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}

// ===== 3. Live slider value display =====
rateSlider.addEventListener('input', () => {
    rateValue.textContent = parseFloat(rateSlider.value).toFixed(1);
});

pitchSlider.addEventListener('input', () => {
    pitchValue.textContent = parseFloat(pitchSlider.value).toFixed(1);
});

volumeSlider.addEventListener('input', () => {
    volumeValue.textContent = Math.round(volumeSlider.value * 100);
});

// ===== 4. Speak button =====
speakBtn.addEventListener('click', () => {
    const text = textArea.value.trim();

    if (text === '') {
        statusMsg.textContent = 'Please enter some text first.';
        return;
    }

    // Stop anything currently speaking before starting a new one
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices[voiceSelect.value];

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.rate = parseFloat(rateSlider.value);
    utterance.pitch = parseFloat(pitchSlider.value);
    utterance.volume = parseFloat(volumeSlider.value);

    // Update UI when speech actually starts
    utterance.onstart = () => {
        statusMsg.textContent = 'Speaking...';
        speakBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
    };

    // Reset UI when speech finishes naturally
    utterance.onend = () => {
        statusMsg.textContent = 'Done.';
        speakBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    };

    // Handle errors instead of failing silently
    utterance.onerror = () => {
        statusMsg.textContent = 'Something went wrong while speaking.';
        speakBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    };

    synth.speak(utterance);
});

// ===== 5. Pause / Resume button =====
// Same button toggles between pause and resume depending on current state
pauseBtn.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        pauseBtn.innerHTML = '<span class="btn-icon">▶</span> Resume';
        statusMsg.textContent = 'Paused.';
    } else if (synth.paused) {
        synth.resume();
        pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
        statusMsg.textContent = 'Speaking...';
    }
});

// ===== 6. Stop button =====
stopBtn.addEventListener('click', () => {
    synth.cancel();
    statusMsg.textContent = 'Stopped.';
    speakBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
});