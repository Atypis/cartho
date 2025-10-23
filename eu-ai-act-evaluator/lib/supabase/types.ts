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
          node_id: string;
          decision: boolean;
          confidence: number;
          reasoning: string;
          citations: any; // JSONB array
          created_at: string;
        };
        Insert: {
          id?: string;
          evaluation_id: string;
          node_id: string;
          decision: boolean;
          confidence: number;
          reasoning: string;
          citations?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          evaluation_id?: string;
          node_id?: string;
          decision?: boolean;
          confidence?: number;
          reasoning?: string;
          citations?: any;
          created_at?: string;
        };
      };
      obligation_instances: {
        Row: {
          id: string;
          use_case_id: string;
          pn_id: string;
          pn_title: string | null;
          pn_article: string | null;
          applicability_state: 'pending' | 'evaluating' | 'applies' | 'not_applicable';
          latest_evaluation_id: string | null;
          root_decision: boolean | null;
          evaluated_at: string | null;
          implementation_state: 'not_started' | 'in_progress' | 'compliant' | 'partial' | 'non_compliant' | 'waived' | null;
          owner_id: string | null;
          due_date: string | null;
          risk_level: 'low' | 'medium' | 'high' | 'critical' | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          use_case_id: string;
          pn_id: string;
          pn_title?: string | null;
          pn_article?: string | null;
          applicability_state?: 'pending' | 'evaluating' | 'applies' | 'not_applicable';
          latest_evaluation_id?: string | null;
          root_decision?: boolean | null;
          evaluated_at?: string | null;
          implementation_state?: 'not_started' | 'in_progress' | 'compliant' | 'partial' | 'non_compliant' | 'waived' | null;
          owner_id?: string | null;
          due_date?: string | null;
          risk_level?: 'low' | 'medium' | 'high' | 'critical' | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          use_case_id?: string;
          pn_id?: string;
          pn_title?: string | null;
          pn_article?: string | null;
          applicability_state?: 'pending' | 'evaluating' | 'applies' | 'not_applicable';
          latest_evaluation_id?: string | null;
          root_decision?: boolean | null;
          evaluated_at?: string | null;
          implementation_state?: 'not_started' | 'in_progress' | 'compliant' | 'partial' | 'non_compliant' | 'waived' | null;
          owner_id?: string | null;
          due_date?: string | null;
          risk_level?: 'low' | 'medium' | 'high' | 'critical' | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      obligation_status_history: {
        Row: {
          id: string;
          obligation_instance_id: string;
          changed_by: string | null;
          from_state: string | null;
          to_state: string;
          kind: 'applicability' | 'implementation';
          reason: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          obligation_instance_id: string;
          changed_by?: string | null;
          from_state?: string | null;
          to_state: string;
          kind: 'applicability' | 'implementation';
          reason?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          obligation_instance_id?: string;
          changed_by?: string | null;
          from_state?: string | null;
          to_state?: string;
          kind?: 'applicability' | 'implementation';
          reason?: string | null;
          changed_at?: string;
        };
      };
    };
  };
}
