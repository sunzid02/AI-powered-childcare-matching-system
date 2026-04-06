export type ChildminderAvailability = {
  id: number;
  childminder_id: number;
  weekday: string;
  start_time: string;
  end_time: string;
  available_slots: number;
};

export type ChildminderDetail = {
  id: number;
  full_name: string;
  email: string;
  location_zone: string;
  latitude: number;
  longitude: number;
  max_capacity: number;
  current_capacity: number;
  earliest_start_time: string;
  latest_end_time: string;
  supports_special_needs: boolean;
  years_experience: number;
  tags?: string | null;
  profile_summary?: string | null;
  cluster_label?: string | null;
  availabilities: ChildminderAvailability[];
};