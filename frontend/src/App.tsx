import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notifications/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const delay = () => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const { data: authenticatedUser, isLoading } = useQuery({
    queryKey: ["authenticatedUser"],
    queryFn: async () => {
		try {  
			const response = await fetch("/api/auth/me");  
			const userData = await response.json(); 
			if(userData.error){
				return null;
			}
			if (!response.ok) {  
				throw new Error(userData.message || 'Failed to fetch user data.'); 
			}  
			await delay(); 
			return userData;  
		} catch (error:any) {  
			toast.error(error.message || 'An error occurred.');  
			throw error; 
		} 
    },
	retry:false,
  });
  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <>
      <div className="flex max-w-6xl mx-auto">
        {authenticatedUser&&<Sidebar />}
        <Routes>
          <Route
            path="/"
            element={
              authenticatedUser ? <HomePage /> : <Navigate to={"/login"} />
            }
          />
          <Route
            path="/signup"
            element={
              !authenticatedUser ? <SignUpPage /> : <Navigate to={"/"} />
            }
          />
          <Route
            path="/login"
            element={!authenticatedUser ? <LoginPage /> : <Navigate to={"/"} />}
          />
          <Route
            path="/notifications"
            element={
              authenticatedUser ? (
                <NotificationPage />
              ) : (
                <Navigate to={"/login"} />
              )
            }
          />
          <Route
            path="/profile/:username"
            element={
              authenticatedUser ? <ProfilePage /> : <Navigate to={"/login"} />
            }
          />
        </Routes>
        {authenticatedUser&&<RightPanel />}
        <Toaster />
      </div>
    </>
  );
}

export default App;
