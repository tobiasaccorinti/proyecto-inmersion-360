-- ============================================================
-- Migración: Sistema de validación de empresas
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columnas de validación a la tabla profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS validacion_estado TEXT DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS documento_url     TEXT,
  ADD COLUMN IF NOT EXISTS validacion_notas  TEXT;

-- 2. Constraint en validacion_estado
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_validacion_estado_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_validacion_estado_check
  CHECK (validacion_estado IN ('pendiente', 'aprobada', 'rechazada'));

-- 3. Las empresas ya existentes se aprueban automáticamente
--    (fueron creadas antes del sistema de validación)
UPDATE profiles
  SET validacion_estado = 'aprobada'
  WHERE role = 'empresa' AND validacion_estado = 'pendiente';

-- 4. Si la tabla profiles tiene un CHECK constraint en el campo `role`,
--    hay que actualizarlo para incluir 'admin'.
--    Primero buscá el nombre del constraint con:
--      SELECT conname FROM pg_constraint WHERE conrelid = 'profiles'::regclass;
--    Luego:
--    ALTER TABLE profiles DROP CONSTRAINT <nombre_del_constraint>;
--    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
--      CHECK (role IN ('estudiante', 'empresa', 'institucion', 'admin'));

-- ============================================================
-- Storage: Crear bucket para documentos de empresas
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Crear el bucket (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('empresa-documentos', 'empresa-documentos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquier usuario anónimo puede subir archivos
-- (necesario para que la empresa suba el doc antes de registrarse)
CREATE POLICY "Subida pública de documentos de empresa"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'empresa-documentos');

-- Política: lectura pública para que el admin vea los docs
CREATE POLICY "Lectura pública de documentos de empresa"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'empresa-documentos');
