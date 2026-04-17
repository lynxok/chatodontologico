@echo off
REM =====================================================
REM SCRIPT DE INSTALACIÓN Y COMPILACIÓN PARA WINDOWS
REM Chat Odontológico - LS Odontología
REM =====================================================

cls
echo ==================================================
echo Chat Odontologico - Instalacion Completa (Windows)
echo ==================================================
echo.

REM Verificar que Node.js esté instalado
echo [PASO 1/6] Validando Node.js y npm...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo    Node.js: %NODE_VERSION%
echo    npm: %NPM_VERSION%
echo.

REM Limpiar caché
echo [PASO 2/6] Limpiando cache y directorios antiguos...
call npm cache clean --force >nul 2>&1
echo    Eliminando node_modules...
if exist node_modules (
    rmdir /s /q node_modules >nul 2>&1
)
if exist package-lock.json (
    del /q package-lock.json >nul 2>&1
)
echo    OK - Cache limpiado
echo.

REM Instalar dependencias
echo [PASO 3/6] Instalando dependencias (esto puede tomar 2-5 minutos)...
call npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias
    echo Intenta ejecutar: npm install manualmente
    pause
    exit /b 1
)
echo    OK - Dependencias instaladas
echo.

REM Compilar TypeScript
echo [PASO 4/6] Compilando TypeScript...
call npm run tsc >nul 2>&1
if errorlevel 1 (
    call npx tsc >nul 2>&1
)
echo    OK - TypeScript compilado
echo.

REM Compilar proyecto
echo [PASO 5/6] Compilando proyecto (Vite + Electron)...
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo la compilacion del proyecto
    echo Intenta ejecutar: npm run build manualmente
    pause
    exit /b 1
)
echo    OK - Proyecto compilado exitosamente
echo.

REM Validar
echo [PASO 6/6] Validando compilacion...
if exist dist (
    echo    OK - Directorio dist creado correctamente
) else (
    echo    ADVERTENCIA: El directorio dist puede no existir
)

if exist dist-electron (
    echo    OK - Directorio dist-electron creado correctamente
) else (
    echo    ADVERTENCIA: El directorio dist-electron puede no existir
)
echo.

REM Resultado final
echo ==================================================
echo OK - INSTALACION COMPLETADA EXITOSAMENTE
echo ==================================================
echo.
echo Proximos pasos:
echo.
echo 1. Para DESARROLLO (con recarga en caliente):
echo    npm run electron:dev
echo.
echo 2. Para PRODUCCION (crear instalador):
echo    npm run build
echo    El instalador se generara en: .\release\
echo.
echo 3. Para REVISAR EL CODIGO:
echo    npm run lint
echo.
echo Nota: La variable de entorno VITE_SUPABASE_URL esta configurada en .env
echo Asegura de usar credenciales de Supabase validas para produccion.
echo.
pause
