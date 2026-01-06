import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { TutorCard } from "@/components/tutor/tutor-search/TutorCard";
import { TutorSuggestion } from "@/types/Tutor";
import { useState } from "react";

type AIRecommendationProps = {
   tutor: TutorSuggestion[];
};

const AIrecommendation = ({ tutor }: AIRecommendationProps) => {
   const [isExpanded, setIsExpanded] = useState(false);

   if (!tutor || tutor.length === 0) {
      return (
         <section className="mt-8 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
               <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-foreground">
               Gợi ý từ AI
            </h3>
            <p className="text-sm text-muted-foreground">
               Chưa có gợi ý gia sư nào. Hãy tạo hoặc cập nhật hồ sơ{" "}
               <Link
                  to="/student/student-profile"
                  className="text-primary underline hover:text-primary/80"
               >
                  tại đây
               </Link>
            </p>
         </section>
      );
   }

   return (
      <section className="relative mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg">
         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_30%)]" />

         <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative w-full flex items-center justify-between gap-3 p-6 hover:bg-primary/5 transition-colors"
         >
            <div className="flex items-center gap-2">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
               </div>
               <div className="text-left">
                  <h3 className="text-lg font-semibold text-foreground">
                     Gợi ý từ AI
                  </h3>
                  <p className="text-sm text-muted-foreground">
                     Các gia sư được đề xuất riêng cho bạn
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {tutor.length} gia sư phù hợp
               </span>
               {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
               ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
               )}
            </div>
         </button>

         {isExpanded && (
            <div className="relative px-6 pb-6">
               <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {tutor.map((t: TutorSuggestion, idx) => {
                     const tu = t.tutorId;
                     const key = tu?._id ?? idx;

                     const normalizedTutor = {
                        _id: tu?._id ?? key,
                        userId: {
                           _id: tu?.userId?._id ?? "",
                           name: tu?.userId?.name ?? "Gia sư",
                           avatarUrl: tu?.userId?.avatarUrl,
                           address: { city: tu?.userId?.address?.city },
                        },
                        hourlyRate: tu?.hourlyRate ?? 0,
                        experienceYears: tu?.experienceYears ?? 0,
                        subjects: tu?.subjects ?? [],
                        levels: tu?.levels ?? [],
                        classType: (tu as any)?.classType ?? [],
                        availability: (tu as any)?.availability ?? [],
                        ratings: {
                           average: (tu as any)?.ratings?.average ?? 0,
                           totalReviews:
                              (tu as any)?.ratings?.totalReviews ?? 0,
                        },
                        bio: tu?.bio,
                     } as any;

                     return <TutorCard key={key} tutor={normalizedTutor} />;
                  })}
               </div>
            </div>
         )}
      </section>
   );
};

export default AIrecommendation;
