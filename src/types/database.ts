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

export interface Coordinator {
  id: string;
  name: string;
  contact?: string;
  created_at: string;
  updated_at: string;
}

export interface CoordinatorFieldNote {
  id: string;
  coordinator_id: string;
  learning_centre_id: string;
  note_text: string;
  noted_at: string;
  created_at: string;
}

export interface Child {
  id: string;
  learning_centre_id: string;
  alias?: string[];
  created_at: string;
  updated_at: string;
}

export interface ChildFieldNoteLink {
  id: string;
  child_id: string;
  field_note_id?: string | null;
  coordinator_field_note_id?: string | null;
  created_at: string;
}

export interface FieldImage {
  id: string;
  learning_centre_id: string;
  facilitator_id?: string | null;
  photo_url: string;
  caption?: string;
  sent_at?: string;
  created_at: string;
}

export interface FieldNote {
  id: string;
  learning_centre_id: string;
  facilitator_id?: string | null;
  text: string;
  sent_at?: string;
  created_at: string;
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
  children?: Child[];
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
  has_llm_analysis: boolean;
  month_year_display: string;
}

export interface ComprehensiveReport {
  id: string;
  facilitator_id: string;
  learning_centre_id: string;
  month: number;
  year: number;
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
