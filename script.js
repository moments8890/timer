// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.dataset.section).classList.add('active');
    });
});

// Audio (from local)
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

// Standard Timer
const STANDARD_WARNING_THRESHOLD = 10;
let standardTime = 5 * 60;
let standardRunning = false;
let standardInterval;
let standardWarningTriggered = false;

const standardDisplay = document.getElementById('standardDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const durationInput = document.getElementById('durationInput');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function blink(element, speed) {
    element.style.animation = `blink-${speed} 0.3s infinite`;
}

function stopBlink(element) {
    element.style.animation = 'none';
}

function updateStandardDisplay() {
    standardDisplay.textContent = formatTime(standardTime);

    if (standardTime <= 10 && standardTime > 0) {
        blink(standardDisplay, 10);
    } else if (standardTime <= 30 && standardTime > 10) {
        blink(standardDisplay, 30);
    } else if (standardTime <= 60 && standardTime > 30) {
        blink(standardDisplay, 60);
    } else if (standardTime === 0) {
        blink(standardDisplay, 10);
    } else {
        stopBlink(standardDisplay);
    }
}

function startStandardTimer() {
    if (!standardRunning) {
        standardRunning = true;
        standardInterval = setInterval(() => {
            if (standardTime > 0) {
                standardTime--;
                updateStandardDisplay();
                if (!standardWarningTriggered && standardTime <= STANDARD_WARNING_THRESHOLD) {
                    standardWarningTriggered = true;
                    beep(200, 880, 0.25);
                    setTimeout(() => beep(150, 880, 0.2), 350);
                }
            } else {
                clearInterval(standardInterval);
                standardRunning = false;
            }
        }, 1000);
    }
}

function pauseStandardTimer() {
    standardRunning = false;
    clearInterval(standardInterval);
}

function resetStandardTimer() {
    pauseStandardTimer();
    standardTime = durationInput.value * 60;
    standardWarningTriggered = false;
    stopBlink(standardDisplay);
    updateStandardDisplay();
}

startBtn.addEventListener('click', startStandardTimer);
pauseBtn.addEventListener('click', pauseStandardTimer);
resetBtn.addEventListener('click', resetStandardTimer);
durationInput.addEventListener('change', resetStandardTimer);

// Free Debate Timer
const DEBATE_WARNING_THRESHOLD = 10;
let leftTime = 4 * 60;
let rightTime = 4 * 60;
let activeLeftSide = true;
let debateRunning = false;
let debateInterval;
let leftWarningTriggered = false;
let rightWarningTriggered = false;

const leftSide = document.getElementById('leftSide');
const rightSide = document.getElementById('rightSide');
const leftDisplay = document.getElementById('leftDisplay');
const rightDisplay = document.getElementById('rightDisplay');
const leftStatus = document.getElementById('leftStatus');
const rightStatus = document.getElementById('rightStatus');
const leftDuration = document.getElementById('leftDuration');
const rightDuration = document.getElementById('rightDuration');

function updateDebateDisplay() {
    leftDisplay.textContent = formatTime(leftTime);
    rightDisplay.textContent = formatTime(rightTime);

    if (activeLeftSide) {
        leftStatus.textContent = leftTime > 0 ? 'Speaking' : "Time's up!";
        rightStatus.textContent = 'Waiting';
    } else {
        leftStatus.textContent = 'Waiting';
        rightStatus.textContent = rightTime > 0 ? 'Speaking' : "Time's up!";
    }

    const activeDisplay = activeLeftSide ? leftDisplay : rightDisplay;
    const activeTime = activeLeftSide ? leftTime : rightTime;

    if (activeTime <= 10 && activeTime > 0) {
        blink(activeDisplay, 10);
    } else if (activeTime <= 30 && activeTime > 10) {
        blink(activeDisplay, 30);
    } else if (activeTime <= 60 && activeTime > 30) {
        blink(activeDisplay, 60);
    } else {
        stopBlink(activeDisplay);
    }

    stopBlink(activeLeftSide ? rightDisplay : leftDisplay);
}

function startDebateTimer() {
    if (!debateRunning) {
        debateRunning = true;
        leftSide.classList.toggle('active', activeLeftSide);
        rightSide.classList.toggle('active', !activeLeftSide);
        leftSide.classList.toggle('paused', !activeLeftSide);
        rightSide.classList.toggle('paused', activeLeftSide);
        debateInterval = setInterval(() => {
            if (activeLeftSide && leftTime > 0) {
                leftTime--;
                updateDebateDisplay();
                if (!leftWarningTriggered && leftTime <= DEBATE_WARNING_THRESHOLD) {
                    leftWarningTriggered = true;
                    beep(180, 600, 0.22);
                    setTimeout(() => beep(130, 600, 0.18), 300);
                }
            } else if (!activeLeftSide && rightTime > 0) {
                rightTime--;
                updateDebateDisplay();
                if (!rightWarningTriggered && rightTime <= DEBATE_WARNING_THRESHOLD) {
                    rightWarningTriggered = true;
                    beep(180, 1000, 0.22);
                    setTimeout(() => beep(130, 1000, 0.18), 300);
                }
            } else {
                if ((activeLeftSide && leftTime === 0) || (!activeLeftSide && rightTime === 0)) {
                    clearInterval(debateInterval);
                    debateRunning = false;
                }
            }
        }, 1000);
    }
}

function pauseDebateTimer() {
    debateRunning = false;
    clearInterval(debateInterval);
    leftSide.classList.remove('active', 'paused');
    rightSide.classList.remove('active', 'paused');
}

function resetDebateTimer() {
    pauseDebateTimer();
    leftTime = leftDuration.value * 60;
    rightTime = rightDuration.value * 60;
    leftWarningTriggered = false;
    rightWarningTriggered = false;
    stopBlink(leftDisplay);
    stopBlink(rightDisplay);
    updateDebateDisplay();
}

// Touch detection (from local)
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (!isTouchDevice) {
    leftSide.addEventListener('mouseenter', () => {
        activeLeftSide = true;
        updateDebateDisplay();
        startDebateTimer();
    });
    rightSide.addEventListener('mouseenter', () => {
        activeLeftSide = false;
        updateDebateDisplay();
        startDebateTimer();
    });
    document.getElementById('free-debate').addEventListener('mouseleave', pauseDebateTimer);
}

// Click handlers — toggle pause on active side, start on inactive (works on touch + desktop)
leftSide.addEventListener('click', () => {
    if (debateRunning && activeLeftSide) {
        pauseDebateTimer();
    } else {
        activeLeftSide = true;
        updateDebateDisplay();
        startDebateTimer();
    }
});

rightSide.addEventListener('click', () => {
    if (debateRunning && !activeLeftSide) {
        pauseDebateTimer();
    } else {
        activeLeftSide = false;
        updateDebateDisplay();
        startDebateTimer();
    }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (document.getElementById('free-debate').classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            activeLeftSide = true;
            updateDebateDisplay();
            startDebateTimer();
        } else if (e.key === 'ArrowRight') {
            activeLeftSide = false;
            updateDebateDisplay();
            startDebateTimer();
        } else if (e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
            pauseDebateTimer();
        }
    }
});

leftDuration.addEventListener('change', resetDebateTimer);
rightDuration.addEventListener('change', resetDebateTimer);

// Initialize
updateStandardDisplay();
updateDebateDisplay();
