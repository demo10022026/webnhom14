@echo off
cd /d "%~dp0"

start "Chay backend" cmd /k "pushd "%~dp0backend" && mvnw.cmd spring-boot:run"

start "Chay frontend" cmd /k "pushd "%~dp0frontend" && npm run dev"

pause