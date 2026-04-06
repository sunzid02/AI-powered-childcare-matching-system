export type RequestCreatePayload = {
  parent_id: number;
  child_id: number;
  requested_weekdays: string[];
  requested_start_time: string;
  requested_end_time: string;
  requested_location_zone: string;
  needs_special_support: boolean;
};