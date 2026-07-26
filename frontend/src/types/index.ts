export interface CollegeBranch {
  id?: number;
  name: string;
  city: string;
  stream: string;
  acpc_code?: string;
  annual_fees?: number;
  is_main_campus?: boolean;
}

export interface College {
  id: number;
  code?: string;
  acpc_code?: string;
  acronyms?: string[];
  name: string;
  city?: string;
  district?: string;
  college_type?: string;
  primary_stream?: string;
  ownership?: string;
  university_affiliation?: string;
  is_polytechnic?: boolean;
  naac_grade?: string;
  nirf_rank?: number;
  established_year?: number;
  address?: string;
  image_url?: string;
  branches?: CollegeBranch[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface Course {
  id: number;
  course_name: string;
  degree_type?: string;
  stream_category?: string;
  duration?: string;
  annual_fees?: number;
  total_seats?: number;
  eligibility?: string;
  cutoff_rank_open?: number;
  cutoff_rank_sebc?: number;
  cutoff_rank_sc?: number;
  cutoff_rank_st?: number;
  cutoff_rank_ews?: number;
}

export interface Placement {
  id: number;
  average_package?: number;
  highest_package?: number;
  placement_percentage?: number;
  top_recruiters?: string;
  placement_details?: string;
}

export interface Facility {
  id: number;
  hostel: boolean;
  library: boolean;
  wifi: boolean;
  sports: boolean;
  transport: boolean;
  cafeteria: boolean;
  medical: boolean;
  gym: boolean;
  facility_details?: string;
}

export interface Event {
  id: number;
  tech_fest?: string;
  cultural_fest?: string;
  hackathons?: string;
  workshops?: string;
  event_details?: string;
}

export interface Admission {
  id: number;
  admission_process?: string;
  entrance_exams?: string;
  cutoff_details?: string;
  cutoff_open?: number;
  cutoff_sebc?: number;
  cutoff_sc?: number;
  cutoff_st?: number;
  cutoff_ews?: number;
  admission_contact?: string;
}

export interface AcpcCutoffItem {
  course_name: string;
  category: string;
  round_number: string;
  opening_rank?: number;
  closing_rank?: number;
}

export interface AcpcCutoffYear {
  academic_year: number;
  is_pending: boolean;
  status_message?: string;
  cutoffs: AcpcCutoffItem[];
}

export interface CollegeDetailResponse {
  college: College;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  established_year?: number;
  affiliation?: string;
  university_affiliation?: string;
  is_polytechnic?: boolean;
  naac_grade?: string;
  latitude?: number;
  longitude?: number;
  courses: Course[];
  placements?: Placement;
  facilities?: Facility;
  events?: Event;
  admissions?: Admission;
  branches?: CollegeBranch[];
  multi_year_cutoffs?: AcpcCutoffYear[];
}

export interface CompareResponse {
  colleges: CollegeDetailResponse[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  intent?: string;
  college?: string;
}

export interface ChatSession {
  sessionId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  detected_college?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  intent?: string;
  college?: string;
  session_id?: string;
}

export interface ChatHistoryLog {
  id: string;
  session_id?: string;
  user_query: string;
  chatbot_response: string;
  detected_college?: string;
  detected_intent?: string;
  created_at?: string;
}
