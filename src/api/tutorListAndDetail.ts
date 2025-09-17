import apiClient from "@/lib/api";
import { TutorsApiResponse, Tutor } from "@/types/Tutor";

interface GetTutorsParams {
   page?: number;
   limit?: number;
}

/**
 * Fetches a paginated list of approved tutors from the API.
 * @returns payload shaped as { data: Tutor[], pagination: {...} }
 */
export const getTutors = async (
   params: GetTutorsParams = {}
): Promise<TutorsApiResponse> => {
   const { page = 1, limit = 6 } = params;
   const response = await apiClient.get("/tutor", {
      params: { page, limit },
   });

   // backend sometimes nests data differently; normalize:
   // possible shapes:
   // 1) response.data.data -> { data: [...], pagination: {...} }
   // 2) response.data -> { data: [...], pagination: {...} }
   const payload = response.data?.data ?? response.data;
   return payload?.data ? payload : payload; // keep as-is; caller expects TutorsApiResponse
};

/**
 * Fetch single tutor by id
 * Normalizes several possible backend shapes.
 */
export const getTutorById = async (id: string): Promise<Tutor> => {
   const response = await apiClient.get(`/tutor/${id}`);

   // Try multiple locations for the tutor object
   // examples: response.data.data (metadata: tutor) OR response.data.data.metadata OR response.data.data
   const d = response.data ?? {};
   const candidate =
      d.data?.metadata ?? d.data?.data ?? d.data ?? d.metadata ?? d; // fallback

   // If payload wrapped under .data again, take it
   return candidate?.data ?? candidate;
};

export default {
   getTutors,
   getTutorById,
};
