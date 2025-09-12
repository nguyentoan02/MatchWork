import {
    fetchStudentProfile,
    updateStudentProfile,
} from "@/api/studentProfile";
import { Student } from "@/types/student";
import { useMutation, useQuery } from "@tanstack/react-query";

// export const useFetchStudentProfile = () => {
//     const {
//         data: studentProfile,
//         isLoading,
//         isError,
//         error,
//     } = useQuery({
//         queryKey: ["studentProfile"],
//         queryFn: fetchStudentProfile,
//     });

//     return { studentProfile, isLoading, isError, error };
// };

export const useFetchStudentProfile = () => {
    return useQuery<Student>({
        queryKey: ["studentProfile"],
        queryFn: fetchStudentProfile,
    });
};

// Cập nhật profile
export const useUpdateStudentProfile = () => {
    return useMutation({
        mutationFn: updateStudentProfile,
    });
};
