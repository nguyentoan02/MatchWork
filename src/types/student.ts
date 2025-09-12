import { IUser } from "./user";

export interface AvailabilitySlot {
    dayOfWeek: number;
    slots?: TimeSlot[];
}

export enum TimeSlot {
    PRE_12 = "PRE_12",
    MID_12_17 = "MID_12_17",
    AFTER_17 = "AFTER_17",
}

export enum Subject {
    ACCOUNTING = "ACCOUNTING",
    ADDITIONAL_MATHS = "ADDITIONAL_MATHS",
    BIOLOGY = "BIOLOGY",
    BUSINESS_STUDIES = "BUSINESS_STUDIES",
    CHEMISTRY = "CHEMISTRY",
    CHINESE = "CHINESE",
    COMPUTER_SCIENCE = "COMPUTER_SCIENCE",
    ECONOMICS = "ECONOMICS",
    ENGLISH = "ENGLISH",
    FREE_CONSULTATION = "FREE_CONSULTATION",
    FURTHER_MATHS = "FURTHER_MATHS",
    GEOGRAPHY = "GEOGRAPHY",
    GUITAR = "GUITAR",
    HISTORY = "HISTORY",
    MALAY = "MALAY",
    MATHEMATICS = "MATHEMATICS",
    ORGAN = "ORGAN",
    PHONICS_ENGLISH = "PHONICS_ENGLISH",
    PHYSICS = "PHYSICS",
    PIANO = "PIANO",
    RISE_PROGRAM = "RISE_PROGRAM",
    SCIENCE = "SCIENCE",
    SWIMMING = "SWIMMING",
    TAMIL = "TAMIL",
    TENNIS = "TENNIS",
    WORLD_LITERATURE = "WORLD_LITERATURE",
    YOGA = "YOGA",
}

export enum Level {
    GRADE_1 = "GRADE_1",
    GRADE_2 = "GRADE_2",
    GRADE_3 = "GRADE_3",
    GRADE_4 = "GRADE_4",
    GRADE_5 = "GRADE_5",
    GRADE_6 = "GRADE_6",
    GRADE_7 = "GRADE_7",
    GRADE_8 = "GRADE_8",
    GRADE_9 = "GRADE_9",
    GRADE_10 = "GRADE_10",
    GRADE_11 = "GRADE_11",
    GRADE_12 = "GRADE_12",
    UNIVERSITY = "UNIVERSITY",
}

export interface Student {
    _id: string;
    userId: IUser;
    subjectsInterested?: Subject[];
    // use Level enum (grade_1 .. grade_12, university)
    gradeLevel?: Level;
    bio?: string;
    learningGoals?: string;
    // availability grid (dayOfWeek + time slots), same shape as tutor availability
    availability?: {
        dayOfWeek: number;
        slots?: TimeSlot[];
    }[];
    createdAt?: Date;
    updatedAt?: Date;
}
