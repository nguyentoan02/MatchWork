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
      onError: (err) => {
         addToast("error", "some thing went wrong");
         console.log(err);
      },
   });

   const fetchSSchedules = useQuery({
      queryFn: () => getSuggestion(TRid!),
      queryKey: ["SUGGESTION", TRid],
   });

   return { createSSchedules, fetchSSchedules };
};
