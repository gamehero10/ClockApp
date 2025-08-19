// === DOM Elements ===
const digitalClock = document.getElementById("digital-clock");
const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const secondHand = document.getElementById("second-hand");
const timezoneSelect = document.getElementById("timezone-select");
const localeSelect = document.getElementById("locale-select");
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

// === Settings & Localization ===
let currentTimeZone = localStorage.getItem("timezone") || "local";
timezoneSelect.value = currentTimeZone;

let currentLocale = localStorage.getItem("locale") || "browser";
localeSelect.value = currentLocale;

// === Theme Toggle ===
function applyTheme(theme) {
  try {
    if (theme !== "light" && theme !== "dark") {
      theme = "dark";
    }
    document.body.classList.toggle("light-theme", theme === "light");
    localStorage.setItem("theme", theme);
    toggleButton.textContent = theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
  } catch (err) {
    console.error("Error applying theme:", err);
  }
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

// === Locale Change ===
localeSelect.addEventListener("change", (e) => {
  currentLocale = e.target.value;
  localStorage.setItem("locale", currentLocale);
});

// Helper to get locale
const getLocale = () =>
  currentLocale === "browser" ? navigator.language || "en-US" : currentLocale;

// Helper to format time for digital clock (localized)
function formatTimeComponent(date) {
  return date.toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// === Clock + Alarm ===
let alarmTime = localStorage.getItem("alarmTime") || null;
if (alarmTime) alarmStatus.textContent = `Alarm set for ${alarmTime}`;

function updateClock() {
  try {
    let now = new Date();

    if (currentTimeZone !== "local") {
      try {
        const options = {
          timeZone: currentTimeZone,
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        };
        const [h, m, s] = new Intl.DateTimeFormat("en-US", options)
          .format(now)
          .split(":")
          .map(Number);
        now.setHours(h, m, s);
      } catch {
        console.warn("Invalid timezone—falling back to local.");
      }
    }

    // Digital clock localized
    digitalClock.textContent = formatTimeComponent(now);

    // Analog clock (rotation)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    hourHand.style.transform = `translate(-50%) rotate(${(hours % 12) * 30 + minutes * 0.5}deg)`;
    minuteHand.style.transform = `translate(-50%) rotate(${minutes * 6}deg)`;
    secondHand.style.transform = `translate(-50%) rotate(${seconds * 6}deg)`;

    // Check Alarm
    if (alarmTime === `${pad(hours)}:${pad(minutes)}` && seconds === 0) {
      triggerAlarm();
    }

    updateTimerDisplay();
    displayStopwatchTime();
  } catch (err) {
    console.error("Clock update failed:", err);
  }
}
setInterval(updateClock, 1000);

// === Alarm ===
setAlarmBtn.addEventListener("click", () => {
  const time = alarmInput.value;
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    alert("❌ Please enter a valid time (HH:MM).");
    return;
  }
  alarmTime = time;
  localStorage.setItem("alarmTime", alarmTime);
  alarmStatus.textContent = `Alarm set for ${alarmTime}`;
});

function triggerAlarm() {
  try {
    alarmSound.play().catch((err) => console.warn("Unable to play alarm sound:", err));
    alert("⏰ Alarm Time!");
    alarmTime = null;
    localStorage.removeItem("alarmTime");
    alarmStatus.textContent = "No alarm set.";
  } catch (err) {
    console.error("Error triggering alarm:", err);
  }
}

function pad(num) {
  return num.toString().padStart(2, "0");
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
  try {
    if (timerRunning) return;

    const mins = parseInt(timerMinutesInput.value) || 0;
    const secs = parseInt(timerSecondsInput.value) || 0;

    if (isNaN(mins) || isNaN(secs) || mins < 0 || secs < 0 || secs >= 60) {
      alert("❌ Please enter valid positive numbers for minutes (≥ 0) and seconds (0-59).");
      return;
    }

    if (mins === 0 && secs === 0 && timerTotalSeconds === 0) {
      alert("⏳ Enter time for the timer.");
      return;
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
        alarmSound.play().catch(() => {});
        alert("⏳ Timer finished!");
      }
      updateTimerDisplay();
    }, 1000);
  } catch (err) {
    console.error("Timer start failed:", err);
  }
});

stopTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
});

resetTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerTotalSeconds = 0;
  updateTimerDisplay();
  timerMinutesInput.value = "";
  timerSecondsInput.value = "";
});

// === Stopwatch ===
let stopwatchStartTime = 0;
let stopwatchElapsed = 0;
let stopwatchRunning = false;
let stopwatchInterval = null;

function displayStopwatchTime() {
  let totalMilliseconds = stopwatchElapsed;
  if (stopwatchRunning) {
    totalMilliseconds += Date.now() - stopwatchStartTime;
  }

  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  stopwatchDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

startStopwatchBtn.addEventListener("click", () => {
  if (stopwatchRunning) return;
  stopwatchRunning = true;
  stopwatchStartTime = Date.now();
  stopwatchInterval = setInterval(displayStopwatchTime, 250);
});

stopStopwatchBtn.addEventListener("click", () => {
  if (!stopwatchRunning) return;
  stopwatchRunning = false;
  stopwatchElapsed += Date.now() - stopwatchStartTime;
  clearInterval(stopwatchInterval);
  displayStopwatchTime();
});

resetStopwatchBtn.addEventListener("click", () => {
  stopwatchRunning = false;
  stopwatchElapsed = 0;
  stopwatchStartTime = 0;
  clearInterval(stopwatchInterval);
  displayStopwatchTime();
  lapList.innerHTML = "";
});

lapStopwatchBtn.addEventListener("click", () => {
  if (!stopwatchRunning) return;

  let totalMilliseconds = stopwatchElapsed + (Date.now() - stopwatchStartTime);
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const lapTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const li = document.createElement("li");
  li.textContent = lapTime;
  lapList.appendChild(li);
});

// Initialize timer display
updateTimerDisplay();
// Initialize stopwatch display
displayStopwatchTime();
