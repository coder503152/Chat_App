import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Calendar, ShieldCheck } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-base-200/50">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-base-100 rounded-3xl border border-base-300 shadow-xl overflow-hidden space-y-6">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 relative flex items-end justify-center pb-0">
            <div className="absolute inset-0 bg-base-100/10 backdrop-blur-2xs"></div>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center -mt-16 relative z-10 px-6 space-y-3">
            <div className="relative group">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-base-100 shadow-xl bg-base-200"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-1 right-1 
                  bg-primary text-primary-content hover:scale-110
                  p-2.5 rounded-full cursor-pointer 
                  transition-all duration-200 shadow-md
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
                title="Change profile photo"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{authUser?.fullName}</h1>
              <p className="text-xs text-base-content/60">
                {isUpdatingProfile ? "Uploading photo..." : "Click camera button to upload custom photo"}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-1.5">
                <div className="text-xs font-semibold text-base-content/60 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </div>
                <p className="text-sm font-medium text-base-content">{authUser?.fullName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-1.5">
                <div className="text-xs font-semibold text-base-content/60 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </div>
                <p className="text-sm font-medium text-base-content truncate">{authUser?.email}</p>
              </div>
            </div>

            {/* Account Metadata */}
            <div className="bg-base-200/40 rounded-2xl p-5 border border-base-300 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-base-content">
                <ShieldCheck className="size-4 text-primary" />
                Account Overview
              </h2>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-base-300/60">
                  <span className="text-base-content/70 flex items-center gap-2">
                    <Calendar className="size-3.5 text-base-content/40" /> Member Since
                  </span>
                  <span className="font-mono text-base-content/90 font-medium">
                    {authUser?.createdAt?.split("T")[0] || "Recently"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-base-content/70">Account Status</span>
                  <span className="badge badge-xs badge-success gap-1 px-2.5 py-2 font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;

