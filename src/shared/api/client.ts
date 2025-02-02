import {
  IS_LOCAL_DB,
  SUPABASE_ANON_KEY,
  SUPABASE_ANON_KEY_LOCAL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY_LOCAL,
  SUPABASE_URL,
  SUPABASE_URL_LOCAL,
} from '@/shared/config';
import { createClient } from '@supabase/supabase-js';

import { Database } from './database.types';

const URL = IS_LOCAL_DB ? SUPABASE_URL_LOCAL : SUPABASE_URL;
const KEY = IS_LOCAL_DB ? SUPABASE_SERVICE_ROLE_KEY_LOCAL : SUPABASE_ANON_KEY_LOCAL;

export const client = createClient<Database>(URL, KEY);
