import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  return (
    <header
      className="bg-base-100/80 border-b border-base-300/80 fixed w-full top-0 z-40 
    backdrop-blur-md transition-all shadow-sm"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-all group">
              <div className="size-9 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-base-100 rounded-[10px] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
                  Chatty
                  
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={location.pathname === "/settings" ? "/" : "/settings"}
              className={`btn btn-sm gap-2 transition-all ${
                location.pathname === "/settings"
                  ? "btn-primary shadow-sm"
                  : "btn-ghost hover:bg-base-200"
              }`}
              title={location.pathname === "/settings" ? "Close settings" : "Open settings"}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to={location.pathname === "/profile" ? "/" : "/profile"}
                  className={`btn btn-sm gap-2 transition-all ${
                    location.pathname === "/profile"
                      ? "btn-primary shadow-sm"
                      : "btn-ghost hover:bg-base-200"
                  }`}
                  title={location.pathname === "/profile" ? "Close profile" : "Open profile"}
                >
                  <div className="relative size-5 rounded-full overflow-hidden border border-base-content/20">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden sm:inline font-medium">{authUser.fullName?.split(" ")[0]}</span>
                </Link>

                <button
                  className="btn btn-sm btn-ghost hover:btn-error/10 hover:text-error gap-2 transition-colors"
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

