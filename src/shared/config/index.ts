export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_URL_LOCAL = import.meta.env.VITE_SUPABASE_URL_LOCAL;

export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_ANON_KEY_LOCAL = import.meta.env.VITE_SUPABASE_ANON_KEY_LOCAL;

export const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
export const SUPABASE_SERVICE_ROLE_KEY_LOCAL = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY_LOCAL;

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '';

export const IS_LOCAL_DB = import.meta.env.VITE_DB_MODE === 'local';
