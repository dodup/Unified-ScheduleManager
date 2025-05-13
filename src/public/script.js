const form = document.getElementById("scheduleForm");
const tableBody = document.querySelector("#scheduleTable tbody");
const dayButtons = document.querySelectorAll("#dayButtons button");
const enabledCheckbox = document.getElementById("enabled");

const selectedDays = new Set();

let confirmCallback = null;

// Popups / modals
const modal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const errorModal = document.getElementById("errorModal");
const errorMessage = document.getElementById("errorMessage");
const errorOk = document.getElementById("errorOk");

// Listen for localStorage updates (cross-tab + iframe safe)
window.addEventListener("storage", (event) => {
  if (event.key === "schedules_update" && event.newValue) {
    loadSchedules();
  }
});

// Function to trigger an update
function broadcastUpdate() {
  localStorage.setItem("schedules_update", Date.now().toString());
}

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
    if (Array.isArray(schedule.days)) {
      const row = `<tr>
        <td>${schedule.name}</td>
        <td>${schedule.arrayIndex}</td>
        <td>${schedule.days
          .map((d) => `<span class="day-bubble">${dayInitials[d]}</span>`)
          .join(" ")}</td>
        <td>${schedule.startTime}</td>
        <td>${schedule.endTime}</td>
        <td>${schedule.enabled ? "✅" : "❌"}</td>
        <td>${schedule.isActive ? "🟢 Active" : "⚪ Inactive"}</td>
        <td class="button-column">
        <div class="action-buttons">
          <button class="${
            schedule.enabled ? "enable-btn" : "disable-btn"
          }" onclick="toggleEnableSchedule(${schedule.id}, ${
        schedule.enabled
      })">
            ${schedule.enabled ? "Disable" : "Enable"}
          </button>
          <button class="delete-btn" onclick="deleteSchedule(${schedule.id})">
            Delete
          </button>
        </div>
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

// Add a new schedule (add schedule button)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameInput = document.getElementById("name");
  const name = nameInput.value.trim();

  if (!name) {
    showError("Please enter a name for the schedule.");
    return;
  }

  const arrayIndexInput = document.getElementById("arrayIndex");
  const arrayIndex = parseInt(arrayIndexInput.value, 10);

  if (isNaN(arrayIndex) || arrayIndex < 0 || arrayIndex > 1999) {
    showError("Array Index must be a number between 0 and 1999.");
    return;
  }

  if (selectedDays.size === 0) {
    showError("Please select at least one day.");
    return;
  }

  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  if (!startTime || !endTime) {
    showError("Please provide both start and end times.");
    return;
  }

  // Convert time strings to comparable values (in minutes)
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  if (startTotalMinutes >= endTotalMinutes) {
    showError("Start time must be earlier than end time.");
    return;
  }

  const enabled = enabledCheckbox.checked;

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

  try {
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        days,
        startTime,
        endTime,
        enabled,
        arrayIndex,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      const message = errData?.error || "Failed to add schedule.";
      showError(message);
      return;
    }

    // Success – clear and reload
    form.reset();
    selectedDays.clear();
    dayButtons.forEach((btn) => btn.classList.remove("selected"));
    enabledCheckbox.checked = true;
    loadSchedules();
    broadcastUpdate();
  } catch (err) {
    showError("An error occurred while adding the schedule.");
    console.error(err);
  }
});

// Confirmation popup
function showConfirmation(message, callback) {
  document.getElementById("confirmMessage").textContent = message;
  modal.classList.remove("hidden");
  confirmCallback = callback;
}

confirmYes.addEventListener("click", () => {
  if (confirmCallback) confirmCallback(true);
  modal.classList.add("hidden");
});

confirmNo.addEventListener("click", () => {
  if (confirmCallback) confirmCallback(false);
  modal.classList.add("hidden");
});

// Delete a schedule
const deleteSchedule = (id) => {
  showConfirmation(
    "Are you sure you want to delete this schedule?",
    async (confirmed) => {
      if (confirmed) {
        await fetch(`/api/schedules/${id}`, { method: "DELETE" });
        loadSchedules();
        broadcastUpdate();
      }
    }
  );
};

function showError(message) {
  errorMessage.textContent = message;
  errorModal.classList.remove("hidden");
}

errorOk.addEventListener("click", () => {
  errorModal.classList.add("hidden");
});

// Initial load of schedules when the page is ready
loadSchedules();
