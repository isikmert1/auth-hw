import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import { User, Settings, Edit } from 'lucide-react'; // Import icons

// Define an interface for the profile data structure
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
}

const Home = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get the email of the currently logged-in user
    const currentUserEmail = localStorage.getItem('currentUserEmail');

    if (!currentUserEmail) {
      console.log("No current user email found, redirecting to login.");
      navigate('/login');
      return; // Stop execution if no user email
    }

    // 2. Get the users database
    const usersDatabaseStr = localStorage.getItem('usersDatabase');
    const usersDatabase = usersDatabaseStr ? JSON.parse(usersDatabaseStr) : {};

    // 3. Retrieve the profile for the current user
    const userProfile = usersDatabase[currentUserEmail]?.profile;

    if (userProfile) {
      setProfile(userProfile);
    } else {
      // Handle case where email is set but user data is missing/corrupt
      console.error(`Profile data not found for ${currentUserEmail}, redirecting to login.`);
      localStorage.removeItem('currentUserEmail'); // Clear potentially invalid email
      navigate('/login');
    }

  }, [navigate]); // Dependency array includes navigate

  const handleLogout = () => {
    // Only remove the current user email indicator
    localStorage.removeItem('currentUserEmail');
    console.log("Current user email cleared from localStorage.");
    // Navigate back to login page
    navigate('/login');
  };

  // Display loading or placeholder if profile hasn't loaded yet
  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>; // Or a spinner component
  }

  // Format Date of Birth
  const formattedDob = `${profile.birthDay.padStart(2, '0')}/${profile.birthMonth.padStart(2, '0')}/${profile.birthYear}`;
  // Get initials for Avatar Fallback
  const initials = `${profile.firstName?.charAt(0) ?? ''}${profile.lastName?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">

        {/* Header Section with Avatar */}
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 mb-4"> 
            {/* AvatarImage can be used here if you have profile picture URLs */}
            {/* <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> */}
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {initials || <User className="h-10 w-10" />}
            </AvatarFallback>
          </Avatar>
          {/* Welcome Header - Capitalized */}
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Welcome, {profile.firstName.toUpperCase()} {profile.lastName.toUpperCase()}!
          </h1>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Box */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-100">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Email Address</h2>
            <p className="text-gray-600 break-words">{profile.email}</p>
          </div>

          {/* Date of Birth Box */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-100">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Date of Birth</h2>
            <p className="text-gray-600">{formattedDob}</p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center mt-4"> 
          <Button
            variant="destructive" // Use a destructive variant for logout
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
