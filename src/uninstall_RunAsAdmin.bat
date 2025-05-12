@echo off

> "%~dp0nodeService_uninstall.js" echo var Service = require('node-windows').Service;
>> "%~dp0nodeService_uninstall.js" echo.
>> "%~dp0nodeService_uninstall.js" echo // Create a new service object
>> "%~dp0nodeService_uninstall.js" echo var svc = new Service({
>> "%~dp0nodeService_uninstall.js" echo   name:'UnifiedScheduleManager',
>> "%~dp0nodeService_uninstall.js" echo   script: require('path').join(__dirname,'app.js')
>> "%~dp0nodeService_uninstall.js" echo });
>> "%~dp0nodeService_uninstall.js" echo.
>> "%~dp0nodeService_uninstall.js" echo // Listen for the "uninstall" event so we know when it's done.
>> "%~dp0nodeService_uninstall.js" echo svc.on('uninstall',function(){
>> "%~dp0nodeService_uninstall.js" echo   console.log('Uninstall complete.');
>> "%~dp0nodeService_uninstall.js" echo   console.log('The service exists: ',svc.exists);
>> "%~dp0nodeService_uninstall.js" echo });
>> "%~dp0nodeService_uninstall.js" echo.
>> "%~dp0nodeService_uninstall.js" echo // Uninstall the service.
>> "%~dp0nodeService_uninstall.js" echo svc.uninstall();

echo Starting the uninstallation...

"C:\Program Files\Siemens\Automation\WinCCUnified\WebRH\bin\node.exe" "%~dp0nodeService_uninstall.js"

echo Done!

