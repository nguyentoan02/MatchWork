import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Level } from "@/enums/level.enum";
import { Subject } from "@/enums/subject.enum";
import {
    useFetchStudentProfile,
    useUpdateStudentProfile,
} from "@/hooks/useStudentProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ReactQuill from "react-quill";
import z from "zod";
import "react-quill/dist/quill.snow.css";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TimeSlot } from "@/enums/timeSlot.enum";
import { useToast } from "@/hooks/useToast";

const studentProfileSchema = z.object({
    name: z.string().min(1, "Vui lòng nhập tên"),
    email: z.string().email(),
    phone: z.string(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", ""]),
    avatar: z.any(),
    gradeLevel: z.string(),
    subjectsInterested: z.array(z.string()),
    bio: z.string(),
    learningGoals: z.string(),
    availability: z.array(
        z.object({
            dayOfWeek: z.number(),
            slots: z.array(z.string()),
        })
    ),
});

const DAYS_OF_WEEK = [
    { value: 1, label: "Thứ 2" },
    { value: 2, label: "Thứ 3" },
    { value: 3, label: "Thứ 4" },
    { value: 4, label: "Thứ 5" },
    { value: 5, label: "Thứ 6" },
    { value: 6, label: "Thứ 7" },
    { value: 0, label: "Chủ nhật" },
];

const TIMESLOTS = [
    { value: TimeSlot.PRE_12, label: "Sáng (trước 12h)" },
    { value: TimeSlot.MID_12_17, label: "Chiều (12h-17h)" },
    { value: TimeSlot.AFTER_17, label: "Tối (sau 17h)" },
];

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

const SUBJECTS = Object.values(Subject);
const GRADE_LEVELS = Object.values(Level);
const StudentProfile = () => {
    const {
        data: studentProfile,
        isLoading,
        isError,
    } = useFetchStudentProfile();
    const { mutate: updateStudent, isPending } = useUpdateStudentProfile();
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
        setValue,
    } = useForm<StudentProfileFormValues>({
        resolver: zodResolver(studentProfileSchema),
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const addToast = useToast();

    const onSubmit = (formData: StudentProfileFormValues) => {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("phone", formData.phone || "");
        data.append("gender", formData.gender || "");
        data.append("gradeLevel", formData.gradeLevel || "");
        data.append("bio", formData.bio || "");
        data.append("learningGoals", formData.learningGoals || "");
        data.append(
            "subjectsInterested",
            JSON.stringify(formData.subjectsInterested || [])
        );
        data.append(
            "availability",
            JSON.stringify(formData.availability || [])
        );
        if (formData.avatar && formData.avatar instanceof File) {
            data.append("avatar", formData.avatar);
        }
        // Log kiểm tra
        for (let pair of data.entries()) {
            console.log(pair[0], pair[1]);
        }
        console.log("formData.avatar", formData.avatar);
        updateStudent(data, {
            onSuccess: () => addToast("success", "Cập nhật hồ sơ thành công!"),
            onError: () => addToast("error", "Cập nhật hồ sơ thất bại!"),
        });
    };

    useEffect(() => {
        if (studentProfile) {
            reset({
                name: studentProfile.userId.name ?? "",
                email: studentProfile.userId.email ?? "",
                phone: studentProfile.userId.phone ?? "",
                gender: (["MALE", "FEMALE", "OTHER"].includes(
                    studentProfile.userId.gender
                )
                    ? studentProfile.userId.gender
                    : undefined) as "MALE" | "FEMALE" | "OTHER" | undefined,
                gradeLevel: studentProfile.gradeLevel ?? undefined,
                subjectsInterested: studentProfile.subjectsInterested ?? [],
                bio: studentProfile.bio ?? "",
                learningGoals: studentProfile.learningGoals ?? "",
                avatar: undefined,
                availability: studentProfile.availability ?? [],
            });
            setAvatarPreview(studentProfile.userId.avatarUrl || null);
        }
    }, [studentProfile, reset]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            setValue("avatar", file, { shouldDirty: true });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
        );
    }

    if (isError || !studentProfile) {
        return (
            <div className="text-center text-red-500 p-10">
                Không thể tải hồ sơ học sinh.
            </div>
        );
    }
    return (
        <div>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Hồ sơ học sinh</CardTitle>
                    <CardDescription>
                        Quản lý thông tin cá nhân và học tập của bạn.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage
                                    src={avatarPreview || ""}
                                    alt="Avatar"
                                />
                                <AvatarFallback className="text-3xl">
                                    {studentProfile.userId.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid gap-2">
                                <Label htmlFor="avatar">
                                    Thay đổi ảnh đại diện
                                </Label>
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    // {...register("avatar")}
                                    onChange={handleAvatarChange}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                />
                                {errors.avatar && (
                                    <p className="text-sm text-red-500">
                                        {errors.avatar.message as string}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                disabled
                                {...register("email")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Họ và tên</Label>
                            <Input id="name" {...register("name")} />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="gender">Giới tính</Label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn giới tính" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">
                                                Nam
                                            </SelectItem>
                                            <SelectItem value="FEMALE">
                                                Nữ
                                            </SelectItem>
                                            <SelectItem value="OTHER">
                                                Khác
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.gender && (
                                <p className="text-sm text-red-500">
                                    {errors.gender.message as string}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input id="phone" {...register("phone")} />
                            {errors.phone && (
                                <p className="text-sm text-red-500">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="gradeLevel">Lớp</Label>
                            <Controller
                                name="gradeLevel"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn lớp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GRADE_LEVELS.map((level) => (
                                                <SelectItem
                                                    key={level}
                                                    value={level}
                                                >
                                                    {level.replace(
                                                        "GRADE_",
                                                        "Lớp "
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Môn quan tâm</Label>
                            <Controller
                                name="subjectsInterested"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-wrap gap-2">
                                        {SUBJECTS.map((subject) => (
                                            <label
                                                key={subject}
                                                className={`
                            flex items-center gap-1 px-3 py-1 rounded-full
                            border cursor-pointer
                            transition
                            ${
                                field.value?.includes(subject)
                                    ? "bg-sky-600 text-white border-sky-600"
                                    : "bg-muted text-foreground border-muted-foreground hover:bg-sky-100 dark:hover:bg-sky-900"
                            }
                        `}
                                                style={{ userSelect: "none" }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={subject}
                                                    checked={field.value?.includes(
                                                        subject
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            field.onChange([
                                                                ...(field.value ||
                                                                    []),
                                                                subject,
                                                            ]);
                                                        } else {
                                                            field.onChange(
                                                                (
                                                                    field.value ||
                                                                    []
                                                                ).filter(
                                                                    (s) =>
                                                                        s !==
                                                                        subject
                                                                )
                                                            );
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                                {subject}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            />
                        </div>

                        <div className="grid gap-2 mb-10">
                            <Label htmlFor="bio">Giới thiệu bản thân</Label>
                            <Controller
                                name="bio"
                                control={control}
                                render={({ field }) => (
                                    <ReactQuill
                                        theme="snow"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        className="bg-white"
                                    />
                                )}
                            />
                            {errors.bio && (
                                <p className="text-sm text-red-500">
                                    {errors.bio.message as string}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2 ">
                            <Label htmlFor="learningGoals">
                                Mục tiêu học tập
                            </Label>
                            <Input
                                id="learningGoals"
                                {...register("learningGoals")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Lịch rảnh</Label>
                            <Controller
                                name="availability"
                                control={control}
                                render={({ field }) => {
                                    const value = field.value || [];
                                    const handleSlotChange = (
                                        day: number,
                                        slot: string,
                                        checked: boolean
                                    ) => {
                                        let newValue = [...value];
                                        const dayIndex = newValue.findIndex(
                                            (d) => d.dayOfWeek === day
                                        );
                                        if (dayIndex === -1 && checked) {
                                            newValue.push({
                                                dayOfWeek: day,
                                                slots: [slot],
                                            });
                                        } else if (dayIndex !== -1) {
                                            const slots = new Set(
                                                newValue[dayIndex].slots
                                            );
                                            if (checked) {
                                                slots.add(slot);
                                            } else {
                                                slots.delete(slot);
                                            }
                                            if (slots.size === 0) {
                                                newValue.splice(dayIndex, 1);
                                            } else {
                                                newValue[dayIndex].slots =
                                                    Array.from(slots);
                                            }
                                        }
                                        field.onChange(newValue);
                                    };

                                    return (
                                        <div className="overflow-x-auto">
                                            <div
                                                className="grid"
                                                style={{
                                                    gridTemplateColumns: `repeat(${DAYS_OF_WEEK.length}, minmax(110px,1fr))`,
                                                }}
                                            >
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <div
                                                        key={day.value}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <div className="font-semibold mb-2">
                                                            {day.label}
                                                        </div>
                                                        {TIMESLOTS.map(
                                                            (slot) => {
                                                                const checked =
                                                                    value
                                                                        .find(
                                                                            (
                                                                                d
                                                                            ) =>
                                                                                d.dayOfWeek ===
                                                                                day.value
                                                                        )
                                                                        ?.slots.includes(
                                                                            slot.value
                                                                        ) ||
                                                                    false;
                                                                return (
                                                                    <label
                                                                        key={
                                                                            slot.value
                                                                        }
                                                                        className={`mb-2 w-full flex items-center justify-center cursor-pointer transition
                                                rounded
                                                ${
                                                    checked
                                                        ? "bg-sky-600 text-white font-semibold shadow"
                                                        : "bg-muted text-foreground hover:bg-sky-100 dark:hover:bg-sky-900"
                                                }
                                            `}
                                                                        style={{
                                                                            minHeight: 36,
                                                                            userSelect:
                                                                                "none",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                checked
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleSlotChange(
                                                                                    day.value,
                                                                                    slot.value,
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                                )
                                                                            }
                                                                            className="hidden"
                                                                        />
                                                                        <span className="block w-full text-center">
                                                                            {
                                                                                slot.label
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                        <CardFooter className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={!isDirty || isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    "Lưu thay đổi"
                                )}
                            </Button>
                        </CardFooter>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
};

export default StudentProfile;
