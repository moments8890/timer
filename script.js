// --- Audio ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function beep(duration = 200, frequency = 880, volume = 0.2) {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.value = volume;
        osc.type = 'sine';
        osc.frequency.value = frequency;
        osc.start();
        setTimeout(() => osc.stop(), duration);
    } catch (e) {
        console.warn('Beep failed', e);
    }
}

// --- Navigation Logic ---
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('section');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        navButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active-section');
            section.classList.add('hidden-section');
        });

        // Show target section
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        targetSection.classList.remove('hidden-section');
        targetSection.classList.add('active-section');
    });
});


// --- Standard Timer Logic ---
let mainTimerInterval;
let mainTimeLeft = 5 * 60; // seconds
let mainIsRunning = false;
let mainWarningTriggered = false;
const MAIN_WARNING_THRESHOLD = 10;

const mainTimerDisplay = document.getElementById('main-timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const durationInput = document.getElementById('duration-input');

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateMainTimerDisplay() {
    mainTimerDisplay.textContent = formatTime(mainTimeLeft);

    // Apply blinking effect based on time remaining
    mainTimerDisplay.classList.remove('blink-30', 'blink-15', 'blink-10');
    if (mainTimeLeft <= 10 && mainTimeLeft > 0) {
        mainTimerDisplay.classList.add('blink-10');
    } else if (mainTimeLeft <= 15 && mainTimeLeft > 0) {
        mainTimerDisplay.classList.add('blink-15');
    } else if (mainTimeLeft <= 30 && mainTimeLeft > 0) {
        mainTimerDisplay.classList.add('blink-30');
    }
}

function startMainTimer() {
    if (mainIsRunning) return;
    
    if (mainTimeLeft <= 0) {
        resetMainTimer();
        return; 
    }

    mainIsRunning = true;
    mainTimerInterval = setInterval(() => {
        if (mainTimeLeft > 0) {
            mainTimeLeft--;
            updateMainTimerDisplay();
            if (!mainWarningTriggered && mainTimeLeft <= MAIN_WARNING_THRESHOLD) {
                mainWarningTriggered = true;
                beep(200, 880, 0.25);
                setTimeout(() => beep(150, 880, 0.2), 350);
            }
        } else {
            clearInterval(mainTimerInterval);
            mainIsRunning = false;
            mainTimerDisplay.classList.remove('blink-30', 'blink-15', 'blink-10');
        }
    }, 1000);
}

function pauseMainTimer() {
    clearInterval(mainTimerInterval);
    mainIsRunning = false;
    mainTimerDisplay.classList.remove('blink-30', 'blink-15', 'blink-10');
}

function resetMainTimer() {
    pauseMainTimer();
    const durationMins = parseInt(durationInput.value) || 5;
    mainTimeLeft = durationMins * 60;
    mainWarningTriggered = false;
    mainTimerDisplay.classList.remove('blink-30', 'blink-15', 'blink-10');
    updateMainTimerDisplay();
}

startBtn.addEventListener('click', startMainTimer);
pauseBtn.addEventListener('click', pauseMainTimer);
resetBtn.addEventListener('click', resetMainTimer);
durationInput.addEventListener('change', resetMainTimer);

// Initialize
resetMainTimer();


// --- Free Debate Timer Logic ---
let debateIntervalA;
let debateIntervalB;
let timeLeftA = 4 * 60;
let timeLeftB = 4 * 60;
let activeSide = null; // 'A', 'B', or null
const DEBATE_WARNING_THRESHOLD = 10;
let warningTriggeredA = false;
let warningTriggeredB = false;

const sideA = document.getElementById('side-a');
const sideB = document.getElementById('side-b');
const timerDisplayA = document.getElementById('timer-a');
const timerDisplayB = document.getElementById('timer-b');
const debateDurationInput = document.getElementById('debate-duration-input');
const resetDebateBtn = document.getElementById('reset-debate-btn');
const leftLabelInput = document.getElementById('left-label-input');
const rightLabelInput = document.getElementById('right-label-input');

function updateDebateDisplay() {
    timerDisplayA.textContent = formatTime(timeLeftA);
    timerDisplayB.textContent = formatTime(timeLeftB);

    // Apply blinking effect for side A
    timerDisplayA.classList.remove('blink-30', 'blink-15', 'blink-10');
    if (timeLeftA <= 10 && timeLeftA > 0) {
        timerDisplayA.classList.add('blink-10');
    } else if (timeLeftA <= 15 && timeLeftA > 0) {
        timerDisplayA.classList.add('blink-15');
    } else if (timeLeftA <= 30 && timeLeftA > 0) {
        timerDisplayA.classList.add('blink-30');
    }

    // Apply blinking effect for side B
    timerDisplayB.classList.remove('blink-30', 'blink-15', 'blink-10');
    if (timeLeftB <= 10 && timeLeftB > 0) {
        timerDisplayB.classList.add('blink-10');
    } else if (timeLeftB <= 15 && timeLeftB > 0) {
        timerDisplayB.classList.add('blink-15');
    } else if (timeLeftB <= 30 && timeLeftB > 0) {
        timerDisplayB.classList.add('blink-30');
    }
}

function startSideA() {
    if (activeSide === 'A' || timeLeftA <= 0) return;
    
    // Stop B
    clearInterval(debateIntervalB);
    sideB.classList.remove('active');
    sideB.classList.add('paused');
    
    // Start A
    activeSide = 'A';
    sideA.classList.add('active');
    sideA.classList.remove('paused');
    sideA.querySelector('.status').textContent = "Speaking...";
    sideB.querySelector('.status').textContent = "Waiting...";

    debateIntervalA = setInterval(() => {
        if (timeLeftA > 0) {
            timeLeftA--;
            updateDebateDisplay();
            if (!warningTriggeredA && timeLeftA <= DEBATE_WARNING_THRESHOLD) {
                warningTriggeredA = true;
                beep(180, 600, 0.22);
                setTimeout(() => beep(130, 600, 0.18), 300);
            }
        } else {
            clearInterval(debateIntervalA);
            sideA.classList.remove('active');
            timerDisplayA.classList.remove('blink-30', 'blink-15', 'blink-10');
            sideA.querySelector('.status').textContent = "Time's up!";
        }
    }, 1000);
}

function startSideB() {
    if (activeSide === 'B' || timeLeftB <= 0) return;

    // Stop A
    clearInterval(debateIntervalA);
    sideA.classList.remove('active');
    sideA.classList.add('paused');

    // Start B
    activeSide = 'B';
    sideB.classList.add('active');
    sideB.classList.remove('paused');
    sideB.querySelector('.status').textContent = "Speaking...";
    sideA.querySelector('.status').textContent = "Waiting...";

    debateIntervalB = setInterval(() => {
        if (timeLeftB > 0) {
            timeLeftB--;
            updateDebateDisplay();
            if (!warningTriggeredB && timeLeftB <= DEBATE_WARNING_THRESHOLD) {
                warningTriggeredB = true;
                beep(180, 1000, 0.22);
                setTimeout(() => beep(130, 1000, 0.18), 300);
            }
        } else {
            clearInterval(debateIntervalB);
            sideB.classList.remove('active');
            timerDisplayB.classList.remove('blink-30', 'blink-15', 'blink-10');
            sideB.querySelector('.status').textContent = "Time's up!";
        }
    }, 1000);
}

function pauseDebate() {
    clearInterval(debateIntervalA);
    clearInterval(debateIntervalB);
    activeSide = null;
    sideA.classList.remove('active', 'paused');
    sideB.classList.remove('active', 'paused');
    timerDisplayA.classList.remove('blink-30', 'blink-15', 'blink-10');
    timerDisplayB.classList.remove('blink-30', 'blink-15', 'blink-10');
}

function resetDebate() {
    pauseDebate();
    const durationMins = parseInt(debateDurationInput.value) || 4;
    timeLeftA = durationMins * 60;
    timeLeftB = durationMins * 60;
    warningTriggeredA = false;
    warningTriggeredB = false;
    timerDisplayA.classList.remove('blink-30', 'blink-15', 'blink-10');
    timerDisplayB.classList.remove('blink-30', 'blink-15', 'blink-10');
    updateDebateDisplay();
}

// Touch vs desktop interaction
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const idleStatus = isTouchDevice ? "Tap to start" : "Hover to start";
sideA.querySelector('.status').textContent = idleStatus;
sideB.querySelector('.status').textContent = idleStatus;

function pauseDebateAndReset() {
    pauseDebate();
    sideA.querySelector('.status').textContent = idleStatus;
    sideB.querySelector('.status').textContent = idleStatus;
}

const debateContainer = document.querySelector('.debate-container');

if (!isTouchDevice) {
    sideA.addEventListener('mouseenter', startSideA);
    sideB.addEventListener('mouseenter', startSideB);
    debateContainer.addEventListener('mouseleave', pauseDebateAndReset);
}

// Click: active side → stop; inactive side → start
sideA.addEventListener('click', () => {
    if (activeSide === 'A') pauseDebateAndReset();
    else startSideA();
});
sideB.addEventListener('click', () => {
    if (activeSide === 'B') pauseDebateAndReset();
    else startSideB();
});

resetDebateBtn.addEventListener('click', resetDebate);
debateDurationInput.addEventListener('change', resetDebate);

// Label customization
leftLabelInput.addEventListener('input', () => {
    const leftLabel = sideA.querySelector('h3');
    leftLabel.textContent = leftLabelInput.value || '不应该';
});

rightLabelInput.addEventListener('input', () => {
    const rightLabel = sideB.querySelector('h3');
    rightLabel.textContent = rightLabelInput.value || '应该';
});

// Arrow Key Controls for Free Debate
document.addEventListener('keydown', (e) => {
    // Only respond to keys when free-debate-section is active
    const freeDebateSection = document.getElementById('free-debate-section');
    if (!freeDebateSection.classList.contains('active-section')) return;

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        startSideA();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        startSideB();
    } else if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        pauseDebateAndReset();
    }
});

// Initialize
resetDebate();
