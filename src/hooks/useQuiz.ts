import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
   createFlashCardQuiz,
   editFlashcardQuestion,
   fetchFlashcardQuestions,
   fetchFlashCardQuiz,
} from "@/api/quiz";
import { IQuizResponse } from "@/types/quiz";
import { IQuizQuestionResponse } from "@/types/quizQuestion";

export const useCreateQuiz = () => {
   const addToast = useToast();
   return useMutation({
      mutationFn: createFlashCardQuiz,
      onSuccess: (response) => addToast("success", response.message),
      onError: (error: any) =>
         addToast(
            "error",
            error?.response?.message ?? error?.message ?? "Tạo quiz thất bại"
         ),
   });
};

export const useFetchQuizByTutor = () => {
   return useQuery<IQuizResponse>({
      queryKey: ["TUTORFLASHCARDQUIZS"],
      queryFn: fetchFlashCardQuiz,
   });
};

export const useFetchFlashcardQuestions = (quizId: string) => {
   return useQuery<IQuizQuestionResponse>({
      queryKey: ["FLASHCARDQUIZ", quizId],
      queryFn: () => fetchFlashcardQuestions(quizId),
   });
};

export const useUpdateFlashcard = () => {
   const queryClient = useQueryClient();

   const addToast = useToast();
   return useMutation({
      mutationFn: editFlashcardQuestion,
      onSuccess: (response) => {
         queryClient.invalidateQueries({ queryKey: ["FLASHCARDQUIZ"] });
         addToast("success", response.message);
      },
      onError: (error: any) => {
         console.log(error);
         addToast("error", error?.response?.data.message);
      },
   });
};
