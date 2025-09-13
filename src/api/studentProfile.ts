import apiClient from "@/lib/api";
import { Student } from "@/types/student";

export const fetchStudentProfile = async (): Promise<Student> => {
   const response = await apiClient("/studentProfile/readStudentProfile");
   return response.data?.data?.student;
};

export const updateStudentProfile = async (
   data: FormData
): Promise<Student> => {
   const response = await apiClient.put(
      "/studentProfile/updateStudentProfile",
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
   );
   return response.data?.data?.student;
};

export const createStudentProfile = async (
   data: FormData
): Promise<Student> => {
   const response = await apiClient.post(
      "/studentProfile/createProfile",
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
   );
   return response.data?.data?.student;
};
