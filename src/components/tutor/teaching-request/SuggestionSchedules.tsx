import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import withDragAndDrop, {
   EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import {
   Calendar as BigCalendar,
   Event as BigCalendarEvent,
   momentLocalizer,
} from "react-big-calendar";
import moment from "moment";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogFooter,
} from "../../ui/dialog";
import { BookOpen } from "lucide-react";
import { Badge } from "../../ui/badge";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Role } from "@/enums/role.enum";
import { useCalendarEventStore } from "@/store/useCalendarEventStore";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { useSSchedules } from "@/hooks/useSSchedules";
import { useStudentBusySchedules } from "@/hooks/useSessions";
import { BSession, Session } from "@/types/session";

type Props = {
   onClose: () => void;
   isOpen: boolean;
   TRId: string;
};
interface CalendarEvent extends BigCalendarEvent {
   start: Date;
   end: Date;
   resource: Session | any;
   isBusy?: boolean;
   style?: React.CSSProperties;
}

moment.locale("vi");
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop<CalendarEvent>(BigCalendar);

const createLocalId = () =>
   `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function SuggestionSchedules({ isOpen, onClose, TRId }: Props) {
   const { user } = useUser();
   const {
      events,
      setEvents,
      addEvent,
      updateEventTime,
      setChange,
      getEvents,
      setTitle,
      setTeachingRequestId,
      getTitle,
      reset,
      removeEvent,
   } = useCalendarEventStore();
   const { createSSchedules, fetchSSchedules } = useSSchedules(TRId);
   const initializedRef = useRef(false);

   // bulk modal state
   const [showBulkModal, setShowBulkModal] = useState(false);
   const [startDateTime, setStartDateTime] = useState(
      moment().startOf("day").format("YYYY-MM-DD")
   );
   const [startTime] = useState("09:00");
   const [endTime] = useState("11:00");
   const [repeatMode, setRepeatMode] = useState<"count" | "until">("count");
   const [totalSessions, setTotalSessions] = useState(5);
   const [untilDate, setUntilDate] = useState(
      moment().add(3, "week").format("YYYY-MM-DD")
   );
   const [weekdays, setWeekdays] = useState<number[]>([1, 3]);
   const [weekdayTimes, setWeekdayTimes] = useState<
      Record<number, { start: string; end: string }>
   >({
      1: { start: "09:00", end: "11:00" },
      3: { start: "14:00", end: "16:00" },
   });

   const {
      data: bSessions,
      isLoading: bisLoading,
      isError: bisError,
   } = useStudentBusySchedules();

   useEffect(() => {
      reset()
      const res = fetchSSchedules.data?.data;
      if (!res) return;

      // đồng bộ title + TRId vào store
      setTitle(res.title || "lịch đề xuất");
      setTeachingRequestId(res.teachingRequestId || TRId);

      // gán các event trả về vào calendar (kèm id để drag/drop & delete)
      setEvents(
         (res.schedules || []).map((s) => ({
            start: new Date(s.start),
            end: new Date(s.end),
            resource: {
               _id: (s as any)?._id ?? (s as any)?.id ?? createLocalId(),
            },
         }))
      );
   }, [fetchSSchedules.data, setEvents, setTeachingRequestId, setTitle, TRId]);

   const busyEvents = useMemo(() => {
      return (
         (bSessions?.data.map((busy: BSession) => ({
            title: `Học ${busy.learningCommitmentId.student.userId.name} sinh bận`,
            start: new Date(busy.startTime),
            end: new Date(busy.endTime),
            resource: busy,
            isBusy: true,
         })) as CalendarEvent[]) || []
      );
   }, [bSessions]);

   const calendarEvents = useMemo(
      () => [...busyEvents, ...events],
      [busyEvents, events]
   );

   const toggleWeekday = (day: number) => {
      setWeekdays((prev) => {
         const next = prev.includes(day)
            ? prev.filter((d) => d !== day)
            : [...prev, day];
         if (!weekdayTimes[day]) {
            setWeekdayTimes((t) => ({
               ...t,
               [day]: { start: startTime, end: endTime },
            }));
         }
         return next;
      });
   };

   const updateWeekdayTime = (
      day: number,
      field: "start" | "end",
      value: string
   ) => {
      setWeekdayTimes((t) => ({
         ...t,
         [day]: {
            ...(t[day] ?? { start: startTime, end: endTime }),
            [field]: value,
         },
      }));
   };

   const handleBulkCreate = () => {
      if (weekdays.length === 0) return;
      const baseDate = moment(startDateTime, "YYYY-MM-DD");
      if (!baseDate.isValid()) return;

      let created = 0;
      const maxIterations = 200;
      let cursor = baseDate.clone().startOf("week");
      const endLimit =
         repeatMode === "until"
            ? moment(untilDate, "YYYY-MM-DD").endOf("day")
            : baseDate.clone().add(52, "week");

      let stop = false;

      for (let i = 0; i < maxIterations && !stop; i++) {
         for (const day of weekdays.sort()) {
            const times = weekdayTimes[day];
            const startStr = times?.start ?? startTime;
            const endStr = times?.end ?? endTime;

            const startMomentOfDay = moment(startStr, "HH:mm");
            const endMomentOfDay = moment(endStr, "HH:mm");
            if (!startMomentOfDay.isValid() || !endMomentOfDay.isValid())
               continue;
            if (endMomentOfDay.isSameOrBefore(startMomentOfDay)) continue;

            const eventStart = cursor.clone().day(day);
            if (eventStart.isBefore(baseDate)) continue;

            eventStart
               .hour(startMomentOfDay.hour())
               .minute(startMomentOfDay.minute())
               .second(0);
            const eventEnd = eventStart
               .clone()
               .hour(endMomentOfDay.hour())
               .minute(endMomentOfDay.minute())
               .second(0);

            addEvent({
               start: eventStart.toDate(),
               end: eventEnd.toDate(),
               resource: { _id: createLocalId() },
               title: getTitle(),
            });

            created += 1;
            if (repeatMode === "count" && created >= totalSessions) {
               stop = true;
               break;
            }
            if (repeatMode === "until" && eventStart.isAfter(endLimit)) {
               stop = true;
               break;
            }
         }
         cursor.add(1, "week");
         if (repeatMode === "until" && cursor.isAfter(endLimit)) break;
      }

      setTeachingRequestId(TRId);

      setShowBulkModal(false);

      console.log(getEvents());
   };

   const seedEvents = useMemo(() => [], []);

   useEffect(() => {
      if (!initializedRef.current) {
         setEvents(seedEvents);
         initializedRef.current = true;
      }
   }, [setEvents, seedEvents]);

   const handleEventDrop = useCallback(
      ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
         if (event?.isBusy || user?.role !== Role.TUTOR) return;
         const eventId =
            (event.resource as any)?._id ??
            (event as any)?._id ??
            (event as any)?.id;
         if (!eventId) return;
         const payload = {
            sessionId: eventId,
            startTime: (start as Date).toISOString(),
            endTime: (end as Date).toISOString(),
         };
         updateEventTime(eventId, start as Date, end as Date);
         console.log("Drop success", payload);
         setChange({ type: "drop", ...payload });
      },
      [user, updateEventTime, setChange]
   );

   const handleEventResize = useCallback(
      ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
         if (event?.isBusy || user?.role !== Role.TUTOR) return;
         const eventId =
            (event.resource as any)?._id ??
            (event as any)?._id ??
            (event as any)?.id;
         if (!eventId) return;
         const payload = {
            sessionId: eventId,
            startTime: (start as Date).toISOString(),
            endTime: (end as Date).toISOString(),
         };
         updateEventTime(eventId, start as Date, end as Date);
         console.log("Resize success", payload);
         setChange({ type: "resize", ...payload });
      },
      [user, updateEventTime, setChange]
   );

   const handleSelectEvent = useCallback(
      (event: CalendarEvent) => {
         const payload = {
            sessionId:
               (event.resource as any)?._id ??
               (event as any)?._id ??
               (event as any)?.id,
            startTime: (event.start as Date).toISOString(),
            endTime: (event.end as Date).toISOString(),
         };
         if (!payload.sessionId) return;

         // chỉ tutor mới được xóa và không áp dụng cho busy event
         if (!event.isBusy && user?.role === Role.TUTOR) {
            const ok = window.confirm("Bạn có chắc muốn xóa buổi này?");
            if (!ok) return;
            removeEvent(payload.sessionId);
            setChange({ type: "delete", ...payload });
            return;
         }

         console.log("Select event", payload);
         setChange({ type: "selectEvent", ...payload });
      },
      [user, removeEvent, setChange]
   );

   const handleSelectSlot = useCallback(
      ({ start, end }: { start: Date; end: Date }) => {
         if (user?.role !== Role.TUTOR) return;
         const newId = `slot-${Date.now()}`;
         const newEvent = {
            title: "Buổi mới",
            start: start as Date,
            end: end as Date,
            resource: { _id: newId },
         };
         addEvent(newEvent);
         const payload = {
            sessionId: newId,
            startTime: (start as Date).toISOString(),
            endTime: (end as Date).toISOString(),
         };
         console.log("Create slot", payload);
         setChange({ type: "selectSlot", ...payload });
      },
      [addEvent, setChange, user?.role]
   );

   const messages = {
      allDay: "Cả ngày",
      previous: "Trước",
      next: "Sau",
      today: "Hôm nay",
      month: "Tháng",
      week: "Tuần",
      day: "Ngày",
      agenda: "Lịch biểu",
      date: "Ngày",
      time: "Thời gian",
      event: "Sự kiện",
      noEventsInRange: "Không có sự kiện nào trong khoảng thời gian này.",
      work_week: "Tuần làm việc",
      showMore: (total: number) => `+${total} sự kiện khác`,
   };

   const eventPropGetter = useCallback((event: CalendarEvent) => {
      if (event.isBusy) {
         return {
            style: {
               backgroundColor: "#1f2937",
               borderColor: "#111827",
               opacity: 0.75,
            },
         };
      }
      return { style: event.style };
   }, []);

   if (fetchSSchedules.isLoading || bisLoading) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
               <DialogHeader>
                  <DialogTitle>Lịch gợi ý</DialogTitle>
                  <DialogDescription>Đang tải lịch gợi ý...</DialogDescription>
               </DialogHeader>
            </DialogContent>
         </Dialog>
      );
   }

   if (fetchSSchedules.isError || bisError) {
      return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
               <DialogHeader>
                  <DialogTitle>Lịch gợi ý</DialogTitle>
                  <DialogDescription>
                     Tải lịch gợi ý thất bại. Vui lòng thử lại.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => fetchSSchedules.refetch()}
                  >
                     Thử lại
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <>
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95vw] h-[80vh] p-0 sm:p-6 flex flex-col gap-4">
               <DialogHeader className="px-6 pt-6">
                  <DialogTitle className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Lịch gợi ý
                     </div>
                     <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="px-3">
                           Tuần này
                        </Badge>
                        <Button
                           size="sm"
                           variant="outline"
                           onClick={() => setShowBulkModal(true)}
                        >
                           Tạo nhiều buổi
                        </Button>
                        <Button
                           size="sm"
                           variant="outline"
                           onClick={() => {
                              console.log(getEvents());
                           }}
                        >
                           Log state
                        </Button>
                        <Button
                           size="sm"
                           variant="outline"
                           onClick={() => {
                              createSSchedules.mutate(getEvents());
                           }}
                        >
                           Lưu lịch đề xuất
                        </Button>
                     </div>
                  </DialogTitle>
               </DialogHeader>

               <div className="flex-1 min-h-0 px-4 sm:px-6 pb-6">
                  <DnDCalendar
                     events={calendarEvents}
                     localizer={localizer}
                     culture="vi"
                     messages={messages}
                     onEventDrop={handleEventDrop}
                     onEventResize={handleEventResize}
                     onSelectEvent={handleSelectEvent}
                     onSelectSlot={handleSelectSlot}
                     eventPropGetter={eventPropGetter}
                     draggableAccessor={(event) =>
                        !event.isBusy && user?.role === Role.TUTOR
                     }
                     resizableAccessor={(event) =>
                        !event.isBusy && user?.role === Role.TUTOR
                     }
                     selectable={user?.role === Role.TUTOR}
                     resizable={user?.role === Role.TUTOR}
                     defaultView="week"
                     startAccessor="start"
                     endAccessor="end"
                     titleAccessor="title"
                     style={{ height: "100%" }}
                  />
               </div>
            </DialogContent>
         </Dialog>

         <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
            <DialogContent className="max-w-5xl">
               <DialogHeader>
                  <DialogTitle>Tạo nhiều buổi học</DialogTitle>
                  <DialogDescription>
                     Chọn ngày bắt đầu, giờ bắt đầu và giờ kết thúc cho mỗi
                     buổi.
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-5">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">
                           Ngày bắt đầu
                        </label>
                        <Input
                           type="date"
                           value={startDateTime}
                           onChange={(e) => setStartDateTime(e.target.value)}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">
                           mô tả lịch
                        </label>
                        <Input
                           type="text"
                           value={getTitle()}
                           onChange={(e) => setTitle(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium">Lặp theo thứ</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                           const times = weekdayTimes[d] ?? {
                              start: startTime,
                              end: endTime,
                           };
                           return (
                              <div
                                 key={d}
                                 className="border rounded px-3 py-2 space-y-2"
                              >
                                 <label className="flex items-center gap-2">
                                    <Checkbox
                                       checked={weekdays.includes(d)}
                                       onCheckedChange={() => toggleWeekday(d)}
                                    />
                                    {moment().day(d).format("ddd")}
                                 </label>
                                 {weekdays.includes(d) && (
                                    <div className="grid grid-cols-2 gap-2">
                                       <Input
                                          type="time"
                                          value={times.start}
                                          onChange={(e) =>
                                             updateWeekdayTime(
                                                d,
                                                "start",
                                                e.target.value
                                             )
                                          }
                                          className="w-full text-sm"
                                       />
                                       <Input
                                          type="time"
                                          value={times.end}
                                          onChange={(e) =>
                                             updateWeekdayTime(
                                                d,
                                                "end",
                                                e.target.value
                                             )
                                          }
                                          className="w-full text-sm"
                                       />
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-medium">Kiểu lặp</label>
                     <div className="flex gap-4 text-sm">
                        <label className="flex items-center gap-2">
                           <input
                              type="radio"
                              name="repeatMode"
                              value="count"
                              checked={repeatMode === "count"}
                              onChange={() => setRepeatMode("count")}
                           />
                           Theo số buổi
                        </label>
                        <label className="flex items-center gap-2">
                           <input
                              type="radio"
                              name="repeatMode"
                              value="until"
                              checked={repeatMode === "until"}
                              onChange={() => setRepeatMode("until")}
                           />
                           Theo ngày kết thúc
                        </label>
                     </div>
                  </div>

                  {repeatMode === "count" ? (
                     <div className="space-y-2">
                        <label className="text-sm font-medium">
                           Tổng số buổi
                        </label>
                        <Input
                           type="number"
                           min={1}
                           value={totalSessions}
                           onChange={(e) =>
                              setTotalSessions(Number(e.target.value))
                           }
                        />
                     </div>
                  ) : (
                     <div className="space-y-2">
                        <label className="text-sm font-medium">
                           Ngày kết thúc
                        </label>
                        <Input
                           type="date"
                           value={untilDate}
                           onChange={(e) => setUntilDate(e.target.value)}
                        />
                     </div>
                  )}
               </div>

               <DialogFooter className="gap-2">
                  <Button
                     variant="outline"
                     onClick={() => setShowBulkModal(false)}
                  >
                     Hủy
                  </Button>
                  <Button onClick={handleBulkCreate}>Tạo</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </>
   );
}

export default SuggestionSchedules;
