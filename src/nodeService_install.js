var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "UnifiedScheduleManager",
  description: "Schedule manager service for WinCC Unified",
  script: "C:\\Users\\dominicae\\source\\repos\\Unified_SchedulerAPI\\src\\app.js",
  workingDirectory: "C:\\Users\\dominicae\\source\\repos\\Unified_SchedulerAPI\\src\\"
});

svc.on("install", function () {
  svc.start();
});

svc.install();
