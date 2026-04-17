#!/usr/bin/env python3
"""
Script para crear usuarios de prueba en Supabase
Chat Odontológico - LS Odontología

USO:
1. Instala: pip install supabase python-dotenv
2. Ejecuta: python crear_usuarios_supabase.py
"""

import os
import sys
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Intentar importar supabase
try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase no está instalado")
    print("Instala con: pip install supabase python-dotenv")
    sys.exit(1)

# Configuración
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "").replace("VITE_", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "").replace("VITE_", "")

# Si las variables de entorno usan prefijo VITE_, los removemos
if not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
if not SUPABASE_KEY:
    SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")

print("=" * 60)
print("CREAR USUARIOS EN SUPABASE")
print("Chat Odontológico - LS Odontología")
print("=" * 60)
print()

# Verificar credenciales
if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Variables de entorno no configuradas")
    print()
    print("Asegúrate de que el archivo .env contiene:")
    print("  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co")
    print("  VITE_SUPABASE_ANON_KEY=tu-clave-aqui")
    print()
    sys.exit(1)

print(f"✓ URL Supabase: {SUPABASE_URL[:50]}...")
print(f"✓ Clave configurada: {SUPABASE_KEY[:20]}...")
print()

# Conectar a Supabase
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✓ Conectado a Supabase")
except Exception as e:
    print(f"❌ Error al conectar a Supabase: {e}")
    sys.exit(1)

# Usuarios a crear
USUARIOS = [
    {
        "email": "secretaria@lsodontologo.com",
        "password": "Secretaria123!",
        "role": "secretary",
        "nombre": "Secretaría",
        "pin": "1234"
    },
    {
        "email": "consultorio1@lsodontologo.com",
        "password": "Consultorio123!",
        "role": "consultorio_1",
        "nombre": "Consultorio 1",
        "pin": "2345"
    },
    {
        "email": "consultorio2@lsodontologo.com",
        "password": "Consultorio123!",
        "role": "consultorio_2",
        "nombre": "Consultorio 2",
        "pin": "3456"
    },
    {
        "email": "consultorio3@lsodontologo.com",
        "password": "Consultorio123!",
        "role": "consultorio_3",
        "nombre": "Consultorio 3",
        "pin": "4567"
    },
    {
        "email": "admin@lsodontologo.com",
        "password": "Admin123!",
        "role": "admin",
        "nombre": "Super Administrador",
        "pin": "0000"
    }
]

print(f"\nCreando {len(USUARIOS)} usuarios de prueba...\n")

# Nota sobre auth_service_key
print("⚠️  IMPORTANTE:")
print("-" * 60)
print("Este script usa la clave ANON que no puede crear usuarios directamente.")
print("Para crear usuarios automáticamente, necesitas:")
print()
print("OPCIÓN 1: Usar la Supabase Console")
print("  → Ve a https://supabase.com/dashboard")
print("  → Authentication → Users → 'Create new user'")
print("  → Copia las credenciales de abajo")
print()
print("OPCIÓN 2: Usar Admin API (requiere service_key)")
print("  Contacta al administrador del proyecto para obtener el")
print("  SUPABASE_SERVICE_KEY y ejecuta este script con esa clave")
print()
print("-" * 60)
print()

# Mostrar credenciales de prueba
print("\n📋 CREDENCIALES DE PRUEBA:")
print("=" * 60)
print()

for i, usuario in enumerate(USUARIOS, 1):
    print(f"{i}. {usuario['nombre']}")
    print(f"   Email:    {usuario['email']}")
    print(f"   Password: {usuario['password']}")
    print(f"   PIN:      {usuario['pin']}")
    print()

print("=" * 60)
print()
print("✓ Credenciales listadas arriba")
print()
print("PRÓXIMOS PASOS:")
print("1. Ve a https://supabase.com/dashboard")
print("2. Selecciona tu proyecto")
print("3. Ve a Authentication → Users")
print("4. Haz clic en 'Create new user'")
print("5. Copia un usuario de arriba y créalo")
print("6. Repite para cada usuario")
print()
print("NOTA: Asegúrate de marcar 'Auto-confirm user'")
print()
