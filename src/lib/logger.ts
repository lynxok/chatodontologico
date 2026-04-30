import { supabase } from './supabase';

export const logError = async (
  errorType: string,
  errorMessage: string,
  user?: { id: string; display_name: string },
  details?: any
) => {
  try {
    const { error } = await supabase.from('system_logs').insert({
      user_id: user?.id || 'anonymous',
      user_name: user?.display_name || 'Anónimo',
      error_type: errorType,
      error_message: errorMessage,
      details: details || {}
    });

    if (error) console.error('Error al guardar log en base de datos:', error);
  } catch (err) {
    console.error('Error crítico en logger:', err);
  }
};
