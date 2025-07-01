export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      designs: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          canvas_data: Json
          preview_url: string | null
          template_id: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          canvas_data: Json
          preview_url?: string | null
          template_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          canvas_data?: Json
          preview_url?: string | null
          template_id?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "designs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          canvas_data: Json
          preview_url: string | null
          is_featured: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          canvas_data: Json
          preview_url?: string | null
          is_featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          canvas_data?: Json
          preview_url?: string | null
          is_featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_uploads: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          upload_type: 'image' | 'background' | 'asset'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          upload_type: 'image' | 'background' | 'asset'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          upload_type?: 'image' | 'background' | 'asset'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      upload_type: 'image' | 'background' | 'asset'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Design = Database['public']['Tables']['designs']['Row']
export type DesignInsert = Database['public']['Tables']['designs']['Insert']
export type DesignUpdate = Database['public']['Tables']['designs']['Update']

export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']

export type UserUpload = Database['public']['Tables']['user_uploads']['Row']
export type UserUploadInsert = Database['public']['Tables']['user_uploads']['Insert']
export type UserUploadUpdate = Database['public']['Tables']['user_uploads']['Update']

export type UploadType = Database['public']['Enums']['upload_type']