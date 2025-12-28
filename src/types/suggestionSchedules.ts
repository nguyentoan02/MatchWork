import { BaseAPIResponse } from "./response";

export interface SSchedulesBody {
   title: string;
   TRId: string;
   schedules: {
      start: Date;
      end: Date;
   }[];
}

export interface SSchedulesResponse extends BaseAPIResponse {
   data: {
      _id: string;
      tutorId: string;
      teachingRequestId: string;
      title: string;
      schedules: {
         start: Date;
         end: Date;
      }[];
   };
}
