import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pildiccgpxixniapsxzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbGRpY2NncHhpeG5pYXBzeHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjM4NTcsImV4cCI6MjA5MTk5OTg1N30.FjB2ETHVeZC5OJHxGvt7gjfnSeyDnqOhYTlnmDbnrHw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLastMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('Últimos mensajes:', JSON.stringify(data, null, 2));
}

checkLastMessages();
