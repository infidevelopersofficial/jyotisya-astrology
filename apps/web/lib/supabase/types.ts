/**
 * Supabase Database Types
 *
 * This file can be auto-generated using:
 * npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [_ in string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: {
      [_ in string]: {
        Row: Record<string, any>
      }
    }
    Functions: {
      [_ in string]: {
        Args: Record<string, any>
        Returns: any
      }
    }
    Enums: {
      [_ in string]: string
    }
  }
}
