export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_generations: {
        Row: {
          application_id: string | null
          block_id: string | null
          created_at: string | null
          id: string
          model_used: string | null
          prompt_hash: string | null
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
        }
        Insert: {
          application_id?: string | null
          block_id?: string | null
          created_at?: string | null
          id?: string
          model_used?: string | null
          prompt_hash?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          block_id?: string | null
          created_at?: string | null
          id?: string
          model_used?: string | null
          prompt_hash?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "app_resume_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_resume_blocks: {
        Row: {
          app_resume_id: string | null
          block_type: Database["public"]["Enums"]["app_resume_block_type"]
          content_json: Json
          created_at: string
          id: string
          section_id: string
          sort_key: number
          style_json: Json
          updated_at: string
        }
        Insert: {
          app_resume_id?: string | null
          block_type: Database["public"]["Enums"]["app_resume_block_type"]
          content_json?: Json
          created_at?: string
          id?: string
          section_id: string
          sort_key?: number
          style_json?: Json
          updated_at?: string
        }
        Update: {
          app_resume_id?: string | null
          block_type?: Database["public"]["Enums"]["app_resume_block_type"]
          content_json?: Json
          created_at?: string
          id?: string
          section_id?: string
          sort_key?: number
          style_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_resume_block_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "app_resume_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_resume_blocks_app_resume_id_fkey"
            columns: ["app_resume_id"]
            isOneToOne: false
            referencedRelation: "app_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      app_resume_sections: {
        Row: {
          app_resume_id: string
          created_at: string
          display_name: string
          generated_resume_id: string | null
          id: string
          section_type: Database["public"]["Enums"]["app_resume_section_type"]
          sort_key: number
          style_json: Json
          updated_at: string
        }
        Insert: {
          app_resume_id: string
          created_at?: string
          display_name: string
          generated_resume_id?: string | null
          id?: string
          section_type: Database["public"]["Enums"]["app_resume_section_type"]
          sort_key?: number
          style_json?: Json
          updated_at?: string
        }
        Update: {
          app_resume_id?: string
          created_at?: string
          display_name?: string
          generated_resume_id?: string | null
          id?: string
          section_type?: Database["public"]["Enums"]["app_resume_section_type"]
          sort_key?: number
          style_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_resume_section_app_resume_id_fkey"
            columns: ["app_resume_id"]
            isOneToOne: false
            referencedRelation: "app_resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_resume_section_generated_resume_id_fkey"
            columns: ["generated_resume_id"]
            isOneToOne: false
            referencedRelation: "generated_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      app_resumes: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          score: number | null
          status: Database["public"]["Enums"]["app_resume_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["app_resume_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["app_resume_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_resume_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          company_name: string | null
          created_at: string | null
          generated_cover_letter_id: string | null
          generated_resume_id: string | null
          id: string
          job_description: string | null
          job_title: string | null
          job_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          visitor_id: number | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          generated_cover_letter_id?: string | null
          generated_resume_id?: string | null
          id?: string
          job_description?: string | null
          job_title?: string | null
          job_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          visitor_id?: number | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          generated_cover_letter_id?: string | null
          generated_resume_id?: string | null
          id?: string
          job_description?: string | null
          job_title?: string | null
          job_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          visitor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_generated_cover_letter_id_fkey"
            columns: ["generated_cover_letter_id"]
            isOneToOne: false
            referencedRelation: "generated_cover_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_generated_resume_id_fkey"
            columns: ["generated_resume_id"]
            isOneToOne: false
            referencedRelation: "generated_resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          active: boolean
          ats: string | null
          consecutive_failures: number
          created_at: string
          etag: string | null
          id: number
          last_polled_at: string | null
          last_success_at: string | null
          name: string | null
          next_poll_at: string
          slug: string | null
          tier: number | null
        }
        Insert: {
          active?: boolean
          ats?: string | null
          consecutive_failures?: number
          created_at?: string
          etag?: string | null
          id?: number
          last_polled_at?: string | null
          last_success_at?: string | null
          name?: string | null
          next_poll_at?: string
          slug?: string | null
          tier?: number | null
        }
        Update: {
          active?: boolean
          ats?: string | null
          consecutive_failures?: number
          created_at?: string
          etag?: string | null
          id?: number
          last_polled_at?: string | null
          last_success_at?: string | null
          name?: string | null
          next_poll_at?: string
          slug?: string | null
          tier?: number | null
        }
        Relationships: []
      }
      generated_cover_letters: {
        Row: {
          application_id: string
          cost: number | null
          created_at: string
          file_url: string | null
          id: string
          source_resume_id: string | null
          tokens_input: number | null
          tokens_output: number | null
          updated_at: string
          user_id: string
          visitor_id: number | null
        }
        Insert: {
          application_id: string
          cost?: number | null
          created_at?: string
          file_url?: string | null
          id?: string
          source_resume_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
          user_id: string
          visitor_id?: number | null
        }
        Update: {
          application_id?: string
          cost?: number | null
          created_at?: string
          file_url?: string | null
          id?: string
          source_resume_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
          user_id?: string
          visitor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_cover_letters_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_cover_letters_source_resume_id_fkey"
            columns: ["source_resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_cover_letters_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_qa: {
        Row: {
          answer: string | null
          application_id: string
          created_at: string
          id: string
          question: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          application_id: string
          created_at?: string
          id?: string
          question: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          application_id?: string
          created_at?: string
          id?: string
          question?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_qa_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_resumes: {
        Row: {
          application_id: string | null
          cost: number | null
          created_at: string
          file_url: string | null
          id: string
          keywords: Json | null
          new_score: number | null
          old_score: number | null
          source_resume_id: string | null
          status: string
          tokens_input: number | null
          tokens_output: number | null
          updated_at: string
          user_id: string | null
          visitor_id: number | null
        }
        Insert: {
          application_id?: string | null
          cost?: number | null
          created_at?: string
          file_url?: string | null
          id?: string
          keywords?: Json | null
          new_score?: number | null
          old_score?: number | null
          source_resume_id?: string | null
          status?: string
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
          user_id?: string | null
          visitor_id?: number | null
        }
        Update: {
          application_id?: string | null
          cost?: number | null
          created_at?: string
          file_url?: string | null
          id?: string
          keywords?: Json | null
          new_score?: number | null
          old_score?: number | null
          source_resume_id?: string | null
          status?: string
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
          user_id?: string | null
          visitor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_resumes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_source_resume_id_fkey"
            columns: ["source_resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          apply_url: string
          ats: string
          clicks: number | null
          closed_at: string | null
          company_id: number
          department: string | null
          description_html: string | null
          external_id: string
          first_seen_at: string
          id: number
          is_active: boolean
          is_seed: boolean
          location: string | null
          posted_at: string | null
          raw: Json | null
          title: string
        }
        Insert: {
          apply_url: string
          ats: string
          clicks?: number | null
          closed_at?: string | null
          company_id: number
          department?: string | null
          description_html?: string | null
          external_id: string
          first_seen_at?: string
          id?: never
          is_active?: boolean
          is_seed?: boolean
          location?: string | null
          posted_at?: string | null
          raw?: Json | null
          title: string
        }
        Update: {
          apply_url?: string
          ats?: string
          clicks?: number | null
          closed_at?: string | null
          company_id?: number
          department?: string | null
          description_html?: string | null
          external_id?: string
          first_seen_at?: string
          id?: never
          is_active?: boolean
          is_seed?: boolean
          location?: string | null
          posted_at?: string | null
          raw?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pgwp_tracker: {
        Row: {
          created_at: string
          id: number
          pgwp_expired_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          pgwp_expired_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          pgwp_expired_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pgwp_tracker_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_emails: {
        Row: {
          application_id: string | null
          confidence: string | null
          created_at: string | null
          email: string | null
          id: string
          reason: string | null
          source: string | null
          source_url: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          confidence?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          reason?: string | null
          source?: string | null
          source_url?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          confidence?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          reason?: string | null
          source?: string | null
          source_url?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_emails_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string | null
          id: string
          keywords: Json | null
          original_file_url: string | null
          parsed_text: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          keywords?: Json | null
          original_file_url?: string | null
          parsed_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          keywords?: Json | null
          original_file_url?: string | null
          parsed_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_additional_info: {
        Row: {
          certifications: string[] | null
          created_at: string | null
          id: string
          languages: string[] | null
          user_id: string | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string | null
          id?: string
          languages?: string[] | null
          user_id?: string | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string | null
          id?: string
          languages?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_disclosures: {
        Row: {
          authorized_to_work: string | null
          created_at: string | null
          disability_status: string | null
          ethnicity: string | null
          gender: string | null
          id: string
          require_sponsorship: string | null
          user_id: string | null
          veteran_status: string | null
          willing_to_relocate: string | null
        }
        Insert: {
          authorized_to_work?: string | null
          created_at?: string | null
          disability_status?: string | null
          ethnicity?: string | null
          gender?: string | null
          id?: string
          require_sponsorship?: string | null
          user_id?: string | null
          veteran_status?: string | null
          willing_to_relocate?: string | null
        }
        Update: {
          authorized_to_work?: string | null
          created_at?: string | null
          disability_status?: string | null
          ethnicity?: string | null
          gender?: string | null
          id?: string
          require_sponsorship?: string | null
          user_id?: string | null
          veteran_status?: string | null
          willing_to_relocate?: string | null
        }
        Relationships: []
      }
      user_educations: {
        Row: {
          created_at: string | null
          degree: string | null
          description: string | null
          end_date: string | null
          field_of_study: string | null
          gpa: string | null
          id: string
          school: string
          start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          gpa?: string | null
          id?: string
          school: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          gpa?: string | null
          id?: string
          school?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_links: {
        Row: {
          created_at: string | null
          id: string
          link_type: string | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_type?: string | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link_type?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: number
          project_name: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          project_name?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          project_name?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skill_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_from_org_resume: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_from_org_resume?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_from_org_resume?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "user_skill_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage: {
        Row: {
          ai_generations_limit: number | null
          ai_generations_used: number
          application_answers_limit: number | null
          application_answers_used: number
          cover_letters_limit: number
          cover_letters_used: number
          extract_text_limit: number
          extract_text_used: number
          files_download_limit: number | null
          files_download_used: number | null
          find_hr_limit: number | null
          find_hr_used: number | null
          id: string
          period_end: string | null
          period_start: string
          plan_key: string
          resume_generations_limit: number
          resume_generations_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generations_limit?: number | null
          ai_generations_used?: number
          application_answers_limit?: number | null
          application_answers_used?: number
          cover_letters_limit?: number
          cover_letters_used?: number
          extract_text_limit?: number
          extract_text_used?: number
          files_download_limit?: number | null
          files_download_used?: number | null
          find_hr_limit?: number | null
          find_hr_used?: number | null
          id?: string
          period_end?: string | null
          period_start?: string
          plan_key?: string
          resume_generations_limit?: number
          resume_generations_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generations_limit?: number | null
          ai_generations_used?: number
          application_answers_limit?: number | null
          application_answers_used?: number
          cover_letters_limit?: number
          cover_letters_used?: number
          extract_text_limit?: number
          extract_text_used?: number
          files_download_limit?: number | null
          files_download_used?: number | null
          find_hr_limit?: number | null
          find_hr_used?: number | null
          id?: string
          period_end?: string | null
          period_start?: string
          plan_key?: string
          resume_generations_limit?: number
          resume_generations_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_work_experiences: {
        Row: {
          company: string
          created_at: string | null
          currently_working: boolean | null
          description: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          location: string | null
          start_date: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          currently_working?: boolean | null
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          currently_working?: boolean | null
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          expected_salary: number | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          onboarding_current_step: string | null
          onboarding_tour_status: string | null
          phone: string | null
          plan_type: string | null
          postal_code: string | null
          province: string | null
          summary: string | null
          target_role: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          expected_salary?: number | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          onboarding_current_step?: string | null
          onboarding_tour_status?: string | null
          phone?: string | null
          plan_type?: string | null
          postal_code?: string | null
          province?: string | null
          summary?: string | null
          target_role?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          expected_salary?: number | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_current_step?: string | null
          onboarding_tour_status?: string | null
          phone?: string | null
          plan_type?: string | null
          postal_code?: string | null
          province?: string | null
          summary?: string | null
          target_role?: string | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          anon_id: string | null
          created_at: string
          fingerprint: string | null
          id: number
          ip_hash: string | null
          last_visit_at: string | null
          used_cover_letter: boolean | null
          used_extract_text: boolean | null
          used_resume: boolean | null
          visit_count: number | null
        }
        Insert: {
          anon_id?: string | null
          created_at?: string
          fingerprint?: string | null
          id?: number
          ip_hash?: string | null
          last_visit_at?: string | null
          used_cover_letter?: boolean | null
          used_extract_text?: boolean | null
          used_resume?: boolean | null
          visit_count?: number | null
        }
        Update: {
          anon_id?: string | null
          created_at?: string
          fingerprint?: string | null
          id?: number
          ip_hash?: string | null
          last_visit_at?: string | null
          used_cover_letter?: boolean | null
          used_extract_text?: boolean | null
          used_resume?: boolean | null
          visit_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_due_companies: {
        Args: { p_ats: string; p_batch?: number }
        Returns: {
          active: boolean
          ats: string | null
          consecutive_failures: number
          created_at: string
          etag: string | null
          id: number
          last_polled_at: string | null
          last_success_at: string | null
          name: string | null
          next_poll_at: string
          slug: string | null
          tier: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "companies"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_jobs: {
        Args: {
          p_city?: string
          p_continent_terms?: string[]
          p_country?: string
          p_limit?: number
          p_location?: string
          p_offset?: number
          p_posted_since?: string
          p_region?: string
          p_sort?: string
          p_title?: string
          p_title_tokens?: string[]
        }
        Returns: {
          apply_url: string
          ats: string
          clicks: number
          company_id: number
          company_name: string
          company_slug: string
          department: string
          description_html: string
          first_seen_at: string
          id: number
          is_active: boolean
          is_seed: boolean
          location: string
          posted_at: string
          title: string
        }[]
      }
      increment_job_clicks: {
        Args: { p_job_id: number }
        Returns: number
      }
      sync_company_jobs: {
        Args: { p_company_id: number; p_seen_ids: string[] }
        Returns: string[]
      }
    }
    Enums: {
      app_resume_block_type:
        | "bullet_list"
        | "rich_text"
        | "job_entry"
        | "skills_group"
        | "link_list"
        | "separator"
        | "group_text"
        | "project_entry"
        | "education_entry"
        | "skill_entry"
        | "skill_category_entry"
      app_resume_section_type:
        | "header"
        | "summary"
        | "experience"
        | "education"
        | "skills"
        | "projects"
        | "certifications"
        | "awards"
        | "languages"
        | "volunteer"
        | "publications"
        | "custom"
      app_resume_status: "draft" | "downloaded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_resume_block_type: [
        "bullet_list",
        "rich_text",
        "job_entry",
        "skills_group",
        "link_list",
        "separator",
        "group_text",
        "project_entry",
        "education_entry",
        "skill_entry",
        "skill_category_entry",
      ],
      app_resume_section_type: [
        "header",
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "awards",
        "languages",
        "volunteer",
        "publications",
        "custom",
      ],
      app_resume_status: ["draft", "downloaded"],
    },
  },
} as const

export type ApplicationRow =
	Database["public"]["Tables"]["applications"]["Row"]
export type ResumeRow = Database["public"]["Tables"]["resumes"]["Row"]
export type GeneratedResumeRow =
	Database["public"]["Tables"]["generated_resumes"]["Row"]
export type GeneratedCoverLetterRow =
	Database["public"]["Tables"]["generated_cover_letters"]["Row"]
export type JobRow = Database["public"]["Tables"]["jobs"]["Row"]
export type CompanyRow = Database["public"]["Tables"]["companies"]["Row"]
export type AppResumeRow = Database["public"]["Tables"]["app_resumes"]["Row"]

export type ApplicationWithDocuments = ApplicationRow & {
	generated_resume_id: string | null
	generated_cover_letter_id: string | null
	generated_resume: GeneratedResumeRow | null
	generated_cover_letter: GeneratedCoverLetterRow | null
	/** Linked builder resume — used for the applications list score. */
	app_resume: Pick<AppResumeRow, "id" | "score"> | null
}

export type JobFeedItem = {
	id: number
	title: string
	location: string | null
	department: string | null
	apply_url: string
	ats: string
	posted_at: string | null
	first_seen_at: string
	is_seed: boolean
	is_active: boolean
	company_id: number
	description_html: string | null
	clicks: number
	companies: Pick<CompanyRow, "id" | "name" | "slug"> | null
}

export type UserProfileRow = Database["public"]["Tables"]["users"]["Row"]
export type SubscriptionRow =
	Database["public"]["Tables"]["user_subscriptions"]["Row"]
export type UserWorkExperienceRow =
	Database["public"]["Tables"]["user_work_experiences"]["Row"]
export type UserEducationRow =
	Database["public"]["Tables"]["user_educations"]["Row"]
export type UserDisclosureRow =
	Database["public"]["Tables"]["user_disclosures"]["Row"]
export type UserLinkRow = Database["public"]["Tables"]["user_links"]["Row"]
export type UserAdditionalInfoRow =
	Database["public"]["Tables"]["user_additional_info"]["Row"]
export type UserSkillRow = Database["public"]["Tables"]["user_skills"]["Row"]
export type UserSkillCategoryRow =
	Database["public"]["Tables"]["user_skill_categories"]["Row"]
export type UserProjectRow =
	Database["public"]["Tables"]["user_projects"]["Row"]
export type PgwpTrackerRow =
	Database["public"]["Tables"]["pgwp_tracker"]["Row"]
