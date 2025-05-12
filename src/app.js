const fs = require("fs");
const https = require("https");
const express = require("express");
const scheduleRoutes = require("./routes/schedules");
const db = require("./models/schedule");
const wincc = require("./wincc");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use("/api/schedules", scheduleRoutes);

// Read SSL certificate and key
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

// Start HTTPS server
const PORT = 3131;
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});

// Update WinCC Tags interval
setInterval(() => {
  const schedules = db.getAllSchedules();
  wincc.updateScheduleStates(schedules, db.isScheduleActive);
}, 1000);
