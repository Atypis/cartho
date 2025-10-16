/**
 * Supabase Database Types
 */

export interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          id: string;
          title: string;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at: string;
          tool_calls?: any;
          tool_results?: any;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          created_at?: string;
          tool_calls?: any;
          tool_results?: any;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          created_at?: string;
          tool_calls?: any;
          tool_results?: any;
        };
      };
      use_cases: {
        Row: {
          id: string;
          title: string;
          description: string;
          created_at: string;
          updated_at: string;
          created_in_session_id: string | null;
          tags: string[];
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          created_at?: string;
          updated_at?: string;
          created_in_session_id?: string | null;
          tags?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
          created_in_session_id?: string | null;
          tags?: string[];
        };
      };
      evaluations: {
        Row: {
          id: string;
          use_case_id: string;
          pn_ids: string[];
          triggered_at: string;
          completed_at: string | null;
          status: 'pending' | 'running' | 'completed' | 'failed';
          error_message: string | null;
          triggered_in_session_id: string | null;
        };
        Insert: {
          id?: string;
          use_case_id: string;
          pn_ids: string[];
          triggered_at?: string;
          completed_at?: string | null;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          error_message?: string | null;
          triggered_in_session_id?: string | null;
        };
        Update: {
          id?: string;
          use_case_id?: string;
          pn_ids?: string[];
          triggered_at?: string;
          completed_at?: string | null;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          error_message?: string | null;
          triggered_in_session_id?: string | null;
        };
      };
      evaluation_results: {
        Row: {
          id: string;
          evaluation_id: string;
          pn_id: string;
          compliant: boolean;
          states: any; // JSONB array of EvaluationState
          created_at: string;
        };
        Insert: {
          id?: string;
          evaluation_id: string;
          pn_id: string;
          compliant: boolean;
          states: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          evaluation_id?: string;
          pn_id?: string;
          compliant?: boolean;
          states?: any;
          created_at?: string;
        };
      };
    };
  };
}
