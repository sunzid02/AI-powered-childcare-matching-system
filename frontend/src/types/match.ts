export interface MatchScore {
  location_score: number
  time_score: number
  cluster_score: number
  vector_score: number
  final_score: number
}

export interface Childminder {
  id: number
  name: string
  latitude: number
  longitude: number
  experience_years: number
}

export interface Match {
  id: number
  request_id: number
  childminder: Childminder
  score: MatchScore
  explanation: string
}


export interface MatchResultItem {
  childminder_id: number;
  childminder_name: string;
  location_score: number;
  time_score: number;
  cluster_score: number;
  vector_score: number;
  final_score: number;
  rank_position: number;
  explanation: string;
}

export interface MatchResultsResponse {
  request_id: number;
  generated_at: string;
  results: MatchResultItem[];
}