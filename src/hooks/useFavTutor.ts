import {
   deleteFavoriteTutor,
   favoriteTutor,
   fetchFavoriteTutor,
} from "@/api/favTutor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { FavoriteTutor } from "@/types/favoriteTutor";

export const useAddFav = () => {
   const toast = useToast();
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: favoriteTutor,
      onSuccess: (response) => {
         toast("success", response.message);
         queryClient.invalidateQueries({ queryKey: ["TUTORFAV"] });
      },
      onError: (error) => {
         console.log(error);
         const errMsg =
            (error as any)?.response?.data?.message ||
            (error as Error).message ||
            "Đã xảy ra lỗi";
         toast("error", errMsg);
      },
   });
};

export const useFetchFav = (tutorId: string) => {
   return useQuery<FavoriteTutor>({
      queryKey: ["TUTORFAV"],
      queryFn: () => fetchFavoriteTutor(tutorId),
   });
};

export const useRemoveFav = () => {
   const toats = useToast();
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: deleteFavoriteTutor,
      onSuccess: (response) => {
         queryClient.invalidateQueries({ queryKey: ["TUTORFAV"] });
         toats("success", response.message);
      },
      onError: (error) => {
         const errMsg =
            (error as any)?.response?.data?.message ||
            (error as Error).message ||
            "Đã xảy ra lỗi";
         toats("error", errMsg);
      },
   });
};
