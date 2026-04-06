import { api } from "./client";
import type {
  ChildcareRequest,
  RequestStatus,
  SelectChildminderPayload,
  UpdateRequestStatusPayload,
} from "../types/request";

export async function getRequests(status?: RequestStatus) {
  const response = await api.get<ChildcareRequest[]>("/requests", {
    params: status ? { status } : undefined,
  });

  return response.data;
}

export async function updateRequestStatus(
  requestId: number,
  payload: UpdateRequestStatusPayload
) {
  const response = await api.patch<ChildcareRequest>(
    `/requests/${requestId}/status`,
    payload
  );

  return response.data;
}

export async function selectChildminderForRequest(
  requestId: number,
  payload: SelectChildminderPayload
) {
  const response = await api.patch<ChildcareRequest>(
    `/requests/${requestId}/select-childminder`,
    payload
  );

  return response.data;
}