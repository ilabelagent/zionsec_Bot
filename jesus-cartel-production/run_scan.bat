@echo off
set PYTHON=python
set OUT=D:\KingdomProjects\INBOX
set SCAN=D:\ C:\Users\%USERNAME%\Music
%PYTHON% -m pip install -r requirements.txt
%PYTHON% kve_flp_organizer.py --scan %SCAN% --out %OUT%
echo.
echo Complete. See %OUT%\SCAN_REPORT.json
pause
