import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Fragment, useState } from "react";
import FlashcardListModal from "./FlashcardListModal";
import { useAsignQuizToSession } from "@/hooks/useQuiz";

export default function QuizzesCard({ session, canManage }: any) {
   const quizData = session?.quizIds || [];
   const asign = useAsignQuizToSession(session._id);
   const navigate = useNavigate();

   const [isShowingModal, setIsShowingModal] = useState(false);

   const handleOpenModal = () => {
      setIsShowingModal(true);
      ``;
   };

   const handleSaveFlashcards = (selectedFlashcards: string[]) => {
      asign.mutate({ sessionId: session._id, quizIds: selectedFlashcards });
      setIsShowingModal(false);
   };

   return (
      <Fragment>
         <FlashcardListModal
            isOpen={isShowingModal}
            onClose={() => setIsShowingModal(false)}
            onSave={handleSaveFlashcards}
            initSelectedFlashcards={quizData}
         />
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Flashcard ({quizData.length})
               </CardTitle>
               {canManage && (
                  <Button size="sm" onClick={handleOpenModal}>
                     <Plus className="h-4 w-4 mr-2" />
                     Gắn Flashcard mới
                  </Button>
               )}
            </CardHeader>
            <CardContent>
               {quizData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                     <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>Chưa có flashcard nào.</p>
                     {canManage && (
                        <p className="text-sm mt-2">
                           Nhấn "Gắn Flashcard mới" để thêm flashcard.
                        </p>
                     )}
                  </div>
               ) : (
                  <div className="space-y-4">
                     {quizData.map((quizId: string, index: number) => (
                        <div
                           key={quizId || index}
                           className="border rounded-lg p-4"
                        >
                           <div className="flex items-center justify-between mb-3">
                              <div>
                                 <h3 className="font-medium">
                                    Flashcard {index + 1}
                                 </h3>
                                 <p className="text-sm text-muted-foreground">
                                    ID: {quizId}
                                 </p>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Badge variant="outline">Flashcard</Badge>

                                 {/* Nút Xem: dẫn tới /viewQuizz */}
                                 <Link
                                    to={`/tutor/flashcard?flashcardId=${quizId}`}
                                 >
                                    <Button size="sm">Xem</Button>
                                 </Link>

                                 {canManage && (
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => {
                                          navigate(
                                             `/tutor/editFlashcard?flashcardId=${quizId}`
                                          );
                                       }}
                                    >
                                       <Edit3 className="h-4 w-4" />
                                    </Button>
                                 )}
                              </div>
                           </div>
                           <div className="text-sm text-muted-foreground">
                              Flashcard được gán cho buổi học này
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </CardContent>
         </Card>
      </Fragment>
   );
}
