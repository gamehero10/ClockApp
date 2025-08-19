function updateClock() {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Digital clock
  const digitalClock = document.getElementById("digital-clock");
  digitalClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Analog clock
  const hourHand = document.getElementById("hour-hand");
  const minuteHand = document.getElementById("minute-hand");
  const secondHand = document.getElementById("second-hand");

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
updateClock(); // initial call

// === Theme Toggle ===
const toggleButton = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  localStorage.setItem("theme", theme);
  toggleButton.textContent = theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
}

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

// Toggle theme on button click
toggleButton.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
  applyTheme(newTheme);
}); 