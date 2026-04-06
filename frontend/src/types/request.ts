export type RequestStatus = "pending" | "approved" | "rejected";

export type ChildcareRequest = {
  id: number;
  parent_id: number;
  child_id: number;
  requested_weekdays: string;
  requested_start_time: string;
  requested_end_time: string;
  requested_location_zone: string;
  needs_special_support: boolean;
  status: RequestStatus;
  selected_childminder_id: number | null;
    selected_childminder_name: string | null;

  selected_match_score: number | null;
  created_at: string;
};

export type UpdateRequestStatusPayload = {
  status: RequestStatus;
};

export type SelectChildminderPayload = {
  selected_childminder_id: number;
  selected_match_score: number;
};