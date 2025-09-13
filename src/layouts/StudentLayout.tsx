import { Outlet } from "react-router-dom";
import StudentSidebar from "@/components/studentSidebar/StudentSidebar";

const StudentLayout = () => {
   return (
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
         <div className="fixed top-0 left-0 h-full">
            <StudentSidebar />
         </div>
         <div className="flex-grow flex flex-col ml-64">
            {/* Thêm ml-64 để tạo khoảng trống cho sidebar */}
            <main className="flex-grow p-6">
               <Outlet />
            </main>
         </div>
      </div>
   );
};

export default StudentLayout;
