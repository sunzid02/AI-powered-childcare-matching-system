import { api } from "./client";
import type {
  ChildminderAvailability,
  ChildminderDetail,
} from "../types/childminder";

export const getChildminderById = async (
  id: number
): Promise<ChildminderDetail> => {
  const response = await api.get<ChildminderDetail>(`/childminders/${id}`);
  return response.data;
};


export const getChildminderAvailability = async (
  id: number
): Promise<ChildminderAvailability[]> => {
  const response = await api.get<ChildminderAvailability[]>(
    `/childminders/${id}/availability`
  );
  return response.data;
};