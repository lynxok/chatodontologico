-- LS Odontología - Fix for File Uploads and Unread Messages
-- Ejecuta esto en el Editor SQL de Supabase

-- 1. Actualizar la tabla de mensajes con las columnas faltantes
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 2. Políticas de Storage para el bucket "chat-attachments"
-- Asegúrate de que el bucket "chat-attachments" exista en Storage y sea PÚBLICO.

-- Permitir acceso público para ver archivos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Access" ON storage.objects
            FOR SELECT USING (bucket_id = 'chat-attachments');
    END IF;
END
$$;

-- Permitir a usuarios autenticados subir archivos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Authenticated Upload" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'chat-attachments' AND 
                auth.role() = 'authenticated'
            );
    END IF;
END
$$;

-- Permitir a los usuarios borrar sus propios archivos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Owner Delete' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Owner Delete" ON storage.objects
            FOR DELETE USING (
                bucket_id = 'chat-attachments' AND 
                (auth.uid())::text = (storage.foldername(name))[1]
            );
    END IF;
END
$$;
