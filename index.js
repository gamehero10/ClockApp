// === Basic Setup ===
const digitalClock = document.getElementById("digital-clock");
const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const secondHand = document.getElementById("second-hand");
const timezoneSelect = document.getElementById("timezone-select");
const toggleButton = document.getElementById("theme-toggle");

const alarmInput = document.getElementById("alarm-time");
const setAlarmBtn = document.getElementById("set-alarm");
const alarmStatus = document.getElementById("alarm-status");
const alarmSound = document.getElementById("alarm-audio");

const timerMinutesInput = document.getElementById("timer-minutes");
const timerSecondsInput = document.getElementById("timer-seconds");
const timerDisplay = document.getElementById("timer-display");
const startTimerBtn = document.getElementById("start-timer");
const stopTimerBtn = document.getElementById("stop-timer");
const resetTimerBtn = document.getElementById("reset-timer");

const stopwatchDisplay = document.getElementById("stopwatch-display");
const startStopwatchBtn = document.getElementById("start-stopwatch");
const stopStopwatchBtn = document.getElementById("stop-stopwatch");
const resetStopwatchBtn = document.getElementById("reset-stopwatch");
const lapStopwatchBtn = document.getElementById("lap-stopwatch");
const lapList = document.getElementById("lap-list");

let currentTimeZone = localStorage.getItem("timezone") || "local";
timezoneSelect.value = currentTimeZone;

let alarmTime = localStorage.getItem("alarmTime") || null;
if (alarmTime) alarmStatus.textContent = `Alarm set for ${alarmTime}`;

// === Theme Toggle ===
function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  localStorage.setItem("theme", theme);
  toggleButton.textContent = theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
}
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

toggleButton.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
  applyTheme(newTheme);
});

// === Timezone Change ===
timezoneSelect.addEventListener("change", (e) => {
  currentTimeZone = e.target.value;
  localStorage.setItem("timezone", currentTimeZone);
});

// === Clock + Alarm ===
function updateClock() {
  let now = new Date();
  if (currentTimeZone !== "local") {
    const options = {
      timeZone: currentTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const [h, m, s] = new Intl.DateTimeFormat('en-US', options).format(now).split(':').map(Number);
    now.setHours(h, m, s);
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  digitalClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  hourHand.style.transform = `translate(-50%) rotate(${(hours % 12) * 30 + minutes * 0.5}deg)`;
  minuteHand.style.transform = `translate(-50%) rotate(${minutes * 6}deg)`;
  secondHand.style.transform = `translate(-50%) rotate(${seconds * 6}deg)`;

  // Check Alarm
  if (alarmTime === `${pad(hours)}:${pad(minutes)}` && seconds === 0) {
    triggerAlarm();
  }

  updateTimerDisplay();
  updateStopwatchDisplay();
}
setInterval(updateClock, 1000);

// === Alarm ===
setAlarmBtn.addEventListener("click", () => {
  const time = alarmInput.value;
  if (!time) return alert("Please select a time for the alarm.");
  alarmTime = time;
  localStorage.setItem("alarmTime", alarmTime);
  alarmStatus.textContent = `Alarm set for ${alarmTime}`;
});

function triggerAlarm() {
  alarmSound.play();
  alert("⏰ Alarm Time!");
  alarmTime = null;
  localStorage.removeItem("alarmTime");
  alarmStatus.textContent = "No alarm set.";
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

// === Timer ===
let timerTotalSeconds = 0;
let timerInterval = null;
let timerRunning = false;

function updateTimerDisplay() {
  const mins = Math.floor(timerTotalSeconds / 60);
  const secs = timerTotalSeconds % 60;
  timerDisplay.textContent = `${pad(mins)}:${pad(secs)}`;
}

startTimerBtn.addEventListener("click", () => {
  if (timerRunning) return;

  const mins = parseInt(timerMinutesInput.value) || 0;
  const secs = parseInt(timerSecondsInput.value) || 0;
  if (mins === 0 && secs === 0 && timerTotalSeconds === 0) {
    return alert("Enter time for the timer.");
  }

  if (timerTotalSeconds === 0) {
    timerTotalSeconds = mins * 60 + secs;
  }

  timerRunning = true;
  timerInterval = setInterval(() => {
    if (timerTotalSeconds > 0) {
      timerTotalSeconds--;
    } else {
      clearInterval(timerInterval);
      timerRunning = false;
      alarmSound.play();
      alert("⏳ Timer finished!");
    }
    updateTimerDisplay();
  }, 1000);
});

stopTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
});

resetTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerTotalSeconds = 0;
  timerRunning = false;
  updateTimerDisplay();
  timerMinutesInput.value = "";
  timerSecondsInput.value = "";
});

// === Stopwatch ===
let stopwatchSeconds = 0;
let stopwatchRunning = false;
let stopwatchInterval = null;

function updateStopwatchDisplay() {
  const mins = Math.floor(stopwatchSeconds / 60);
  const secs = stopwatchSeconds % 60;
  const millis = stopwatchSeconds % 1;
  stopwatchDisplay.textContent = `${pad(mins)}:${pad(secs)}:${padMilliseconds(millis)}`;
}

function padMilliseconds(ms) {
  return Math.floor(ms * 100).toString().padStart(2, '0');
}

startStopwatchBtn.addEventListener("click", () => {
  if (stopwatchRunning) return;
  stopwatchRunning = true;
  stopwatchInterval = setInterval(() => {
    stopwatchSeconds++;
    updateStopwatchDisplay();
  }, 1000);
});

stopStopwatchBtn.addEventListener("click", () => {
  clearInterval(stopwatchInterval);
  stopwatchRunning = false;
});

resetStopwatchBtn.addEventListener("click", () => {
  clearInterval(stopwatchInterval);
  stopwatchSeconds = 0;
  stopwatchRunning = false;
  lapList.innerHTML = "";
  updateStopwatchDisplay();
});

lapStopwatchBtn.addEventListener("click", () => {
  const li = document.createElement("li");
  li.textContent = stopwatchDisplay.textContent;
  lapList.appendChild(li);
}); 