"use strict";

const net = require("net");
const readline = require("readline");

let schedmanVars = {};

// Update all _SCHEDMAN_[arrayIndex] values based on schedule state
const updateScheduleStates = (schedules, isScheduleActive) => {
  const client = net.connect("\\\\.\\pipe\\HmiRuntime", () => {
    const rl = readline.createInterface({
      input: client,
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      const tokens = line.split(/[\s,]+/);
      const cmd = tokens.shift();

      if (cmd === "NotifyWriteTagValue") {
        const tagName = tokens.shift();
        console.log(`Tag written: ${tagName}`);
      }

      if (cmd === "ErrorWriteTagValue") {
        console.error("Write error:", line);
      }
    });

    schedules.forEach((schedule) => {
      const active = isScheduleActive(schedule);
      const varName = `_SCHEDMAN_[${schedule.arrayIndex}]`;
      const value = active ? 1 : 0;

      schedmanVars[varName] = !!value;

      const command = `WriteTagValue ${varName} ${value}\n`;
      client.write(command);
      console.log(`${varName} = ${active}`);
    });

    // End connection once done writing
    client.end();
  });

  client.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.warn("WinCC Runtime not available (open pipe missing)");
    } else {
      console.error("Client error:", err.message);
    }
  });

  client.on("end", () => {});
};

const getSchedmanVars = () => schedmanVars;

module.exports = {
  updateScheduleStates,
  getSchedmanVars,
};
