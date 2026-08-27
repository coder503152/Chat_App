import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOnline && matchesSearch;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100/50">
      {/* Header section */}
      <div className="border-b border-base-300 w-full p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <span className="font-semibold text-sm hidden lg:block">Contacts</span>
          </div>
          <span className="badge badge-sm badge-primary hidden lg:inline-flex font-mono">
            {users.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative hidden lg:block">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-xs w-full pl-9 pr-7 bg-base-200/60 focus:bg-base-100 border-base-300 focus:outline-none rounded-lg text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Online filter toggle */}
        <div className="hidden lg:flex items-center justify-between text-xs pt-1">
          <label className="cursor-pointer flex items-center gap-2 text-base-content/70 hover:text-base-content transition-colors select-none">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary"
            />
            <span>Show online only</span>
          </label>
          <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            {Math.max(0, onlineUsers.length - 1)} online
          </span>
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto w-full py-2 px-2 space-y-1">
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isOnline = onlineUsers.includes(user._id);
          const unreadCount = unreadCounts[user._id] || 0;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-2.5 flex items-center gap-3 rounded-xl transition-all duration-200 text-left relative group
                ${
                  isSelected
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm font-medium"
                    : "hover:bg-base-200/80 text-base-content/80 hover:text-base-content"
                }
              `}
            >
              <div className="relative mx-auto lg:mx-0 shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-11 object-cover rounded-full border border-base-300"
                />
                {isOnline && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-emerald-500 
                    rounded-full ring-2 ring-base-100 animate-pulse"
                  />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-content text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-base-100 lg:hidden shadow-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              {/* User info - visible on larger screens */}
              <div className="hidden lg:flex items-center justify-between min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{user.fullName}</div>
                  <div className="text-xs flex items-center gap-1 opacity-70">
                    {isOnline ? (
                      <span className="text-emerald-500 font-medium">Online</span>
                    ) : (
                      <span className="text-base-content/50">Offline</span>
                    )}
                  </div>
                </div>

                {unreadCount > 0 && (
                  <span className="badge badge-primary badge-sm font-bold text-[10px] shrink-0 shadow-xs animate-scaleUp">
                    {unreadCount > 9 ? "9+" : `${unreadCount} new`}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-xs text-base-content/50 py-8 px-4">
            No contacts found
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

