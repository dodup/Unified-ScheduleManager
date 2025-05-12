@echo off
setlocal enabledelayedexpansion

REM Get the full path to app.js
set "scriptPath=%~dp0app.js"

REM Extract just the directory from the script path
for %%I in ("%~dp0") do set "appDir=%%~fI"

REM Escape backslashes for embedding in JavaScript
set "escapedDir=%appDir:\=\\%"
set "escapedScript=%scriptPath:\=\\%"

REM Generate nodeService_install.js dynamically
> "%~dp0nodeService_install.js" echo var Service = require("node-windows").Service;
>> "%~dp0nodeService_install.js" echo.
>> "%~dp0nodeService_install.js" echo // Create a new service object
>> "%~dp0nodeService_install.js" echo var svc = new Service({
>> "%~dp0nodeService_install.js" echo   name: "UnifiedScheduleManager",
>> "%~dp0nodeService_install.js" echo   description: "Schedule manager service for WinCC Unified",
>> "%~dp0nodeService_install.js" echo   script: "!escapedScript!",
>> "%~dp0nodeService_install.js" echo   workingDirectory: "!escapedDir!"
>> "%~dp0nodeService_install.js" echo });
>> "%~dp0nodeService_install.js" echo.
>> "%~dp0nodeService_install.js" echo svc.on("install", function () {
>> "%~dp0nodeService_install.js" echo   svc.start();
>> "%~dp0nodeService_install.js" echo });
>> "%~dp0nodeService_install.js" echo.
>> "%~dp0nodeService_install.js" echo svc.install();

echo Starting to install the service...

"C:\Program Files\Siemens\Automation\WinCCUnified\WebRH\bin\node.exe" "%~dp0nodeService_install.js"

echo Done
