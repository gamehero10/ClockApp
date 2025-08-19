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

let currentTimeZone = localStorage.getItem("timezone") || "local";
timezoneSelect.value = currentTimeZone;

let alarmTime = localStorage.getItem("alarmTime") || null;
if (alarmTime) alarmStatus.textContent = `Alarm set for ${alarmTime}`;

// === CLOCK FUNCTION ===
function updateClock() {
  let now = new Date();

  if (currentTimeZone !== "local") {
    const options = {
      timeZone: currentTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const [h, m, s] = new Intl.DateTimeFormat('en-US', options)
      .format(now)
      .split(':')
      .map(Number);
    now.setHours(h, m, s);
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  digitalClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  hourHand.style.transform = `translate(-50%) rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `translate(-50%) rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `translate(-50%) rotate(${secondDeg}deg)`;

  // === ALARM CHECK ===
  if (alarmTime === `${pad(hours)}:${pad(minutes)}` && seconds === 0) {
    triggerAlarm();
  }
}

function pad(num) {
  return num.toString().padStart(2, "0");
}

setInterval(updateClock, 1000);
updateClock();

// === THEME TOGGLE ===
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

// === TIMEZONE SELECT ===
timezoneSelect.addEventListener("change", (e) => {
  currentTimeZone = e.target.value;
  localStorage.setItem("timezone", currentTimeZone);
  updateClock();
});

// === ALARM FUNCTIONALITY ===
setAlarmBtn.addEventListener("click", () => {
  const time = alarmInput.value;
  if (!time) {
    alert("Please select a time for the alarm.");
    return;
  }
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