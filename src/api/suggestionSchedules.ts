import apiClient from "@/lib/api";
import {
   SSchedulesBody,
   SSchedulesResponse,
} from "@/types/suggestionSchedules";

export const createSuggestion = async (
   payload: SSchedulesBody
): Promise<SSchedulesResponse> => {
   const response = await apiClient.post(
      "/suggestionSchedules/create",
      payload
   );

   return response.data;
};

export const getSuggestion = async (
   TRid: string
): Promise<SSchedulesResponse> => {
   const response = await apiClient.get(`/suggestionSchedules/${TRid}/get`);
   return response.data;
};
