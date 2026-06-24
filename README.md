# Inspira 🚀

Inspira es una plataforma digital diseñada para conectar estudiantes de nivel secundario con empresas e instituciones educativas a través de experiencias profesionales (pasantías, charlas, visitas guiadas y talleres).

---

## 🛠️ Tecnologías

Este es un proyecto **Fullstack** desarrollado con:

### **Frontend**
- **Framework:** Next.js (App Router)
- **Estilos:** Tailwind CSS 4
- **Estado:** React Context API + Hooks
- **Tipado:** TypeScript

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express
- **Seguridad:** JWT (JSON Web Tokens)
- **Validaciones:** Express Validator
- **Lenguaje:** TypeScript

### **Infraestructura / DB**
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth (gestionado desde el backend)
- **Políticas de Seguridad:** Row-Level Security (RLS) para proteger los datos.

---

## ⚙️ Cómo Funciona

La plataforma maneja tres roles principales:

1.  **🏫 Instituciones:** Generan códigos únicos de registro para sus alumnos y habilitan experiencias específicas para su comunidad.
2.  **🏢 Empresas:** Crean y publican experiencias profesionales, gestionando cupos y estados (en vivo, grabada, etc.).
3.  **🎓 Estudiantes:** Se registran usando el código de su institución, exploran experiencias y se inscriben para participar.

---

## 🚀 Instalación y Uso

### **Requisitos Previos**
- Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
- Una cuenta en [Supabase](https://supabase.com/) con el proyecto configurado.

### **1. Descargar Dependencias**
Debes instalar los paquetes en ambas carpetas del proyecto:

```bash
# Instalar en el backend
cd backend
npm install

# Instalar en el frontend
cd ../frontend
npm install
```

### **2. Configuración de Variables de Entorno**
Asegúrate de tener los archivos `.env` configurados con tus credenciales de Supabase:

- **En `backend/.env`:**
  - `PORT=4000`
  - `SUPABASE_URL=tu_url`
  - `SUPABASE_SERVICE_ROLE_KEY=tu_service_key`
  - `JWT_SECRET=una_clave_segura`

- **En `frontend/.env.local`:**
  - `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
  - `NEXT_PUBLIC_SUPABASE_URL=tu_url`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key`

### **3. Ejecutar el Proyecto**
Para levantar el sistema completo, abre dos terminales:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

El backend correrá en `http://localhost:4000` y el frontend en `http://localhost:3000`.

