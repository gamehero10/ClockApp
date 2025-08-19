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
let currentLocale = localStorage.getItem("locale") || "browser";

// === Populate Timezones from WorldTimeAPI ===
async function populateTimezones() {
  try {
    const response = await fetch("https://worldtimeapi.org/api/timezone");
    if (!response.ok) throw new Error("Failed to fetch timezones");
    const timezones = await response.json();

    // Clear existing options except Local
    timezoneSelect.innerHTML = `<option value="local">Local Timezone</option>`;

    timezones.forEach((tz) => {
      const option = document.createElement("option");
      option.value = tz;
      option.textContent = tz.replace(/_/g, " ");
      timezoneSelect.appendChild(option);
    });

    timezoneSelect.value = currentTimeZone;
  } catch (err) {
    console.error("Error loading timezones:", err);
  }
}

// Initialize timezone list on page load
populateTimezones();

// Set locale select dropdown (assumes options exist in HTML)
localeSelect.value = currentLocale;

// === Theme Toggle ===
function applyTheme(theme) {
  try {
    if (theme !== "light" && theme !== "dark") theme = "dark";
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

// === Timezone & Locale Change Handlers ===
timezoneSelect.addEventListener("change", (e) => {
  currentTimeZone = e.target.value;
  localStorage.setItem("timezone", currentTimeZone);
  cachedApiTime = null;
});

localeSelect.addEventListener("change", (e) => {
  currentLocale = e.target.value;
  localStorage.setItem("locale", currentLocale);
});

// === Helpers ===
const getLocale = () => (currentLocale === "browser" ? navigator.language || "en-US" : currentLocale);

function formatTimeComponent(date) {
  return date.toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function pad(num) {
  return num.toString().padStart(2, "0");
}

// === Clock + Alarm ===
// API cache
let cachedApiTime = null;
let lastApiFetch = 0;

async function fetchTimeFromAPI(timezone) {
  try {
    if (timezone === "local") return null;
    const response = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
    if (!response.ok) throw new Error("Network response not OK");
    const data = await response.json();
    return new Date(data.datetime);
  } catch (err) {
    console.warn("WorldTimeAPI fetch failed, fallback to local.", err);
    return null;
  }
}

async function getCurrentTime() {
  const now = new Date();

  if (
    currentTimeZone !== "local" &&
    (!cachedApiTime || Date.now() - lastApiFetch > 1000)
  ) {
    const apiTime = await fetchTimeFromAPI(currentTimeZone);
    if (apiTime) {
      cachedApiTime = apiTime;
      lastApiFetch = Date.now();
      return new Date(cachedApiTime.getTime() + (Date.now() - lastApiFetch));
    }
  }

  if (currentTimeZone === "local" || !cachedApiTime) {
    try {
      const options = {
        timeZone: currentTimeZone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const parts = new Intl.DateTimeFormat("en-US", options)
        .formatToParts(now)
        .reduce((acc, part) => {
          acc[part.type] = part.value;
          return acc;
        }, {});
      const h = parseInt(parts.hour, 10);
      const m = parseInt(parts.minute, 10);
      const s = parseInt(parts.second, 10);
      let dateCopy = new Date(now);
      dateCopy.setHours(h, m, s, 0);
      return dateCopy;
    } catch {
      return now;
    }
  }

  return cachedApiTime;
}

let alarmTime = localStorage.getItem("alarmTime") || null;
if (alarmTime) alarmStatus.textContent = `Alarm set for ${alarmTime}`;

async function updateClock() {
  try {
    let now = await getCurrentTime();

    digitalClock.textContent = formatTimeComponent(now);

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    hourHand.style.transform = `translate(-50%) rotate(${(hours % 12) * 30 + minutes * 0.5}deg)`;
    minuteHand.style.transform = `translate(-50%) rotate(${minutes * 6}deg)`;
    secondHand.style.transform = `translate(-50%) rotate(${seconds * 6}deg)`;

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
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerRunning = false;
        alert("⏰ Timer finished!");
        alarmSound.play().catch(() => {});
      }
    }, 1000);
  } catch (err) {
    console.error("Timer start error:", err);
  }
});

stopTimerBtn.addEventListener("click", () => {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
  }
});

resetTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerTotalSeconds = 0;
  updateTimerDisplay();
});

// Initialize timer display
updateTimerDisplay();

// === Stopwatch ===
let stopwatchStart = null;
let stopwatchElapsed = 0;
let stopwatchRunning = false;

function formatStopwatchTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

function displayStopwatchTime() {
  let displayTime = stopwatchElapsed;
  if (stopwatchRunning && stopwatchStart) {
    displayTime += Date.now() - stopwatchStart;
  }
  stopwatchDisplay.textContent = formatStopwatchTime(displayTime);
}

let stopwatchInterval = null;

startStopwatchBtn.addEventListener("click", () => {
  if (stopwatchRunning) return;
  stopwatchStart = Date.now();
  stopwatchRunning = true;
  stopwatchInterval = setInterval(displayStopwatchTime, 250);
});

stopStopwatchBtn.addEventListener("click", () => {
  if (!stopwatchRunning) return;
  stopwatchElapsed += Date.now() - stopwatchStart;
  stopwatchStart = null;
  stopwatchRunning = false;
  clearInterval(stopwatchInterval);
  displayStopwatchTime();
});

resetStopwatchBtn.addEventListener("click", () => {
  stopwatchElapsed = 0;
  stopwatchStart = null;
  stopwatchRunning = false;
  clearInterval(stopwatchInterval);
  displayStopwatchTime();
  lapList.innerHTML = "";
});

lapStopwatchBtn.addEventListener("click", () => {
  if (!stopwatchRunning) return;
  let lapTime = stopwatchElapsed + (Date.now() - stopwatchStart);
  const lapItem = document.createElement("li");
  lapItem.textContent = formatStopwatchTime(lapTime);
  lapList.appendChild(lapItem);
});

// Update clock display immediately on page load
updateClock();
