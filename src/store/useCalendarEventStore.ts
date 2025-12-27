import { create } from "zustand";

export interface CalendarEventItem {
   title?: string;
   start: Date;
   end: Date;
   resource: { _id: string };
   isBusy?: boolean;
}

type CalendarEventChangeType = "drop" | "resize" | "selectEvent" | "selectSlot";

interface CalendarEventChange {
   type: CalendarEventChangeType;
   sessionId?: string;
   startTime: string;
   endTime: string;
   dayOfWeek?: number;
}

interface CalendarEventState {
   events: CalendarEventItem[];
   lastChange?: CalendarEventChange;
   setEvents: (events: CalendarEventItem[]) => void;
   addEvent: (event: CalendarEventItem) => void;
   updateEventTime: (sessionId: string, start: Date, end: Date) => void;
   setChange: (change: CalendarEventChange) => void;
   getEvents: () => CalendarEventItem[];
   reset: () => void;
}

export const useCalendarEventStore = create<CalendarEventState>((set, get) => ({
   events: [],
   lastChange: undefined,
   setEvents: (events) => set({ events }),
   addEvent: (event) =>
      set((state) => ({
         events: [...state.events, event],
      })),
   updateEventTime: (sessionId, start, end) =>
      set((state) => ({
         events: state.events.map((evt) =>
            evt.resource?._id === sessionId ? { ...evt, start, end } : evt
         ),
      })),
   setChange: (change) => set({ lastChange: change }),
   getEvents: () => get().events,
   reset: () => set({ lastChange: undefined }),
}));
