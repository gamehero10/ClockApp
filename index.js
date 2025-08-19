const digitalClock = document.getElementById("digital-clock");
const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const secondHand = document.getElementById("second-hand");
const timezoneSelect = document.getElementById("timezone-select");
const toggleButton = document.getElementById("theme-toggle");

let currentTimeZone = localStorage.getItem("timezone") || "local";
timezoneSelect.value = currentTimeZone;

// Update clock function with timezone support
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

  // Update digital
  digitalClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Update analog
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  hourHand.style.transform = `translate(-50%) rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `translate(-50%) rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `translate(-50%) rotate(${secondDeg}deg)`;
}

function pad(num) {
  return num.toString().padStart(2, "0");
}

setInterval(updateClock, 1000);
updateClock(); // initial run

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

// === Timezone Change Handler ===
timezoneSelect.addEventListener("change", (e) => {
  currentTimeZone = e.target.value;
  localStorage.setItem("timezone", currentTimeZone);
  updateClock(); // immediate update
}); 
