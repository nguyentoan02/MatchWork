import ProtectedRoute from "./ProtectedRoute";
import OverviewPage from "../pages/dashboard/OverviewPage";
import Application from "@/pages/Jobseeker/Application";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";
import StudentLayout from "@/layouts/StudentLayout";
import ProfileForm from "@/components/user/ProfileForm";
import StudentProfile from "@/pages/Student/StudentProfile";
export const studentRoutes = {
    element: (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentLayout />
        </ProtectedRoute>
    ),
    children: [
        { path: "/student/dashboard", element: <OverviewPage /> },
        {
            path: "/student/applications",
            element: <Application />,
        },
        {
            path: "/profile/change-password",
            element: <ChangePasswordPage />,
        },
        {
            path: "/student/profile",
            element: <ProfileForm />,
        },
        {
            path: "/student/student-profile",
            element: <StudentProfile />,
        },
    ],
};
