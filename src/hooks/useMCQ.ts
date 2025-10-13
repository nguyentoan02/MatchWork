import {
   createMCQ,
   fetchMCQById,
   fetchMCQList,
} from "@/api/multipleChoiceQuiz";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { MCQResponse } from "@/types/quiz";
import { IQuizQuestionResponse } from "@/types/quizQuestion";

export const useMCQ = (quizId?: string) => {
   const addToast = useToast();
   const create = useMutation({
      mutationFn: createMCQ,
      onSuccess: (response) => addToast("success", response.message),
      onError: (error: any) => {
         addToast(
            "error",
            error?.response?.data.message || "Error creating MCQ"
         );
         console.log("Error creating MCQ:", error);
      },
   });

   const fetchList = useQuery<MCQResponse>({
      queryKey: ["MCQLIST"],
      queryFn: () => fetchMCQList(),
   });

   const fetchMCQByQuizId = useQuery<IQuizQuestionResponse>({
      queryKey: ["MCQBYID", quizId],
      queryFn: () => fetchMCQById(quizId!),
      enabled: !!quizId,
   });

   return { create, fetchList, fetchMCQByQuizId };
};
