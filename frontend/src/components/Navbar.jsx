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
            {!authUser && (
              <Link
                to="/settings"
                className={`btn btn-sm gap-2 transition-all ${
                  location.pathname === "/settings"
                    ? "btn-primary shadow-sm"
                    : "btn-ghost hover:bg-base-200"
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            )}

            {authUser && (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-sm gap-2 rounded-xl border border-base-300/40 hover:bg-base-200 transition-all px-2.5 sm:px-3"
                  title="Account menu"
                >
                  <div className="relative size-6 rounded-full overflow-hidden border border-primary/30 shrink-0">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-base-content hidden sm:inline">
                    {authUser.fullName?.split(" ")[0]}
                  </span>
                </div>
                
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-1.5 mt-2 shadow-xl bg-base-100/95 backdrop-blur-md rounded-2xl w-48 border border-base-300 z-50 animate-scaleUp space-y-1"
                >
                  <li className="menu-title px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-base-content/40">
                    Account Actions
                  </li>
                  
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-primary/10 hover:text-primary transition-all font-medium"
                    >
                      <User className="size-4 text-primary" />
                      Profile
                    </Link>
                  </li>
                  
                  <li>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-secondary/10 hover:text-secondary transition-all font-medium"
                    >
                      <Settings className="size-4 text-secondary" />
                      Settings
                    </Link>
                  </li>
                  
                  <div className="border-t border-base-300/60 my-1"></div>
                  
                  <li>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-error hover:bg-error/10 hover:text-error transition-all font-medium w-full text-left"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;

