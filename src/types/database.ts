export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type BaseTable<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown>,
  Update extends Record<string, unknown>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type ApplicationStatusDb =
  | "Generated"
  | "Applied"
  | "Rejected"
  | "Accepted";

export interface Database {
  public: {
    Tables: {
      profiles: BaseTable<
        {
          id: string;
          display_name: string | null;
          plan: "free" | "pro";
          created_at: string;
        },
        {
          id: string;
          display_name?: string | null;
          plan?: "free" | "pro";
          created_at?: string;
        },
        {
          id?: string;
          display_name?: string | null;
          plan?: "free" | "pro";
          created_at?: string;
        }
      >;
      resumes: BaseTable<
        {
          id: string;
          user_id: string;
          title: string;
          original_file_url: string;
          parsed_text: string;
          keywords: string[];
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          title: string;
          original_file_url: string;
          parsed_text: string;
          keywords: string[];
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          title?: string;
          original_file_url?: string;
          parsed_text?: string;
          keywords?: string[];
          created_at?: string;
          updated_at?: string;
        }
      >;
      applications: BaseTable<
        {
          id: string;
          user_id: string;
          company_name: string;
          job_title: string;
          job_url: string | null;
          job_description: string | null;
          status: ApplicationStatusDb;
          created_at: string;
          updated_at: string | null;
        },
        {
          id?: string;
          user_id: string;
          company_name: string;
          job_title: string;
          job_url?: string | null;
          job_description?: string | null;
          status?: ApplicationStatusDb;
          created_at?: string;
          updated_at?: string | null;
        },
        {
          id?: string;
          user_id?: string;
          company_name?: string;
          job_title?: string;
          job_url?: string | null;
          job_description?: string | null;
          status?: ApplicationStatusDb;
          created_at?: string;
          updated_at?: string | null;
        }
      >;
      generated_resumes: BaseTable<
        {
          id: string;
          application_id: string;
          user_id: string;
          content: string;
          created_at: string;
        },
        {
          id?: string;
          application_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        },
        {
          id?: string;
          application_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        }
      >;
      generated_cover_letters: BaseTable<
        {
          id: string;
          application_id: string;
          user_id: string;
          content: string;
          created_at: string;
        },
        {
          id?: string;
          application_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        },
        {
          id?: string;
          application_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        }
      >;
      user_subscriptions: BaseTable<
        {
          user_id: string;
          plan: "free" | "pro";
          stripe_customer_id: string | null;
          status: string;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          updated_at: string;
        },
        {
          user_id: string;
          plan?: "free" | "pro";
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        },
        {
          user_id?: string;
          plan?: "free" | "pro";
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        }
      >;
      user_work_experiences: BaseTable<
        {
          id: string;
          user_id: string;
          location: string | null;
          start_date: string | null;
          end_date: string | null;
          currently_working: boolean;
          description: string | null;
          created_at: string;
          company: string | null;
          title: string | null;
          employment_type: string | null;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          location?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          currently_working?: boolean;
          description?: string | null;
          created_at?: string;
          company?: string | null;
          title?: string | null;
          employment_type?: string | null;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          location?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          currently_working?: boolean;
          description?: string | null;
          created_at?: string;
          company?: string | null;
          title?: string | null;
          employment_type?: string | null;
          updated_at?: string;
        }
      >;
      user_educations: BaseTable<
        {
          id: string;
          user_id: string;
          degree: string | null;
          field_of_study: string | null;
          start_date: string | null;
          end_date: string | null;
          gpa: number | null;
          description: string | null;
          created_at: string;
          school: string | null;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          degree?: string | null;
          field_of_study?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          gpa?: number | null;
          description?: string | null;
          created_at?: string;
          school?: string | null;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          degree?: string | null;
          field_of_study?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          gpa?: number | null;
          description?: string | null;
          created_at?: string;
          school?: string | null;
          updated_at?: string;
        }
      >;
      user_disclosure: BaseTable<
        {
          id: string;
          user_id: string;
          authorized_to_work: boolean | null;
          willing_to_relocate: boolean | null;
          gender: string | null;
          ethnicity: string | null;
          veteran_status: string | null;
          disability_status: string | null;
          created_at: string;
          require_sponsorship: boolean | null;
        },
        {
          id?: string;
          user_id: string;
          authorized_to_work?: boolean | null;
          willing_to_relocate?: boolean | null;
          gender?: string | null;
          ethnicity?: string | null;
          veteran_status?: string | null;
          disability_status?: string | null;
          created_at?: string;
          require_sponsorship?: boolean | null;
        },
        {
          id?: string;
          user_id?: string;
          authorized_to_work?: boolean | null;
          willing_to_relocate?: boolean | null;
          gender?: string | null;
          ethnicity?: string | null;
          veteran_status?: string | null;
          disability_status?: string | null;
          created_at?: string;
          require_sponsorship?: boolean | null;
        }
      >;
      user_links: BaseTable<
        {
          id: string;
          user_id: string;
          url: string;
          created_at: string;
          updated_at: string;
          link_type: string | null;
        },
        {
          id?: string;
          user_id: string;
          url: string;
          created_at?: string;
          updated_at?: string;
          link_type?: string | null;
        },
        {
          id?: string;
          user_id?: string;
          url?: string;
          created_at?: string;
          updated_at?: string;
          link_type?: string | null;
        }
      >;
      user_additional_info: BaseTable<
        {
          id: string;
          user_id: string;
          languages: string | null;
          certifications: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          languages?: string | null;
          certifications?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          languages?: string | null;
          certifications?: string | null;
          created_at?: string;
        }
      >;
      user_skills: BaseTable<
        {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          is_from_org_resume: boolean | null;
        },
        {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          is_from_org_resume?: boolean | null;
        },
        {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          is_from_org_resume?: boolean | null;
        }
      >;
      users: BaseTable<
        {
          id: string;
          email: string | null;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          province: string | null;
          country: string | null;
          postal_code: string | null;
          expected_salary: number | null;
          summary: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          email?: string | null;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          province?: string | null;
          country?: string | null;
          postal_code?: string | null;
          expected_salary?: number | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          province?: string | null;
          country?: string | null;
          postal_code?: string | null;
          expected_salary?: number | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      application_history: BaseTable<
        {
          id: string;
          user_id: string;
          job_title: string | null;
          company: string | null;
          match_score: number | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          job_title?: string | null;
          company?: string | null;
          match_score?: number | null;
          created_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          job_title?: string | null;
          company?: string | null;
          match_score?: number | null;
          created_at?: string;
        }
      >;
      score_history: BaseTable<
        {
          id: string;
          user_id: string;
          score: number;
          source: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          score: number;
          source?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          score?: number;
          source?: string | null;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ApplicationRow =
  Database["public"]["Tables"]["applications"]["Row"];
export type ResumeRow = Database["public"]["Tables"]["resumes"]["Row"];
export type GeneratedResumeRow =
  Database["public"]["Tables"]["generated_resumes"]["Row"];
export type GeneratedCoverLetterRow =
  Database["public"]["Tables"]["generated_cover_letters"]["Row"];

export type ApplicationWithDocuments = ApplicationRow & {
  generated_resume_id: string | null;
  generated_cover_letter_id: string | null;
};

export type UserProfileRow = Database["public"]["Tables"]["users"]["Row"];
export type SubscriptionRow =
  Database["public"]["Tables"]["user_subscriptions"]["Row"];
export type UserWorkExperienceRow =
  Database["public"]["Tables"]["user_work_experiences"]["Row"];
export type UserEducationRow =
  Database["public"]["Tables"]["user_educations"]["Row"];
export type UserDisclosureRow =
  Database["public"]["Tables"]["user_disclosure"]["Row"];
export type UserLinkRow = Database["public"]["Tables"]["user_links"]["Row"];
export type UserAdditionalInfoRow =
  Database["public"]["Tables"]["user_additional_info"]["Row"];
export type UserSkillRow = Database["public"]["Tables"]["user_skills"]["Row"];
