import { api } from "./client";
import type { MatchResultsResponse } from "../types/match";

export const getMatchesByRequest = async (
  requestId: number
): Promise<MatchResultsResponse> => {
  const response = await api.get<MatchResultsResponse>(`/matches/${requestId}`);
  return response.data;
};