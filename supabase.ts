import { createClient } from '@supabase/supabase-js';
import { Word, PartOfSpeech } from '../types';

// Retrieve Supabase environment variables
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY;

// Only initialize Supabase if both parameters are provided
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Track columns discovered on the 'words' table to avoid SQL column-not-found errors
let knownWordsColumns: Set<string> | null = null;
let knownStatsColumns: Set<string> | null = null;

/**
 * Maps any database row (whether camelCase or snake_case) back into the strict frontend `Word` interface.
 */
export function mapRowToWord(row: any): Word {
  const parts = row.parts_of_speech || row.partsOfSpeech || [];
  const partsArray: PartOfSpeech[] = Array.isArray(parts)
    ? parts
    : typeof parts === 'string'
    ? JSON.parse(parts)
    : [];

  return {
    id: row.id,
    spelling: row.spelling,
    meaning: row.meaning,
    partsOfSpeech: partsArray,
    sizeTier: row.size_tier !== undefined ? row.size_tier : (row.sizeTier !== undefined ? row.sizeTier : 3),
    lockedUntil: Number(row.locked_until !== undefined ? row.locked_until : (row.lockedUntil !== undefined ? row.lockedUntil : 0)),
    lockedAtCount: row.locked_at_count !== undefined ? row.locked_at_count : (row.lockedAtCount !== undefined ? row.lockedAtCount : 0),
    createdAt: Number(row.created_at !== undefined ? row.created_at : (row.createdAt !== undefined ? row.createdAt : Date.now())),
    incorrectCount: row.incorrect_count !== undefined ? row.incorrect_count : row.incorrectCount || 0,
    memorizedCount: row.memorized_count !== undefined ? row.memorized_count : row.memorizedCount || 0,
    initialSizeTier: row.initial_size_tier !== undefined ? row.initial_size_tier : row.initialSizeTier || row.sizeTier,
  };
}

/**
 * Builds a dynamic payload filtering out properties that do not exist on the table.
 * If columns have not been probed yet, we default to standard snake_case keys.
 */
export function buildWordPayload(word: Word): any {
  const fullPayload: any = {
    id: word.id,
    spelling: word.spelling,
    meaning: word.meaning,
    parts_of_speech: word.partsOfSpeech,
    partsOfSpeech: word.partsOfSpeech,
    size_tier: word.sizeTier,
    sizeTier: word.sizeTier,
    locked_until: word.lockedUntil,
    lockedUntil: word.lockedUntil,
    locked_at_count: word.lockedAtCount,
    lockedAtCount: word.lockedAtCount,
    created_at: word.createdAt,
    createdAt: word.createdAt,
    incorrect_count: word.incorrectCount || 0,
    incorrectCount: word.incorrectCount || 0,
    memorized_count: word.memorizedCount || 0,
    memorizedCount: word.memorizedCount || 0,
    initial_size_tier: word.initialSizeTier !== undefined ? word.initialSizeTier : word.sizeTier,
    initialSizeTier: word.initialSizeTier !== undefined ? word.initialSizeTier : word.sizeTier,
  };

  // Default snake_case fallback if we haven't read table metadata yet
  if (!knownWordsColumns) {
    return {
      id: word.id,
      spelling: word.spelling,
      meaning: word.meaning,
      parts_of_speech: word.partsOfSpeech,
      size_tier: word.sizeTier,
      locked_until: word.lockedUntil,
      locked_at_count: word.lockedAtCount,
      created_at: word.createdAt,
      incorrect_count: word.incorrectCount || 0,
      memorized_count: word.memorizedCount || 0,
      initial_size_tier: word.initialSizeTier !== undefined ? word.initialSizeTier : word.sizeTier,
    };
  }

  // Self-heal: only include columns that exist in user's Supabase table!
  const payload: any = {};
  for (const key of Object.keys(fullPayload)) {
    if (knownWordsColumns.has(key)) {
      payload[key] = fullPayload[key];
    }
  }
  return payload;
}

/**
 * Fetch all words from Supabase.
 */
export async function fetchSupabaseWords(): Promise<Word[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch words error:', error);
      return null;
    }

    if (data && data.length > 0) {
      // Analyze the returned columns for self-healing schema support
      knownWordsColumns = new Set(Object.keys(data[0]));
      return data.map(mapRowToWord);
    }

    // Try to probe table definition by fetching an empty limit if table is empty
    const { data: emptyProbe } = await supabase.from('words').select('*').limit(1);
    if (emptyProbe && emptyProbe.length > 0) {
      knownWordsColumns = new Set(Object.keys(emptyProbe[0]));
    }

    return [];
  } catch (err) {
    console.error('Failed to communicate with Supabase:', err);
    return null;
  }
}

/**
 * Upsert words to Supabase (saves or updates).
 */
export async function upsertSupabaseWord(word: Word): Promise<boolean> {
  if (!supabase) return false;

  try {
    const payload = buildWordPayload(word);
    const { error } = await supabase
      .from('words')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert word error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert exception:', err);
    return false;
  }
}

/**
 * Delete a word from Supabase.
 */
export async function deleteSupabaseWord(wordId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId);

    if (error) {
      console.warn('Supabase delete word error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete exception:', err);
    return false;
  }
}

/**
 * Fetch the total memorized count from a 'user_stats' or 'settings' table if it exists.
 * Otherwise, falls back to localStorage.
 */
export async function fetchSupabaseStats(): Promise<number | null> {
  if (!supabase) return null;

  const possibleTables = ['user_stats', 'settings', 'stats'];
  for (const table of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (!error && data && data.length > 0) {
        knownStatsColumns = new Set(Object.keys(data[0]));
        const row = data[0];
        // Check standard column variations
        const count = row.total_memorized_count ?? row.totalMemorizedCount ?? row.value ?? row.count;
        if (count !== undefined) {
          return Number(count);
        }
      }
    } catch {
      // Quietly try next table
    }
  }

  return null;
}

/**
 * Save total memorized count to Supabase 'user_stats' or 'settings' table if possible.
 */
export async function saveSupabaseStats(count: number): Promise<boolean> {
  if (!supabase) return false;

  const possibleTables = ['user_stats', 'settings', 'stats'];
  for (const table of possibleTables) {
    try {
      // Try to read columns if not loaded yet
      let columns = knownStatsColumns;
      if (!columns) {
        const { data } = await supabase.from(table).select('*').limit(1);
        if (data && data.length > 0) {
          columns = new Set(Object.keys(data[0]));
          knownStatsColumns = columns;
        }
      }

      if (columns) {
        const payload: any = {};
        if (columns.has('id')) {
          payload.id = 'default_user'; // standard single-row ID
        }
        
        if (columns.has('total_memorized_count')) payload.total_memorized_count = count;
        else if (columns.has('totalMemorizedCount')) payload.totalMemorizedCount = count;
        else if (columns.has('value')) payload.value = count;
        else if (columns.has('count')) payload.count = count;

        const { error } = await supabase
          .from(table)
          .upsert(payload, { onConflict: 'id' });

        if (!error) return true;
      }
    } catch {
      // Try next
    }
  }

  return false;
}
