// Types DB pour @supabase/supabase-js.
// À régénérer avec: npx supabase gen types typescript --project-id <ref> > src/types/database.ts
// Stub manuel pour le MVP.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Specialty = "tattoo" | "piercing" | "both";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type PlanTier = "starter" | "pro" | "studio";
export type MessageSender = "client" | "studio";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type StudioRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  specialty: Specialty;
  city: string | null;
  bio: string | null;
  logo_url: string | null;
  cover_url: string | null;
  deposit_amount: number;
  deposit_required: boolean;
  trial_ends_at: string;
  plan_tier: PlanTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_details_submitted: boolean;
  instagram_handle: string | null;
  website_url: string | null;
  phone: string | null;
  address: string | null;
  opening_hours: Json;
  appointment_duration_min: number;
  booking_horizon_days: number;
  booking_min_lead_hours: number;
  created_at: string;
  updated_at: string;
};

type AvailabilityRuleRow = {
  id: string;
  studio_id: string;
  day_of_week: number;
  is_open: boolean;
  ranges: Json;
  created_at: string;
  updated_at: string;
};

type AvailabilityExceptionRow = {
  id: string;
  studio_id: string;
  date: string;
  is_closed: boolean;
  ranges: Json | null;
  reason: string | null;
  created_at: string;
};

type ClientRow = {
  id: string;
  studio_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  auth_user_id: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  studio_id: string;
  client_id: string;
  sender: MessageSender;
  body: string;
  attachments: Json;
  read_at: string | null;
  created_at: string;
};

type AppointmentRow = {
  id: string;
  studio_id: string;
  client_id: string;
  project_description: string | null;
  reference_image_url: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  deposit_paid: boolean;
  deposit_amount: number;
  stripe_payment_intent_id: string | null;
  reminder_sent_at: string | null;
  parent_project_id: string | null;
  session_index: number;
  created_at: string;
  updated_at: string;
};

type ConsentRow = {
  id: string;
  appointment_id: string;
  pdf_url: string | null;
  signed_at: string | null;
  medical_info: Json;
  created_at: string;
};

type PortfolioImageRow = {
  id: string;
  studio_id: string;
  image_url: string;
  storage_path: string;
  caption: string | null;
  position: number;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Pick<ProfileRow, "id" | "email"> &
          Partial<Omit<ProfileRow, "id" | "email">>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      studios: {
        Row: StudioRow;
        Insert: Pick<StudioRow, "owner_id" | "name" | "slug" | "specialty"> &
          Partial<Omit<StudioRow, "owner_id" | "name" | "slug" | "specialty">>;
        Update: Partial<StudioRow>;
        Relationships: [
          {
            foreignKeyName: "studios_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: ClientRow;
        Insert: Pick<ClientRow, "studio_id" | "first_name" | "last_name" | "email"> &
          Partial<Omit<ClientRow, "studio_id" | "first_name" | "last_name" | "email">>;
        Update: Partial<ClientRow>;
        Relationships: [
          {
            foreignKeyName: "clients_studio_id_fkey";
            columns: ["studio_id"];
            isOneToOne: false;
            referencedRelation: "studios";
            referencedColumns: ["id"];
          }
        ];
      };
      appointments: {
        Row: AppointmentRow;
        Insert: Pick<
          AppointmentRow,
          "studio_id" | "client_id" | "starts_at" | "ends_at"
        > &
          Partial<
            Omit<AppointmentRow, "studio_id" | "client_id" | "starts_at" | "ends_at">
          >;
        Update: Partial<AppointmentRow>;
        Relationships: [
          {
            foreignKeyName: "appointments_studio_id_fkey";
            columns: ["studio_id"];
            isOneToOne: false;
            referencedRelation: "studios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_parent_project_id_fkey";
            columns: ["parent_project_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          }
        ];
      };
      consents: {
        Row: ConsentRow;
        Insert: Pick<ConsentRow, "appointment_id"> &
          Partial<Omit<ConsentRow, "appointment_id">>;
        Update: Partial<ConsentRow>;
        Relationships: [
          {
            foreignKeyName: "consents_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: MessageRow;
        Insert: Pick<MessageRow, "studio_id" | "client_id" | "sender" | "body"> &
          Partial<Omit<MessageRow, "studio_id" | "client_id" | "sender" | "body">>;
        Update: Partial<MessageRow>;
        Relationships: [
          {
            foreignKeyName: "messages_studio_id_fkey";
            columns: ["studio_id"];
            isOneToOne: false;
            referencedRelation: "studios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      portfolio_images: {
        Row: PortfolioImageRow;
        Insert: Pick<PortfolioImageRow, "studio_id" | "image_url" | "storage_path"> &
          Partial<
            Omit<PortfolioImageRow, "studio_id" | "image_url" | "storage_path">
          >;
        Update: Partial<PortfolioImageRow>;
        Relationships: [
          {
            foreignKeyName: "portfolio_images_studio_id_fkey";
            columns: ["studio_id"];
            isOneToOne: false;
            referencedRelation: "studios";
            referencedColumns: ["id"];
          }
        ];
      };
      availability_rules: {
        Row: AvailabilityRuleRow;
        Insert: Pick<AvailabilityRuleRow, "studio_id" | "day_of_week"> &
          Partial<Omit<AvailabilityRuleRow, "studio_id" | "day_of_week">>;
        Update: Partial<AvailabilityRuleRow>;
        Relationships: [
          {
            foreignKeyName: "availability_rules_studio_id_fkey";
            columns: ["studio_id"];
            isOneToOne: false;
            referencedRelation: "studios";
            referencedColumns: ["id"];
          }
        ];
      };
      availability_exceptions: {
        Row: AvailabilityExceptionRow;
        Insert: Pick<AvailabilityExceptionRow, "studio_id" | "date"> &
          Partial<Omit<AvailabilityExceptionRow, "studio_id" | "date">>;
        Update: Partial<AvailabilityExceptionRow>;
        Relationships: [
          {
            foreignKeyName: "availability_exceptions_studio_id_fkey";
            columns: ["studio_id"];
            isOneToOne: false;
            referencedRelation: "studios";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_user_id_by_email: {
        Args: { p_email: string };
        Returns: string;
      };
      owns_studio: {
        Args: { p_studio_id: string };
        Returns: boolean;
      };
      is_client: {
        Args: { p_client_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      specialty: Specialty;
      appointment_status: AppointmentStatus;
      plan_tier: PlanTier;
      message_sender: MessageSender;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
