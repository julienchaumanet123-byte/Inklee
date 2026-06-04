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
  plan_tier: PlanTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

type ClientRow = {
  id: string;
  studio_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      specialty: Specialty;
      appointment_status: AppointmentStatus;
      plan_tier: PlanTier;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
