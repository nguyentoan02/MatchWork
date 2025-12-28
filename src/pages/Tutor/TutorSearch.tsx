import TutorFilterBar from "@/components/tutor/tutor-search/TutorFilterSidebar";
import TutorListPage from "./TutorList";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useRecommendedTutors from "@/hooks/useTutorListAndDetail";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";

export type FiltersType = {
   searchQuery: string;
   priceRange: [number, number];
   ratingRange: [number, number];
   selectedTimeSlots: string[];
   selectedDays: string[];
   isOnline: boolean | null;
   selectedSubjects: string[];
   selectedLocation: string;
   experienceYears: [number, number];
   selectedGenders: string[];
   selectedClassTypes: string[];
   selectedLevels: string[];
   selectedCities: string[];
};

export default function TutorSearch() {
   // UI filters (what user is editing)
   const [filters, setFilters] = useState<FiltersType>({
      searchQuery: "",
      priceRange: [0, 2000000],
      ratingRange: [0, 5],
      selectedTimeSlots: [],
      selectedDays: [],
      isOnline: null,
      selectedSubjects: [],
      selectedLocation: "",
      experienceYears: [0, 20],
      selectedGenders: [],
      selectedClassTypes: [],
      selectedLevels: [],
      selectedCities: [],
   });

   // Applied filters (only used for searching)
   const [appliedFilters, setAppliedFilters] = useState<FiltersType>(filters);

   // AI search results and filtered tutors
   const [aiSearchResults, setAiSearchResults] = useState<any>(null);
   const [filteredTutors, setFilteredTutors] = useState<any[]>([]);
   const [isUsingAIResults, setIsUsingAIResults] = useState(false);
   const [aiNote, setAiNote] = useState<string | null>(null);

   // Hook recommendation (disabled by default, will refetch on click)
   const { refetch: refetchRecommendations, isFetching: isFetchingRec } =
      useRecommendedTutors(false);

   const navigate = useNavigate();
   const toast = useToast();
   const { isAuthenticated } = useUser();

   const handleFilterChange = (newFilters: Partial<FiltersType>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      // Clear AI results when manually changing filters
      if (isUsingAIResults) {
         setIsUsingAIResults(false);
         setAiSearchResults(null);
         setFilteredTutors([]);
      }
   };

   const handleApplyFilters = () => {
      setAppliedFilters(filters); // apply current UI filters
      // Clear AI results when applying manual filters
      if (isUsingAIResults) {
         setIsUsingAIResults(false);
         setAiSearchResults(null);
         setFilteredTutors([]);
      }
   };

   const handleClearFilters = () => {
      const cleared: FiltersType = {
         searchQuery: "",
         priceRange: [0, 2000000],
         ratingRange: [0, 5],
         selectedTimeSlots: [],
         selectedDays: [],
         isOnline: null,
         selectedSubjects: [],
         selectedLocation: "",
         experienceYears: [0, 20],
         selectedGenders: [],
         selectedClassTypes: [],
         selectedLevels: [],
         selectedCities: [],
      };
      setFilters(cleared);
      setAppliedFilters(cleared);
      // Clear AI results
      setIsUsingAIResults(false);
      setAiSearchResults(null);
      setFilteredTutors([]);
   };

   // const handleAISearchResults = (results: any) => {
   //    console.log("Received AI search results:", results);
   //    setAiSearchResults(results);
   //    setIsUsingAIResults(true);

   //    // Handle different response formats
   //    let tutorList: any[] = [];

   //    if (results && Array.isArray(results)) {
   //       tutorList = results;
   //    } else if (results?.data.results && Array.isArray(results.data.results)) {
   //       // This is the correct property based on your console log
   //       tutorList = results.data.results;
   //    } else if (results?.data.tutors && Array.isArray(results.data.tutors)) {
   //       tutorList = results.data.tutors;
   //    } else if (results?.data && Array.isArray(results.data)) {
   //       tutorList = results.data;
   //    }

   //    console.log(tutorList);

   //    setFilteredTutors(tutorList);
   //    console.log("Processed AI tutors:", tutorList);
   // };

   const handleRecommendationClick = async () => {
      // nếu chưa đăng nhập -> show toast và chuyển tới trang login
      if (!isAuthenticated) {
         toast(
            "warning",
            "Vui lòng đăng nhập để sử dụng chức năng gợi ý gia sư"
         );
         navigate("/login");
         return;
      }
      // reset previous AI results UI
      setIsUsingAIResults(false);
      setAiSearchResults(null);
      setFilteredTutors([]);
      setAiNote(null);

      try {
         // ép kiểu kết quả refetch để tránh lỗi "property 'data' does not exist on type 'never'"
         const res = await refetchRecommendations();
         const payload: any =
            (res as any)?.data /* react-query result */ ??
            (res as any) /* fallback */ ??
            null;

         // lấy note nếu backend trả về
         setAiNote(payload?.note ?? null);

         // flexible parsing to support backend shapes
         let tutorList: any[] = [];
         const d = payload?.data ?? payload;
         if (Array.isArray(d)) {
            tutorList = d;
         } else if (d?.data && Array.isArray(d.data)) {
            tutorList = d.data;
         } else if (d?.data?.data && Array.isArray(d.data.data)) {
            tutorList = d.data.data;
         } else if (d?.data?.results && Array.isArray(d.data.results)) {
            tutorList = d.data.results;
         }

         if (tutorList.length > 0) {
            setAiSearchResults({
               data: {
                  results: tutorList,
                  pagination: { total: tutorList.length },
               },
            });
            setFilteredTutors(tutorList);
            setIsUsingAIResults(true);
         } else {
            setAiSearchResults({
               data: { results: [], pagination: { total: 0 } },
            });
            setFilteredTutors([]);
            setIsUsingAIResults(true);
         }
      } catch (err) {
         setAiNote(null);
         console.error("Recommendation fetch failed:", err);
      }
   };

   return (
      <div className="container mx-auto px-4 py-6">
         <div className="mb-6">
            <h1 className="text-3xl font-bold">Danh sách Gia sư</h1>
            <p className="text-muted-foreground">
               Khám phá các gia sư hàng đầu của chúng tôi.
            </p>
         </div>

         <TutorFilterBar
            currentFilters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            tutors={[]} // optional if not needed
         />

         {/* Recommendation button placed under search */}
         <div className="my-6 flex items-center gap-4">
            <button
               onClick={handleRecommendationClick}
               disabled={isFetchingRec}
               className="flex items-center gap-3 px-5 py-3 rounded-2xl text-white font-semibold shadow-xl transform transition-transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed
                 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500"
            >
               {/* spark/ai icon */}
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden
               >
                  <path d="M12 2a1 1 0 011 1v1.07a7 7 0 013.04 1.79l.76-.76a1 1 0 011.41 1.41l-.76.76A7 7 0 0120.93 11H22a1 1 0 110 2h-1.07a7 7 0 01-1.79 3.04l.76.76a1 1 0 11-1.41 1.41l-.76-.76A7 7 0 0113 20.93V22a1 1 0 11-2 0v-1.07a7 7 0 01-3.04-1.79l-.76.76a1 1 0 11-1.41-1.41l.76-.76A7 7 0 013.07 13H2a1 1 0 110-2h1.07a7 7 0 011.79-3.04l-.76-.76A1 1 0 015.51 5.79l.76.76A7 7 0 0111 4.07V3a1 1 0 011-1z" />
               </svg>
               <span>
                  {isFetchingRec ? "Đang tìm gợi ý..." : "Gợi ý Gia sư cho tôi"}
               </span>
               <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-white/20">
                  AI
               </span>
            </button>

            <p className="text-sm text-muted-foreground">
               Nhấn để nhận danh sách gia sư được AI gợi ý dựa trên hồ sơ học
               sinh
            </p>
         </div>

         {/* Show AI search insights if available */}
         {aiSearchResults && isUsingAIResults && (
            <div className="mx-0 mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
               <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  🤖 Kết quả AI Search
                  <button
                     onClick={() => {
                        setIsUsingAIResults(false);
                        setAiSearchResults(null);
                        setFilteredTutors([]);
                        setAiNote(null);
                     }}
                     className="text-xs text-blue-600 hover:text-blue-800 ml-auto"
                  >
                     ✕ Đóng
                  </button>
               </h4>

               {/* new: rõ ràng khi backend trả note (fallback) */}
               {aiNote ? (
                  <>
                     <p className="text-sm text-amber-800 dark:text-amber-200">
                        AI không tìm thấy gia sư phù hợp hoàn toàn với yêu cầu.
                        Hiển thị danh sách gia sư có sẵn trên hệ thống để bạn
                        tham khảo:
                        <strong> {filteredTutors.length}</strong>
                     </p>
                     <p className="text-xs text-muted-foreground mt-2">
                        {aiNote}
                     </p>
                  </>
               ) : (
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                     Tìm thấy <strong>{filteredTutors.length}</strong> gia sư
                     phù hợp với yêu cầu
                     {filters.searchQuery ? `: "${filters.searchQuery}"` : ""}.
                  </p>
               )}

               {aiSearchResults?.data?.pagination?.total && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                     Tổng cộng: {aiSearchResults.data.pagination.total} kết quả
                  </p>
               )}
            </div>
         )}

         {/* Pass either AI results or regular filters */}
         <TutorListPage
            filters={isUsingAIResults ? null : appliedFilters}
            aiTutors={isUsingAIResults ? filteredTutors : null}
         />
      </div>
   );
}
