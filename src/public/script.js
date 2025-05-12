const form = document.getElementById("scheduleForm");
const tableBody = document.querySelector("#scheduleTable tbody");
const dayButtons = document.querySelectorAll("#dayButtons button");
const enabledCheckbox = document.getElementById("enabled");

const selectedDays = new Set();

// Day buttons logic for selection and toggle
dayButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const day = btn.dataset.day;
    if (selectedDays.has(day)) {
      selectedDays.delete(day);
      btn.classList.remove("selected");
    } else {
      selectedDays.add(day);
      btn.classList.add("selected");
    }
  });
});

// Mapping day index to initials (0 - Sunday, 1 - Monday, etc.)
const dayInitials = {
  0: "S", // Sunday
  1: "M", // Monday
  2: "T", // Tuesday
  3: "W", // Wednesday
  4: "T", // Thursday
  5: "F", // Friday
  6: "S", // Saturday
};

// Load all schedules from the server
const loadSchedules = async () => {
  const res = await fetch("/api/schedules");
  const schedules = await res.json();

  tableBody.innerHTML = "";
  schedules.forEach((schedule) => {
    // Ensure schedule.days is an array
    if (Array.isArray(schedule.days)) {
      const row = `<tr>
        <td>${schedule.name}</td>
        <td>${schedule.days
          .map((d) => `<span class="day-bubble">${dayInitials[d]}</span>`)
          .join(" ")}</td>
        <td>${schedule.startTime}</td>
        <td>${schedule.endTime}</td>
        <td>${schedule.enabled ? "✅" : "❌"}</td>
        <td>${schedule.isActive ? "🟢 Active" : "⚪ Inactive"}</td>
        <td>
          <button class="${
            schedule.enabled ? "enable-btn" : "disable-btn"
          }" onclick="toggleEnableSchedule(${schedule.id}, ${
        schedule.enabled
      })">
            ${schedule.enabled ? "Disable" : "Enable"}
          </button>
          <button class="delete-btn" onclick="deleteSchedule(${
            schedule.id
          })">Delete</button>
        </td>
      </tr>`;
      tableBody.innerHTML += row;
    } else {
      console.error(`Invalid days format for schedule: ${schedule.name}`);
    }
  });
};

// Toggle enable/disable schedule
const toggleEnableSchedule = async (id, currentStatus) => {
  // Toggle status
  const newStatus = !currentStatus;

  await fetch(`/api/schedules/${id}/enable`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: newStatus }),
  });

  loadSchedules();
};

// Add a new schedule
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (selectedDays.size === 0) {
    alert("Please select at least one day.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const dayNameToIndex = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const days = Array.from(selectedDays).map((day) => dayNameToIndex[day]);
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const enabled = enabledCheckbox.checked;

  // Check for duplicate name
  const res = await fetch("/api/schedules");
  const existingSchedules = await res.json();

  const nameExists = existingSchedules.some(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
  if (nameExists) {
    alert(
      "A schedule with this name already exists. Please use a different name."
    );
    return;
  }

  await fetch("/api/schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, days, startTime, endTime, enabled }),
  });

  // Reset form and state
  form.reset();
  selectedDays.clear();
  dayButtons.forEach((btn) => btn.classList.remove("selected"));
  enabledCheckbox.checked = true;
  loadSchedules();
});

// Delete a schedule
const deleteSchedule = async (id) => {
  if (confirm("Are you sure you want to delete this schedule?")) {
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    loadSchedules();
  }
};

// Initial load of schedules when the page is ready
loadSchedules();
