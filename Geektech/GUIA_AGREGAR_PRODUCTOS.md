# 📖 GUÍA FÁCIL PARA AGREGAR PRODUCTOS EN GEEKTECH

## ✅ PASOS SIMPLES

### 1️⃣ ACCEDER AL PANEL
1. Abre tu navegador (Chrome, Firefox, Edge, etc.)
2. Ve a: `http://localhost:3000/geektech-miikiis-admin`
3. Ingresa la contraseña y presiona **ENTRAR**

### 2️⃣ ELEGIR DONDE AGREGAR
El menú izquierdo tiene 3 opciones:
- 🎮 **Inicio & Juegos** — Para juegos y licencias
- 🔧 **Mantenimiento y Tienda** — Para componentes de PC y servicios
- 📺 **Streaming** — Para cuentas y suscripciones

### 3️⃣ AGREGAR UN PRODUCTO
1. Haz clic en el botón verde **"+ AGREGAR"**
2. Rellena el formulario:
   - **Nombre** ⭐ OBLIGATORIO
   - **Descripción** (describe qué es)
   - **Precio** o **Varias opciones**

### 4️⃣ PRECIO ÚNICO O OPCIONES
- 💰 **Precio único**: Un solo precio final
- 📋 **Varias opciones**: Diferentes planes/tamaños (ej: 8GB, 16GB)

### 5️⃣ IMAGEN
- Pégalo URL de una imagen (https://...)
- Si dejas vacío, uso una imagen por defecto

### 6️⃣ GUARDAR
1. Presiona **"✅ CREAR PRODUCTO"**
2. ¡Listo! El producto aparece en tu tienda al instante

---

## 🔧 EDITAR O ELIMINAR

### EDITAR ✏️
1. Busca el producto en la lista
2. Haz clic en el icono ✏️
3. Modifica lo que necesites
4. Presiona **"✅ GUARDAR CAMBIOS"**

### ELIMINAR 🗑️
1. Haz clic en el icono 🗑️
2. Confirma que quieres eliminar
3. ¡Eliminado!

---

## ⚠️ ERRORES COMUNES

### "Error: Unexpected token '<', "<!DOCTYPE""
**Problema**: El servidor no está conectado a la base de datos

**Solución**:
1. Verifica que `.env.local` tenga las variables correctas:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   DATABASE_URL=...
   ```
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta: `npm run dev`
4. Espera 5-10 segundos
5. Intenta de nuevo

### "¡No se puede agregar 2 o más productos!"
**Solución**: Este error está fixeado. Los cambios aplican automáticamente.

---

## 🎨 CONSEJOS

✅ **Usa descripciones claras** — Ayuda a tus clientes a entender el producto
✅ **Fotos de calidad** — Usa URLs de imágenes nítidas
✅ **Precios justos** — Mantén consistencia en precios
✅ **Organiza por orden** — Usa los botones ↕️ para reordenar
✅ **Destaca especiales** — Marca 🌟 los que quieras destacar primero

---

## 📞 AYUDA RÁPIDA

Si algo no funciona:
1. Recarga la página (Ctrl+F5)
2. Cierra y abre de nuevo el panel
3. Reinicia el servidor: Ctrl+C y luego `npm run dev`

¡Listo! Tu tienda está lista para vender. 🚀
