import { api } from "./client";
import type { AnalyticsOverview } from "../types/analytics";

export const getAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const response = await api.get<AnalyticsOverview>("/analytics/overview");
  return response.data;
};