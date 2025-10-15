export interface District {
  district: string;
  state: string;
  learning_centres_count: number;
}

export interface DistrictPartnerOrganisation {
  id: string;
  district: string;
  state: string;
  partner_organisation_id: string;
  created_at: string;
  updated_at: string;
}

export interface DistrictWithPartnerOrganisations {
  district: string;
  state: string;
  partner_organisations: PartnerOrganisation[];
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
  logo_url?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LearningCentreVolunteer {
  id: string;
  learning_centre_id: string;
  volunteer_id: string;
  created_at: string;
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
  volunteers?: Volunteer[];
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

export interface ComprehensiveReport {
  id: string;
  facilitator_id: string;
  learning_centre_id: string;
  month: number;
  year: number;
  images_count: number;
  messages_count: number;
  has_llm_analysis: boolean;
  created_at: string;
  updated_at: string;
  facilitator_name: string;
  facilitator_contact: string;
  facilitator_email?: string;
  learning_centre_name: string;
  learning_centre_area: string;
  learning_centre_city: string;
  learning_centre_district: string;
  learning_centre_state: string;
  learning_centre_country: string;
  month_year_display: string;
  sortable_date: string;
  actual_images_count: number;
  actual_messages_count: number;
  has_actual_llm_analysis: boolean;
}