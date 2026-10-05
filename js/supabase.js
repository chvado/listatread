// js/supabase.js
// Подключение Supabase через CDN (ESM модуль)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ВСТАВЬ СВОИ ЗНАЧЕНИЯ ИЗ SUPABASE
const SUPABASE_URL = 'https://vvxkrdsshcztbpimpghi.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eGtyZHNzaGN6dGJwaW1wZ2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4ODQzMzAsImV4cCI6MjEwNjQ2MDMzMH0.2FrcejkitT3tDbOjjdbxPxSAwafT8dAxSA3zhjLwwxc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)