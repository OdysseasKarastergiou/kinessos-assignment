import LogoutButton from "@/app/components/LogoutButton";
import BusinessManagement from "../BusinessManagement";
export default function AdminPanel() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black-100 p-8">
        <div className="min-w-80 sm:min-w-160 text-xs sm:text-lg text-indigo-600 max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Panel</h2>
          <BusinessManagement/>
          <LogoutButton/>
        </div>
      </div>
    );
  }