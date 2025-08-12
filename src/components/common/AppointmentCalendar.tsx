import { useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useScheduleSessions } from "@/hooks/useScheduleSessions";
import { CustomEvent } from "./CustomEvent";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ScheduleForm } from "./ScheduleForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

const localizer = momentLocalizer(moment);

export function AppointmentCalendar() {
    const { sessions, isLoading, isError } = useScheduleSessions();
    const [showForm, setShowForm] = useState(false);

    // Lấy danh sách userId và teachingRequestId từ dữ liệu đã populate
    const allUserIds = useMemo(
        () => Array.from(new Set(sessions.map((s) => s.createdBy))),
        [sessions]
    );
    const allTeachingRequests = useMemo(
        () => Array.from(new Set(sessions.map((s) => s.teachingRequest))),
        [sessions]
    );

    // State cho bộ lọc
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

    // Xử lý bộ lọc
    const filteredSessions = useMemo(() => {
        return sessions.filter((session) => {
            const userMatch =
                selectedUserIds.length === 0 ||
                selectedUserIds.includes(session.createdBy);
            const requestMatch =
                selectedRequestIds.length === 0 ||
                selectedRequestIds.includes(session.teachingRequest._id);
            return userMatch && requestMatch;
        });
    }, [sessions, selectedUserIds, selectedRequestIds]);

    // Chuyển dữ liệu session thành event cho Calendar
    const events = useMemo(
        () =>
            filteredSessions.map((session) => ({
                ...session,
                start: new Date(session.startTime),
                end: new Date(session.endTime),
                // Hiển thị tiêu đề là môn học + ghi chú nếu có
                title:
                    (session.teachingRequest.subject
                        ? session.teachingRequest.subject + " - "
                        : "") + (session.notes || session.teachingRequest._id),
            })),
        [filteredSessions]
    );

    if (isLoading) return <div>Đang tải lịch học...</div>;
    if (isError) return <div>Lỗi! Không thể tải dữ liệu lịch học.</div>;

    return (
        <div>
            {/* Bộ lọc theo người tạo */}
            <div className="mb-2 flex flex-wrap gap-4">
                <div>
                    <Button
                        variant={"default"}
                        onClick={() => {
                            setShowForm(true);
                        }}
                    >
                        create new session
                    </Button>
                </div>
                <div>
                    <strong>Lọc theo người tạo:</strong>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Chọn người tạo
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {allUserIds.map((userId) => (
                                <DropdownMenuItem key={userId} asChild>
                                    <div className="flex items-center">
                                        <Checkbox
                                            checked={selectedUserIds.includes(
                                                userId
                                            )}
                                            onCheckedChange={(checked) => {
                                                setSelectedUserIds((prev) =>
                                                    checked
                                                        ? [...prev, userId]
                                                        : prev.filter(
                                                              (id) =>
                                                                  id !== userId
                                                          )
                                                );
                                            }}
                                            id={`user-${userId}`}
                                        />
                                        <label
                                            htmlFor={`user-${userId}`}
                                            className="ml-2 cursor-pointer"
                                        >
                                            {userId}
                                        </label>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                    <strong>Lọc theo yêu cầu học:</strong>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Chọn yêu cầu học
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {allTeachingRequests.map((req: any) => (
                                <DropdownMenuItem key={req._id} asChild>
                                    <div className="flex items-center">
                                        <Checkbox
                                            checked={selectedRequestIds.includes(
                                                req._id
                                            )}
                                            onCheckedChange={(checked) => {
                                                setSelectedRequestIds((prev) =>
                                                    checked
                                                        ? [...prev, req._id]
                                                        : prev.filter(
                                                              (id) =>
                                                                  id !== req._id
                                                          )
                                                );
                                            }}
                                            id={`req-${req._id}`}
                                        />
                                        <label
                                            htmlFor={`req-${req._id}`}
                                            className="ml-2 cursor-pointer"
                                        >
                                            {req.subject}
                                        </label>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="h-[70vh]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={["month", "week", "day", "agenda"]}
                    defaultView="month"
                    components={{
                        event: CustomEvent,
                    }}
                />
            </div>
            {/* Dialog for ScheduleForm */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="min-w-[350px]">
                    <DialogHeader>
                        <DialogTitle>Tạo lịch học mới</DialogTitle>
                        <DialogDescription>
                            Điền thông tin để tạo lịch học mới.
                        </DialogDescription>
                    </DialogHeader>
                    <ScheduleForm onSubmit={() => {}} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
