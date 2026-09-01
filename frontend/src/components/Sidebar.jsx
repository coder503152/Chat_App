import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X } from "lucide-react";
import { formatSidebarTime } from "../lib/utils";


const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts, lastMessageTimes, lastMessageTexts, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();


  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const onlineContactsCount = users.filter((u) => onlineUsers.includes(u._id)).length;

  const filteredUsers = users
    .filter((user) => {
      const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
      const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesOnline && matchesSearch;
    })
    .sort((a, b) => {
      const unreadA = unreadCounts[a._id] || 0;
      const unreadB = unreadCounts[b._id] || 0;

      if (unreadB !== unreadA) {
        return unreadB - unreadA;
      }

      const timeA = lastMessageTimes[a._id] ? new Date(lastMessageTimes[a._id]).getTime() : 0;
      const timeB = lastMessageTimes[b._id] ? new Date(lastMessageTimes[b._id]).getTime() : 0;

      return timeB - timeA;
    });


  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full border-r border-base-300 flex flex-col min-w-0 overflow-hidden transition-all duration-200 bg-base-100/50">

      {/* Header section */}
      <div className="border-b border-base-300 w-full p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <span className="font-semibold text-sm">Contacts</span>
          </div>
         
        </div>

        {/* Search Input */}
        <div className="relative block">
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
        <div className="flex items-center justify-between text-xs pt-1">
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
            {onlineContactsCount} online
          </span>
        </div>
      </div>


      {/* User list */}
      <div className="overflow-y-auto overscroll-contain w-full py-2 px-2 space-y-1">

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
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-sm font-medium"
                    : unreadCount > 0
                    ? "bg-primary/10 border border-primary/40 text-base-content font-semibold shadow-md ring-1 ring-primary/20"
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
                    rounded-full ring-2 ring-base-100"
                  />
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm truncate">
                    {user.fullName}
                  </span>
                  {lastMessageTimes[user._id] && (
                    <span className="text-[10px] text-base-content/40 shrink-0 font-medium ml-2">
                      {formatSidebarTime(lastMessageTimes[user._id])}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs truncate max-w-[140px] block">
                    {typingUsers[user._id] ? (
                      <span className="text-primary font-semibold flex items-center gap-1 animate-pulse">
                        typing...
                      </span>
                    ) : unreadCount > 0 ? (
                      <span className="font-bold text-accent truncate">
                        {lastMessageTexts[user._id] || "New message"}
                      </span>
                    ) : lastMessageTexts[user._id] ? (
                      <span className="text-base-content/50 truncate block">
                        {lastMessageTexts[user._id]}
                      </span>
                    ) : isOnline ? (
                      <span className="text-emerald-500 font-medium">Online</span>
                    ) : (
                      <span className="text-base-content/40">Offline</span>
                    )}
                  </span>

                  {unreadCount > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] shrink-0 shadow-md flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
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

