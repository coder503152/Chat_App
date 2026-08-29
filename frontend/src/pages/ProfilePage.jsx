import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Calendar, ShieldCheck, Check, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [email, setEmail] = useState(authUser?.email || "");

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setEmail(authUser.email || "");
    }
  }, [authUser]);

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

  const handleEditNameClick = () => {
    setIsEditingName(true);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        const len = nameInputRef.current.value.length;
        nameInputRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  const handleEditEmailClick = () => {
    setIsEditingEmail(true);
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
        const len = emailInputRef.current.value.length;
        emailInputRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  const handleCancelName = () => {
    setFullName(authUser?.fullName || "");
    setIsEditingName(false);
  };

  const handleCancelEmail = () => {
    setEmail(authUser?.email || "");
    setIsEditingEmail(false);
  };

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    const res = await updateProfile({ fullName: fullName.trim() });
    if (res !== false) {
      setIsEditingName(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!email.trim()) {
      toast.error("Email Address is required");
      return;
    }
    const res = await updateProfile({ email: email.trim() });
    if (res !== false) {
      setIsEditingEmail(false);
    }
  };

  const showNameSave = isEditingName || fullName.trim() !== (authUser?.fullName || "");
  const showEmailSave = isEditingEmail || email.trim() !== (authUser?.email || "");

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
                {isUpdatingProfile ? "Updating profile..." : "Click camera button to upload custom photo"}
              </p>
            </div>
          </div>

          {/* Edit Name & Email Form */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-base-content/70 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </span>
                </label>

                <div className="relative flex items-center">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setIsEditingName(true);
                    }}
                    onFocus={() => setIsEditingName(true)}
                    placeholder="Enter your full name"
                    className="input input-bordered w-full pr-28 bg-base-200/50 focus:bg-base-100 focus:outline-none rounded-xl text-sm font-medium transition-all"
                  />

                  <div className="absolute right-2 flex items-center gap-1">
                    {showNameSave ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveName}
                          disabled={isUpdatingProfile}
                          className="btn btn-xs btn-primary gap-1 rounded-lg shadow-sm"
                          title="Save name"
                        >
                          {isUpdatingProfile ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <>
                              <Check className="size-3" /> Save
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelName}
                          disabled={isUpdatingProfile}
                          className="btn btn-xs btn-ghost btn-circle text-error hover:bg-error/15 transition-colors"
                          title="Cancel edit"
                        >
                          <X className="size-3.5 text-error" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEditNameClick}
                        className="p-1.5 text-base-content/50 hover:text-primary hover:bg-base-200 rounded-lg transition-colors cursor-pointer"
                        title="Click to edit name"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Address Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-base-content/70 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address
                  </span>
                </label>

                <div className="relative flex items-center">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEditingEmail(true);
                    }}
                    onFocus={() => setIsEditingEmail(true)}
                    placeholder="Enter your email address"
                    className="input input-bordered w-full pr-28 bg-base-200/50 focus:bg-base-100 focus:outline-none rounded-xl text-sm font-medium transition-all"
                  />

                  <div className="absolute right-2 flex items-center gap-1">
                    {showEmailSave ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveEmail}
                          disabled={isUpdatingProfile}
                          className="btn btn-xs btn-primary gap-1 rounded-lg shadow-sm"
                          title="Save email"
                        >
                          {isUpdatingProfile ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <>
                              <Check className="size-3" /> Save
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEmail}
                          disabled={isUpdatingProfile}
                          className="btn btn-xs btn-ghost btn-circle text-error hover:bg-error/15 transition-colors"
                          title="Cancel edit"
                        >
                          <X className="size-3.5 text-error" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEditEmailClick}
                        className="p-1.5 text-base-content/50 hover:text-primary hover:bg-base-200 rounded-lg transition-colors cursor-pointer"
                        title="Click to edit email"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Metadata */}


            <div className="bg-base-200/40 rounded-2xl p-5 border border-base-300 space-y-3 pt-4">
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




