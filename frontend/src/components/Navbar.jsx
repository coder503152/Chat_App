import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={location.pathname === "/settings" ? "/" : "/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              ${location.pathname === "/settings" ? "btn-primary" : "btn-ghost"}
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to={location.pathname === "/profile" ? "/" : "/profile"}
                  className={`btn btn-sm gap-2 transition-colors ${
                    location.pathname === "/profile" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt={authUser.fullName || "User"}
                    className="size-5 rounded-full object-cover border border-base-content/20"
                  />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {authUser.fullName?.trim() || "Profile"}
                  </span>
                </Link>

                <button
                  className="btn btn-sm btn-ghost gap-2 text-error hover:bg-error/10"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
