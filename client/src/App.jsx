import Login from "./pages/Login"
import HeroSection from "./pages/student/herosection"
import ProfilePage from "./pages/student/profilepage"
import MainLayout from "./layout/MainLayout"
import { createBrowserRouter } from "react-router-dom"
import { RouterProvider, useNavigate } from "react-router"
import MyLearning from "./pages/student/MyLearning"
import AdminLayout from "./pages/admin/AdminLayout"
import Dashboard from "./pages/admin/Dashbaord"
import CourseTable from "./pages/admin/course/CourseTable"
import AddCourse from "./pages/admin/course/AddCourse"
import EditCourse from "./pages/admin/course/EditCourse"
import CreateLectures from "./pages/admin/lecture/CreateLectures"
import EditLecture from "./pages/admin/lecture/EditLecture"
import CourseContent from "./pages/course/CourseContent"
import EnrolledCourseLectures from "./pages/student/EnrolledCourseLectures"
import Homepage from "./pages/homepage"
import CertificateDemo from "./pages/student/CertificateDemo"
import BecomeInstructor from "./pages/student/BecomeInstructor"
import RoleRoute from "./extensions/RoleRoute"
import UnauthorizedAccess from "./components/UnauthorizedAccess"
import { useDispatch } from "react-redux"
import { fetchUser } from "./features/authslice"
import { useEffect } from "react"
import ExplorePage from "./pages/student/ExplorePage"
import ManageUsers from "./pages/admin/ManageUsers"
import Revenue from "./pages/admin/Revenue"
import Wallet from "./pages/admin/Wallet"
import ChatPage from "./pages/student/ChatPage"
import CourseChat from "./pages/chat/CourseChat"
import Reputation from "./pages/admin/Reputation"

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: < Homepage />
      },
      {
        path: "/unauthorized",
        element: < UnauthorizedAccess />
      },
      {
        path: "/become-instructor",
        element: <RoleRoute allowedRole="student" redirectTo="/"><BecomeInstructor /></RoleRoute>
      },
      {
        path: "profile",
        element: <ProfilePage />
      },
      {
        path: "my-courses",
        element: <RoleRoute allowedRole="student"><MyLearning /></RoleRoute>
      },
      {
        path: "course/:courseId",
        element: <CourseContent />
      },
      // {
      //   path: "/chat/:courseId",
      //   element: <RoleRoute allowedRole="student"><CourseChat /></RoleRoute>
      // },
      {
        path: "/courses",
        element: <ExplorePage />
      },




      // Admin Routes
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: <RoleRoute allowedRole="instructor"><Dashboard /></RoleRoute>
          },
          {
            path: "courses",
            element: <RoleRoute allowedRole="instructor"><CourseTable /></RoleRoute>
          },
          {
            path: "courses/create",
            element: <RoleRoute allowedRole="instructor"><AddCourse /></RoleRoute>
          },
          {
            path: "courses/edit/:courseId",
            element: <RoleRoute allowedRole="instructor"><EditCourse /></RoleRoute>
          },
          {
            path: "courses/edit/:courseId/lectures",
            element: <RoleRoute allowedRole="instructor"><CreateLectures /></RoleRoute>
          },
          {
            path: "courses/edit/:courseId/lectures/:lectureId",
            element: <RoleRoute allowedRole="instructor"><EditLecture /></RoleRoute>
          },
          {
            path: "users",
            element: <RoleRoute allowedRole="instructor"><ManageUsers /></RoleRoute>
          },
          {
            path: "revenue",
            element: <RoleRoute allowedRole="instructor"><Revenue /></RoleRoute>
          },
          {
            path: "wallet",
            element: <RoleRoute allowedRole="instructor"><Wallet /></RoleRoute>
          },
          {
            path: "reputation",
            element: <RoleRoute allowedRole="instructor"><Reputation /></RoleRoute>
          }
        ]

      }

    ],


  },
  {
    path: "/course-progress/:courseId",
    element: <RoleRoute allowedRole="student"><EnrolledCourseLectures /></RoleRoute>
  },
  {
    path: "/chat/:courseId",
    element: <RoleRoute allowedRole="student"><CourseChat /></RoleRoute>
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "register",
    element: <Login />
  },
  {
    path: "/certificate",
    element: <CertificateDemo />
  }

]);




function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser()); // Auto-login after refresh
  }, [dispatch]);
  return (
    <>
      <main>
        <RouterProvider router={appRouter} />
      </main>
      {/* <Navbar/> */}


      {/* <ProfilePage/> */}
      {/* <MyCourses /> */}
      {/* <AdminProfilePage/> */}
      {/* <Sellerdashboard/> */}
      {/* <Login /> */}
    </>

  )
}

export default App
