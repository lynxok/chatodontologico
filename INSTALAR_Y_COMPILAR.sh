#!/bin/bash

# =====================================================
# SCRIPT DE INSTALACIÓN Y COMPILACIÓN
# Chat Odontológico - LS Odontología
# =====================================================
# Este script automatiza la instalación completa del proyecto
# Ejecuta: bash INSTALAR_Y_COMPILAR.sh

echo "=================================================="
echo "Chat Odontológico - Instalación Completa"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}[PASO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

# =====================================================
# PASO 1: Validar Node.js y npm
# =====================================================
print_step "Validando Node.js y npm..."

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "   Node.js: $NODE_VERSION"
echo "   npm: $NPM_VERSION"
echo ""

# =====================================================
# PASO 2: Limpiar instalaciones anteriores
# =====================================================
print_step "Limpiando caché y directorios antiguos..."
npm cache clean --force
rm -rf node_modules package-lock.json
echo "   ✅ Caché limpiado"
echo ""

# =====================================================
# PASO 3: Instalar dependencias
# =====================================================
print_step "Instalando dependencias (esto puede tomar 2-5 minutos)..."
npm install
if [ $? -ne 0 ]; then
    print_error "Fallo la instalación de dependencias"
    echo "Intenta ejecutar: npm install manualmente"
    exit 1
fi
echo "   ✅ Dependencias instaladas"
echo ""

# =====================================================
# PASO 4: Compilar TypeScript
# =====================================================
print_step "Compilando TypeScript..."
npm run tsc || npx tsc
if [ $? -ne 0 ]; then
    print_error "Fallo la compilación de TypeScript"
    exit 1
fi
echo "   ✅ TypeScript compilado"
echo ""

# =====================================================
# PASO 5: Compilar proyecto Web y Electron
# =====================================================
print_step "Compilando proyecto (Vite + Electron)..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Fallo la compilación del proyecto"
    echo "Intenta ejecutar: npm run build manualmente"
    exit 1
fi
echo "   ✅ Proyecto compilado exitosamente"
echo ""

# =====================================================
# PASO 6: Validación
# =====================================================
print_step "Validando compilación..."

if [ -d "dist" ] && [ -d "dist-electron" ]; then
    echo "   ✅ Directorios de salida creados correctamente"
else
    print_warning "Los directorios de compilación pueden no estar completos"
fi

echo ""

# =====================================================
# RESULTADO FINAL
# =====================================================
echo "=================================================="
echo -e "${GREEN}✅ INSTALACIÓN COMPLETADA${NC}"
echo "=================================================="
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Para DESARROLLO (con recarga en caliente):"
echo "   ${YELLOW}npm run electron:dev${NC}"
echo ""
echo "2. Para PRODUCCIÓN (crear instalador):"
echo "   ${YELLOW}npm run build${NC}"
echo "   El instalador se generará en: ./release/"
echo ""
echo "3. Para REVISAR EL CÓDIGO:"
echo "   ${YELLOW}npm run lint${NC}"
echo ""
echo "Nota: La variable de entorno VITE_SUPABASE_URL está configurada en .env"
echo "Asegúrate de usar credenciales de Supabase válidas para producción."
echo ""
