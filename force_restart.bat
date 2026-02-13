@echo off
echo ==================================================
echo STOPPING ALL RUNNING PYTHON SERVERS...
echo ==================================================
taskkill /F /IM python.exe /T
echo.
echo ==================================================
echo INSTALLING DEPENDENCIES (Just into case)...
echo ==================================================
pip install flask flask-cors pandas numpy >nul 2>&1
echo.
echo ==================================================
echo STARTING CLEAN SERVER INSTANCE...
echo ==================================================
python app.py
pause
