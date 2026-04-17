# 👤 Crear Usuarios en Supabase

**Versión**: 1.0  
**Última Actualización**: 17 de Abril de 2026

---

## 📋 Resumen

Necesitas crear 5 usuarios de prueba en Supabase para que tu aplicación funcione correctamente. Aquí te muestro cómo hacerlo en 5 minutos.

---

## 🆕 Usuarios a Crear

Copia y usa estas credenciales exactas:

### 1️⃣ SECRETARÍA
```
Email:    secretaria@lsodontologo.com
Password: Secretaria123!
PIN:      1234
```

### 2️⃣ CONSULTORIO 1
```
Email:    consultorio1@lsodontologo.com
Password: Consultorio123!
PIN:      2345
```

### 3️⃣ CONSULTORIO 2
```
Email:    consultorio2@lsodontologo.com
Password: Consultorio123!
PIN:      3456
```

### 4️⃣ CONSULTORIO 3
```
Email:    consultorio3@lsodontologo.com
Password: Consultorio123!
PIN:      4567
```

### 5️⃣ SUPER ADMINISTRADOR
```
Email:    admin@lsodontologo.com
Password: Admin123!
PIN:      0000
```

---

## 🚀 Pasos para Crear Usuarios

### Paso 1: Abre Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta de Supabase
3. Selecciona tu proyecto "Chat Odontológico"

### Paso 2: Ve a Authentication

1. En el menú de la izquierda, haz clic en **"Authentication"**
2. Luego haz clic en **"Users"**

### Paso 3: Crear Primer Usuario

1. Haz clic en el botón **"Create new user"** (arriba a la derecha)
2. Se abrirá un formulario con estos campos:
   - **Email**: `secretaria@lsodontologo.com`
   - **Password**: `Secretaria123!`
   - **Confirm Password**: `Secretaria123!`

3. **⚠️ IMPORTANTE**: Marca la opción **"Auto-confirm user"**
   - Esto hace que el usuario esté listo para usar inmediatamente

4. Haz clic en **"Create user"**

### Paso 4: Repetir para los Otros Usuarios

Repite el Paso 3 con los otros 4 usuarios, usando las credenciales de arriba.

### Paso 5: Verificar

Una vez creados todos los usuarios, deberías ver una tabla como esta:

| Email | Role | Created |
|-------|------|---------|
| secretaria@lsodontologo.com | | 2 min ago |
| consultorio1@lsodontologo.com | | 1 min ago |
| consultorio2@lsodontologo.com | | 1 min ago |
| consultorio3@lsodontologo.com | | 1 min ago |
| admin@lsodontologo.com | | just now |

---

## 🧪 Probar los Usuarios

Una vez creados, abre la aplicación (si no está abierta):

```bash
npm run electron:dev
```

En la pantalla de login:

1. **Selecciona un rol** (ej: "Secretaría")
2. **Ingresa el PIN** correspondiente (ej: `1234`)
3. Haz clic en **"Ingresar al Sistema"**

Si entra correctamente, ¡los usuarios están configurados! ✅

---

## ❓ Preguntas Frecuentes

### P: ¿Qué es "Auto-confirm user"?

**R**: Normalmente Supabase envía un email de confirmación. "Auto-confirm" lo salta para que puedas usar la cuenta inmediatamente en desarrollo.

### P: ¿Puedo cambiar las contraseñas?

**R**: Sí, puedes cambiarlas en Supabase o el usuario puede cambiarlas desde la app después de iniciar sesión.

### P: ¿Qué pasa si cometo un error?

**R**: Simplemente elimina el usuario y crea uno nuevo. Haz clic en los tres puntos (...) al lado del usuario y selecciona "Delete user".

### P: ¿Las contraseñas son seguras?

**R**: Estas son credenciales de **PRUEBA** solamente. Para producción, usa contraseñas más complejas y considera usar OAuth o SSO.

### P: ¿Dónde se almacenan los PINs?

**R**: Los PINs se almacenan en la tabla `profiles` de Supabase (asegúrate de que exista ejecutando el script SQL).

---

## 🔄 Próximos Pasos

Una vez creados los usuarios:

1. ✅ Prueba la app con diferentes usuarios
2. ✅ Verifica que cada rol vea la interfaz correcta
3. ✅ Prueba enviar mensajes
4. ✅ Accede al panel admin con la cuenta de super admin

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que los usuarios estén en la tabla "Users" de Supabase
2. Asegúrate de haber marcado "Auto-confirm user"
3. Intenta eliminar y crear el usuario de nuevo
4. Verifica que la tabla `profiles` exista (ejecuta `supabase_setup.sql`)

---

**¡Listo! En 5 minutos tendrás usuarios funcionando. 🎉**
