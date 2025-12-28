import { create } from "zustand";
import { SSchedulesBody } from "../types/suggestionSchedules";

export interface CalendarEventItem {
   start: Date;
   end: Date;
   isBusy?: boolean;
   title?: string;
}

type CalendarEventChangeType = "drop" | "resize" | "selectEvent" | "selectSlot";

interface CalendarEventChange {
   type: CalendarEventChangeType;
   sessionId?: string;
   startTime: string;
   endTime: string;
}

interface CalendarEventState {
   events: CalendarEventItem[];
   title: string;
   teachingRequestId: string;
   lastChange?: CalendarEventChange;
   setEvents: (events: CalendarEventItem[]) => void;
   addEvent: (event: CalendarEventItem) => void;
   updateEventTime: (start: Date, end: Date) => void;
   setChange: (change: CalendarEventChange) => void;
   getEvents: () => SSchedulesBody;
   setTitle: (title: string) => void;
   getTitle: () => string;
   setTeachingRequestId: (tlId: string) => void;
   reset: () => void;
}

export const useCalendarEventStore = create<CalendarEventState>((set, get) => ({
   events: [],
   title: "lịch đề xuất",
   teachingRequestId: "",
   lastChange: undefined,
   setEvents: (events) =>
      set((state) => ({
         events: events.map((evt) => ({ ...evt, title: state.title })),
      })),
   addEvent: (event) =>
      set((state) => ({
         events: [...state.events, { ...event, title: state.title }],
      })),
   updateEventTime: (start, end) =>
      set((state) => ({
         events: state.events.map((evt) => {
            return { ...evt, start, end };
         }),
      })),
   setChange: (change) => set({ lastChange: change }),
   setTeachingRequestId: (teachingRequestId) => set({ teachingRequestId }),
   getEvents: () => {
      const currentEvent = get().events;
      const payload = {
         TRId: get().teachingRequestId,
         title: get().title,
         schedules: [
            ...currentEvent.map((e) => {
               return { start: e.start, end: e.end };
            }),
         ],
      };
      return payload;
   },
   setTitle: (title) => {
      set((state) => ({
         title,
         events: state.events.map((evt) => ({ ...evt, title })),
      }));
   },
   getTitle: () => get().title,
   reset: () => set({ lastChange: undefined }),
}));
