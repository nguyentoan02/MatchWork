import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SSchedulesBody } from "../types/suggestionSchedules";
import { Session } from "@/types/session";

export interface CalendarEventItem {
   start: Date;
   end: Date;
   resource: Session | any;
   isBusy?: boolean;
   title?: string;
}

type CalendarEventChangeType =
   | "drop"
   | "resize"
   | "selectEvent"
   | "selectSlot"
   | "delete";

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
   updateEventTime: (id: string, start: Date, end: Date) => void;
   setChange: (change: CalendarEventChange) => void;
   getEvents: () => SSchedulesBody;
   setTitle: (title: string) => void;
   getTitle: () => string;
   isChaging: () => boolean;
   setTeachingRequestId: (tlId: string) => void;
   reset: () => void;
   removeEvent: (id: string) => void;
}

export const useCalendarEventStore = create<CalendarEventState>()(
   devtools((set, get) => ({
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
      removeEvent: (id) =>
         set((state) => ({
            events: state.events.filter((evt) => {
               const evtId =
                  (evt as any)?.resource?._id ??
                  (evt as any)?.id ??
                  (evt as any)?._id;
               return evtId !== id;
            }),
         })),
      updateEventTime: (id: string, start: Date, end: Date) =>
         set((state) => ({
            events: state.events.map((evt) => {
               const evtId =
                  (evt as any)?.resource?._id ??
                  (evt as any)?.id ??
                  (evt as any)?._id;
               return evtId === id ? { ...evt, start, end } : evt;
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
      isChaging: () => {
         return Boolean(get().lastChange);
      },
      reset: () => set({ lastChange: undefined, events: [] }),
   }))
);
