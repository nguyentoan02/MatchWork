import { createSuggestion, getSuggestion } from "@/api/suggestionSchedules";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "./useToast";

export const useSSchedules = (TRid: string) => {
   const addToast = useToast();
   const createSSchedules = useMutation({
      mutationFn: createSuggestion,
      onSuccess: (res) => {
         addToast("success", "tạo thành công");
         console.log(res);
      },
      onError: (err: any) => {
         addToast("error", err.response.data.message || "không thể lưu lịch đề xuất");
         console.log(err);
      },
   });

   const fetchSSchedules = useQuery({
      queryFn: () => getSuggestion(TRid!),
      queryKey: ["SUGGESTION", TRid],
   });

   return { createSSchedules, fetchSSchedules };
};
