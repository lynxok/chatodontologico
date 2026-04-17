# 🚀 Guía Operativa - Chat Odontológico

**Proyecto**: Chat Interno LS Odontología  
**Fecha de Auditoría**: 17 de Abril de 2026  
**Estado**: 70% completado, listo para operación

---

## 📋 Contenido

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Rápida](#instalación-rápida)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración Supabase](#configuración-supabase)
5. [Desarrollo](#desarrollo)
6. [Compilación para Producción](#compilación-para-producción)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Requisitos Previos

### Software Necesario

- **Node.js**: v18+ o superior
  - Descargar desde: https://nodejs.org/
  - Verificar: `node -v` y `npm -v`

- **Git**: Para control de versiones
  - Descargar desde: https://git-scm.com/

### Credenciales

Las credenciales de Supabase están en el archivo `.env`:
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase

**⚠️ Advertencia de Seguridad**: 
- Nunca commits el archivo `.env` a Git
- Guarda las credenciales de forma segura
- En producción, usa variables de entorno del servidor

---

## 🚀 Instalación Rápida

### Opción 1: Script Automatizado (Recomendado)

En macOS/Linux:
```bash
bash INSTALAR_Y_COMPILAR.sh
```

En Windows (PowerShell):
```powershell
.\INSTALAR_Y_COMPILAR.sh
```

### Opción 2: Instalación Manual

```bash
# 1. Limpiar caché
npm cache clean --force

# 2. Eliminar instalaciones anteriores
rm -rf node_modules package-lock.json

# 3. Instalar dependencias
npm install

# 4. Compilar TypeScript
npm run tsc

# 5. Compilar proyecto
npm run build
```

### Validación

Después de la instalación, verifica:

```bash
# Debe existir el directorio 'dist' con archivos compilados
ls -la dist/

# Debe existir el directorio 'dist-electron' para la app de escritorio
ls -la dist-electron/
```

---

## 📁 Estructura del Proyecto

```
Chat Odontológico/
├── src/                          # Código fuente React + TypeScript
│   ├── components/
│   │   ├── admin/               # Panel administrativo
│   │   ├── chat/                # Módulo de chat
│   │   └── Login.tsx            # Pantalla de login
│   ├── lib/                     # Utilidades
│   │   ├── supabase.ts          # Cliente Supabase
│   │   └── notifications.tsx    # Sistema de notificaciones
│   ├── App.tsx                  # Componente principal
│   └── main.tsx                 # Punto de entrada React
│
├── electron/                     # Código Electron (app de escritorio)
│   ├── main.ts                  # Proceso principal
│   └── preload.ts               # API preload
│
├── public/                       # Assets estáticos
│   └── logo ls.jpeg             # Logo de LS
│
├── dist/                        # Salida compilada (React/Vite)
├── dist-electron/               # Salida Electron compilada
├── release/                      # Instaladores generados
│
├── .env                         # Variables de entorno (NO COMMITEAR)
├── package.json                 # Dependencias y scripts
├── vite.config.ts               # Configuración Vite
├── tsconfig.json                # Configuración TypeScript
├── eslint.config.js             # Reglas ESLint
│
└── README.md                    # Documentación del proyecto
```

---

## 🔧 Configuración Supabase

### 1. Variables de Entorno

El archivo `.env` contiene:

```env
VITE_SUPABASE_URL=https://pildiccgpxixniapsxzp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Crear Proyecto Supabase

1. Ve a https://supabase.com/
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Copia las claves en `.env`

### 3. Base de Datos Requerida

Ejecuta el script SQL en Supabase:

```bash
# En tu Supabase Console, SQL Editor:
# Abre el archivo supabase_setup.sql
```

Este script crea las tablas necesarias:
- `users` (perfiles de usuarios)
- `messages` (mensajes del chat)
- `rooms` (salas de chat)
- Políticas de seguridad RLS

---

## 👨‍💻 Desarrollo

### Iniciar Servidor de Desarrollo

```bash
npm run electron:dev
```

O para solo el frontend web:
```bash
npm run dev
```

Esto abre:
- La aplicación en http://localhost:5173 (con HMR)
- La ventana Electron de la app de escritorio
- Recarga automática en cambios de código

### Scripts Disponibles

```bash
npm run dev              # Desarrollo web (Vite HMR)
npm run electron:dev    # Desarrollo Electron + web
npm run build           # Producción completa
npm run build:web       # Solo compilar web
npm run lint            # Revisar código (ESLint)
npm run preview         # Previsualizar build web
npm run tsc             # Verificar tipos TypeScript
```

### Estructura de Carpetas para Nuevos Componentes

```bash
# Crear un nuevo componente
src/components/[nombre]/
├── index.tsx            # Componente principal
├── styles.module.css    # Estilos (si aplica)
└── types.ts             # Tipos TypeScript
```

---

## 📦 Compilación para Producción

### 1. Compilar el Proyecto

```bash
npm run build
```

Genera:
- `dist/` - Aplicación web optimizada
- `dist-electron/` - Proceso Electron compilado
- `release/` - Instaladores ejecutables

### 2. Instalador para Windows

El instalador se crea automáticamente en `release/`:
- `Instalador-LS-Chat-1.0.0.exe`

### 3. Distribuir

Opciones:
- **Email**: Envía el .exe a usuarios
- **Sitio Web**: Aloja en servidor web
- **Auto-Updates**: Configura en package.json (GitHub releases)

### Configuración de Auto-Updates

En `package.json`:
```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "lynxok",
    "repo": "chatodontologico"
  }
}
```

Las actualizaciones se publican en GitHub releases.

---

## 🔍 Troubleshooting

### Error: "Cannot find module @rollup/rollup-linux-x64-gnu"

**Solución**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error: "npm ERR! 403 Forbidden"

**Causas comunes**:
1. Sin conexión a internet
2. Registros de npm bloqueados
3. Firewall/proxy

**Soluciones**:
```bash
# Usar registry alternativo
npm config set registry https://registry.npmjs.org/

# O instalar offline
npm ci --prefer-offline
```

### Electron no abre la ventana

**Verificar**:
1. Que npm install haya completado sin errores
2. Que los directorios `dist/` y `dist-electron/` existan
3. Ver la consola para errores

```bash
# Compilar nuevamente
npm run build
npm run electron:dev
```

### Supabase rechaza conexión

**Verificar**:
1. Las claves en `.env` son correctas
2. Tu proyecto Supabase está activo
3. Las reglas RLS no bloquean acceso

En Supabase Console → SQL Editor, ejecuta:
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies;
```

### "Port 5173 already in use"

```bash
# Cambiar puerto
npm run dev -- --port 5174
```

O usa:
```bash
# En Windows
netstat -ano | findstr :5173
taskkill /PID [PID] /F

# En macOS/Linux
lsof -i :5173
kill -9 [PID]
```

### Instalador no aparece en /release

**Causas**:
1. Build falló silenciosamente
2. electron-builder no está instalado

**Solución**:
```bash
npm install electron-builder
npm run build
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa este archivo** - Las respuestas más comunes están aquí
2. **Verifica el .env** - Las credenciales son críticas
3. **Limpia e reinstala** - `rm -rf node_modules && npm install`
4. **Consulta la consola** - Los errores suelen ser descriptivos

---

## 📝 Notas de Versión

**v1.0.0** (2026-04-17)
- ✅ Estructura base completada
- ✅ Integración Supabase funcional
- ✅ Componentes React implementados
- ✅ Electron configurado
- 🔧 En revisión: Finalización de features avanzadas

---

**Documento generado**: 17 de Abril de 2026  
**Proyecto**: Chat Odontológico - LS Odontología  
**Versión**: 1.0.0
