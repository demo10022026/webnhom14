@echo off
cd /d "%~dp0"

set "JAVA_HOME=%~dp0tools\jdk-17"
set "NODE_HOME=%~dp0tools\node"
set "PATH=%JAVA_HOME%\bin;%NODE_HOME%;%NODE_HOME%\node_modules\npm\bin;%PATH%"

start "Backend" cmd /k "cd /d "%~dp0backend" && call mvnw.cmd spring-boot:run"
start "Frontend" cmd /k "cd /d "%~dp0frontend" && call npm run dev"

pause