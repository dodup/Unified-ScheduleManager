const express = require("express");
const router = express.Router();
const db = require("../models/schedule");

// Get all schedules
router.get("/", (req, res) => {
  const schedules = db.getAllSchedules();
  res.json(schedules);
});

// Add a new schedule
router.post("/", (req, res) => {
  const { name, days, startTime, endTime, enabled, arrayIndex } = req.body;

  // Check for duplicate name
  const existing = db
    .getAllSchedules()
    .find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return res
      .status(400)
      .json({ error: "A schedule with that name already exists." });
  }

  // Check for duplicate arrayIndex
  const indexExists = db
    .getAllSchedules()
    .some((s) => s.arrayIndex === arrayIndex);
  if (indexExists) {
    return res.status(400).json({
      error: "This Array Index is already in use. Please choose another one.",
    });
  }

  const newSchedule = db.addSchedule({
    name,
    arrayIndex,
    days,
    startTime,
    endTime,
    enabled,
  });
  res.status(201).json(newSchedule);
});

// Update a schedule (non-enabled fields like name, days, start time, and end time)
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.findScheduleById(id);
  if (!existing) return res.status(404).send("Schedule not found");

  const { name, days, startTime, endTime, enabled } = req.body;
  db.updateSchedule(id, { name, days, startTime, endTime, enabled });

  res.json({ id, name, days, startTime, endTime, enabled });
});

// Enable or disable a schedule
router.put("/:id/enable", (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.findScheduleById(id);
  if (!existing) return res.status(404).send("Schedule not found");

  const { enabled } = req.body;
  db.updateSchedule(id, { ...existing, enabled });

  res.json({ id, enabled });
});

// Delete a schedule
router.delete("/:id", (req, res) => {
  db.deleteSchedule(parseInt(req.params.id));
  res.status(204).send();
});

const isScheduleActive = (schedule) => {
  if (!schedule.enabled) return false;

  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const currentTime = now.toTimeString().slice(0, 5); // format: HH:MM

  return (
    schedule.days.includes(currentDay) &&
    currentTime >= schedule.startTime &&
    currentTime <= schedule.endTime
  );
};

router.get("/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const schedule = db.findScheduleById(id);
  if (!schedule) return res.status(404).send("Schedule not found");

  const active = isScheduleActive(schedule);
  res.json({ id: schedule.id, active });
});

module.exports = router;
