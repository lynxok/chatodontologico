-- LS Odontología - System Error Logging Table
-- Ejecuta esto en el Editor SQL de Supabase

CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- ID del usuario que sufrió el error
    user_name TEXT, -- Nombre del usuario
    error_type TEXT NOT NULL, -- e.g., 'message_send_failure', 'file_upload_failure'
    error_message TEXT NOT NULL,
    details JSONB, -- Detalles adicionales (contenido del mensaje, props del componente, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Políticas de RLS para system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden ver los logs
CREATE POLICY "Admins can view logs" ON public.system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Todos los usuarios pueden insertar logs (para reportar errores)
CREATE POLICY "Anyone can insert logs" ON public.system_logs
    FOR INSERT WITH CHECK (true);
