import apiClient from "@/lib/api";
import type { Review } from "@/types/review";

// Create a new review
export const createReview = async (data: {
    teachingRequestId: string;
    rating: number;
    comment?: string;
}): Promise<Review> => {
    const response = await apiClient.post("/review", data);
    return response.data.data.review;
};

// Get all reviews for a specific tutor (public)
export const getTutorReviews = async (tutorId: string): Promise<Review[]> => {
    const response = await apiClient.get(`/review/tutor/${tutorId}`);
    return response.data.data.reviews;
};

//  Get all reviews for the current tutor (dashboard)
export const getMyTutorReviews = async (filters?: {
    page?: number;
    limit?: number;
    keyword?: string;
    subjects?: string[];
    levels?: string[];
    minRating?: number;
    maxRating?: number;
    sort?: "newest" | "oldest";
    rating?: string;
}) => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.keyword) params.append('keyword', filters.keyword);
    if (filters?.minRating !== undefined) params.append('minRating', filters.minRating.toString());
    if (filters?.maxRating !== undefined) params.append('maxRating', filters.maxRating.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.rating) params.append('rating', filters.rating);

    if (filters?.subjects && filters.subjects.length > 0) {
        params.append('subjects', filters.subjects.join(','));
    }

    if (filters?.levels && filters.levels.length > 0) {
        params.append('levels', filters.levels.join(','));
    }
    const response = await apiClient.get(`/review/tutor/me?${params.toString()}`);

    return response.data.data;
};

// Get tutor rating stats
export const getTutorRatingStats = async (tutorId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
}> => {
    const response = await apiClient.get(`/review/tutor/${tutorId}/stats`);
    return response.data.data.stats;
};

// Get all reviews written by current student with filtering
export const getStudentReviewHistory = async (filters?: {
    page?: number;
    limit?: number;
    keyword?: string;
    subjects?: string[];
    levels?: string[];
    minRating?: number;
    maxRating?: number;
    sort?: "newest" | "oldest";
    rating?: string;
}) => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.keyword) params.append('keyword', filters.keyword);
    if (filters?.minRating !== undefined) params.append('minRating', filters.minRating.toString());
    if (filters?.maxRating !== undefined) params.append('maxRating', filters.maxRating.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.rating) params.append('rating', filters.rating);

    if (filters?.subjects && filters.subjects.length > 0) {
        params.append('subjects', filters.subjects.join(','));
    }

    if (filters?.levels && filters.levels.length > 0) {
        params.append('levels', filters.levels.join(','));
    }

    const response = await apiClient.get(`/review/student/history?${params.toString()}`);
    return response.data.data;
};

// Update review
export const updateReview = async (reviewId: string, data: {
    rating?: number;
    comment?: string;
}): Promise<Review> => {
    const response = await apiClient.put(`/review/${reviewId}`, data);
    return response.data.data.review;
};

// Check if student can review a tutor (has completed learning commitments)
export const checkReviewEligibility = async (tutorUserId: string): Promise<{
    hasCompleted: boolean;
    teachingRequestIds: string[];
}> => {
    const response = await apiClient.get(`/review/check-eligibility/${tutorUserId}`);
    return response.data.data.eligibility;
};