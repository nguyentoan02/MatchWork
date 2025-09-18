import TutorListPage from "./TutorList";

export default function TutorSearch() {
   return (
      <div className="container mx-auto px-4 py-6">
         <div className="mb-6">
            <h1 className="text-3xl font-bold">Danh sách Gia sư</h1>
            <p className="text-muted-foreground">
               Khám phá các gia sư hàng đầu của chúng tôi.
            </p>
         </div>

         {/* Hiển thị danh sách gia sư */}
         <TutorListPage />
      </div>
   );
}
