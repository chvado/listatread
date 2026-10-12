// js/supabase.js
// Подключение к self-hosted Supabase в Yandex Cloud
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://api.listatread.online'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzkxMzkxMzE1LCJleHAiOjE5NDkwNzEzMTV9.kS3Cn3UrCbj3HfCB25xCqfwoghIX1Y1Z1-EElUd9o2c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
