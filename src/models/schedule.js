const Database = require("better-sqlite3");
const db = new Database("schedules.db");

// Create table if it doesn't exist
db.prepare(
  `
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  days TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  enabled INTEGER DEFAULT 1
)
`
).run();

// Get all schedules
const getAllSchedules = () => {
  const rows = db.prepare("SELECT * FROM schedules").all();
  return rows.map((schedule) => {
    schedule.days = JSON.parse(schedule.days);
    schedule.enabled = schedule.enabled === 1;
    schedule.isActive = isScheduleActive(schedule);
    return schedule;
  });
};

// Add a new schedule
const addSchedule = (schedule) => {
  const { name, days, startTime, endTime, enabled = true } = schedule; // Default enabled to true if not provided
  const result = db
    .prepare(
      "INSERT INTO schedules (name, days, startTime, endTime, enabled) VALUES (?, ?, ?, ?, ?)"
    )
    .run(name, JSON.stringify(days), startTime, endTime, enabled ? 1 : 0); // Store enabled as 1 or 0
  return {
    id: result.lastInsertRowid,
    name,
    days,
    startTime,
    endTime,
    enabled,
  };
};

// Update an existing schedule
const updateSchedule = (id, schedule) => {
  const { name, days, startTime, endTime, enabled } = schedule;
  db.prepare(
    "UPDATE schedules SET name = ?, days = ?, startTime = ?, endTime = ?, enabled = ? WHERE id = ?"
  ).run(name, JSON.stringify(days), startTime, endTime, enabled ? 1 : 0, id);
};

// Delete a schedule
const deleteSchedule = (id) => {
  db.prepare("DELETE FROM schedules WHERE id = ?").run(id);
};

// Find a schedule by ID
const findScheduleById = (id) => {
  const row = db.prepare("SELECT * FROM schedules WHERE id = ?").get(id);
  if (row) {
    row.days = JSON.parse(row.days); // Parse days
    row.enabled = row.enabled === 1; // Convert to boolean
  }
  return row;
};

const isScheduleActive = (schedule) => {
  if (!schedule.enabled) return false;

  const now = new Date();
  const currentDayIndex = now.getDay(); // Sunday = 0, Monday = 1, ...
  const currentTime = now.toTimeString().slice(0, 5);

  return (
    schedule.days.includes(currentDayIndex) &&
    currentTime >= schedule.startTime &&
    currentTime <= schedule.endTime
  );
};

module.exports = {
  getAllSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  findScheduleById,
  isScheduleActive,
};
