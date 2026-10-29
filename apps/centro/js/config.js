/* Configuración pública del centro de mando.
   La clave "anon" de Supabase es pública por diseño: la seguridad real son las
   políticas RLS de supabase/migrations. NUNCA pongas acá la clave service_role. */
window.CENTRO_CONFIG={
  SUPABASE_URL:'',        /* https://xxxx.supabase.co */
  SUPABASE_ANON_KEY:''    /* eyJ... (anon / publishable) */
};
