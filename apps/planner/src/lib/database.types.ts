// Hand-written to match supabase/migrations/0001_init.sql.
// (supabase gen types requires `supabase login` even with --db-url on this CLI version.)

export type CityKey =
  | 'riyadh' | 'jeddah' | 'makkah' | 'madinah' | 'dammam' | 'khobar'
  | 'dhahran' | 'taif' | 'tabuk' | 'abha' | 'al_ahsa' | 'buraidah' | 'yanbu';

export type EventCategory = 'weddings' | 'birthdays' | 'engagements' | 'corporate' | 'galas';
export type BudgetRange = 'under10' | '10to20' | '20to35' | 'over35';
export type PackageTier = 'essentials' | 'signature' | 'luxury';
export type RequestStatus = 'open' | 'matched' | 'closed' | 'cancelled';
export type OfferStatus = 'pending' | 'viewed' | 'accepted' | 'declined' | 'withdrawn';
export type DealStatus =
  | 'request' | 'offer_sent' | 'accepted' | 'countersigned'
  | 'deposit_paid' | 'completed' | 'reviewed' | 'declined' | 'cancelled';
export type PaymentType = 'deposit' | 'balance';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type BookingStage = 'planning' | 'design' | 'awaiting_deposit' | 'final_walkthrough' | 'completed';
export type UserRole = 'customer' | 'planner';
export type AppLanguage = 'en' | 'ar';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          language: AppLanguage;
          city: CityKey | null;
          avatar_seed: number;
          expo_push_token: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; role: UserRole; full_name: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      planners: {
        Row: {
          user_id: string;
          business_name: string;
          bio: string | null;
          city: CityKey;
          categories: EventCategory[];
          verified: boolean;
          tier: string;
          rating: number;
          reviews_count: number;
          instagram: string | null;
          website: string | null;
          years_in_business: string | null;
          team_size: string | null;
          budget_tier: string | null;
          starting_price: number | null;
          cr_number: string | null;
          portfolio_urls: string[];
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['planners']['Row']> & { user_id: string; business_name: string; city: CityKey };
        Update: Partial<Database['public']['Tables']['planners']['Row']>;
        Relationships: [];
      };
      planner_services: {
        Row: {
          id: string;
          planner_id: string;
          name: string;
          description: string | null;
          from_price: number;
          seed: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['planner_services']['Row']> & { planner_id: string; name: string; from_price: number };
        Update: Partial<Database['public']['Tables']['planner_services']['Row']>;
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          customer_id: string;
          category: EventCategory;
          city: CityKey;
          event_date: string;
          guests: number;
          budget: BudgetRange;
          note: string | null;
          status: RequestStatus;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['requests']['Row']> & {
          customer_id: string; category: EventCategory; city: CityKey; event_date: string; guests: number; budget: BudgetRange;
        };
        Update: Partial<Database['public']['Tables']['requests']['Row']>;
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          request_id: string;
          planner_id: string;
          package: PackageTier;
          price: number;
          message: string | null;
          status: OfferStatus;
          deal_status: DealStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['offers']['Row']> & {
          request_id: string; planner_id: string; package: PackageTier; price: number;
        };
        Update: Partial<Database['public']['Tables']['offers']['Row']>;
        Relationships: [];
      };
      contracts: {
        Row: {
          id: string;
          offer_id: string;
          ref: string;
          signed_by_customer_at: string | null;
          signed_by_planner_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['contracts']['Row']> & { offer_id: string; ref: string };
        Update: Partial<Database['public']['Tables']['contracts']['Row']>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          contract_id: string;
          type: PaymentType;
          amount: number;
          status: PaymentStatus;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & { contract_id: string; type: PaymentType; amount: number };
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          contract_id: string;
          stage: BookingStage;
          event_date: string;
          platform_fee: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['bookings']['Row']> & { contract_id: string; event_date: string };
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reviews']['Row']> & { booking_id: string; customer_id: string; rating: number };
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          request_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & { request_id: string; sender_id: string; body: string };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Record<string, unknown>;
          read: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & { user_id: string; type: string };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
        Relationships: [];
      };
      planner_blocked_dates: {
        Row: {
          id: string;
          planner_id: string;
          date: string;
          label: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['planner_blocked_dates']['Row']> & { planner_id: string; date: string };
        Update: Partial<Database['public']['Tables']['planner_blocked_dates']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
