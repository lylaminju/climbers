import type { User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

export const userStore = writable<User | null>(null);
