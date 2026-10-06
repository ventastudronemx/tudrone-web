@echo off
cd /d "%~dp0"
echo Sirviendo tudrone en http://localhost:8787  (cierra esta ventana para detenerlo)
start "" http://localhost:8787
python -m http.server 8787
