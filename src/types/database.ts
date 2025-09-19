export interface District {
  district: string;
  state: string;
  learning_centres_count: number;
}

export interface Facilitator {
  id: string;
  name: string;
  contact_number: string;
  email?: string;
  start_date?: string;
  end_date?: string;
  alias?: string[];
}

export interface PartnerOrganisation {
  id: string;
  name: string;
  url?: string;
  contact?: string;
}

export interface LearningCentre {
  id: string;
  centre_name: string;
  area: string;
  city: string;
  district: string;
  state: string;
  country: string;
  start_date: string;
  end_date: string;
  created_at: string;
  facilitators: Facilitator[];
  partner_organisations: PartnerOrganisation[];
}

export interface GeneratedReport {
  id: string;
  facilitator_id: string;
  learning_centre_id: string;
  month: number;
  year: number;
  created_at: string;
  facilitator_name: string;
  learning_centre_name: string;
  images_count: number;
  messages_count: number;
  has_llm_analysis: boolean;
  month_year_display: string;
}