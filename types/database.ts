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
  active?: boolean;
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
  sanitized_text?: string | null;
  is_visible: boolean;
  ai_commentary?: string | null;
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
  status: 'active' | 'inactive';
  status_description?: string;
  created_at: string;
  volunteers?: Volunteer[];
  facilitators: Facilitator[];
  partner_organisations: PartnerOrganisation[];
}

export interface Activity {
  id: string;
  name: string;
  materials_required?: string;
  objective?: string;
  how_to_play?: string;
  outcome?: string;
  facilitator_constraint: number;
  space_constraint: number;
  repeat_constraint: number;
  material_constraint: number;
  knowledge_constraint: number;
  exposure_to_new_topics: number;
  category?: string;
  tags?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string
  song_number: number
  title: string
  title_en: string
  lyrics: string
  author?: string
  pedagogical_purpose?: string
  notes?: string
  created_at: string
}

export interface ScienceExperiment {
  id: string
  experiment_number: number
  title: string
  materials: string
  steps: string
  result: string
  learning_outcome: string
  category?: string
  created_at: string
}

export interface ReadingListItem {
  id: string
  title: string
  author: string
  type: 'book' | 'article' | 'paper'
  description: string
  apa_citation?: string
  created_at: string
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  author_name?: string;
  author_id?: string;
  is_published: boolean;
  published_at?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}
