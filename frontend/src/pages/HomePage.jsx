import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen w-full bg-base-100 pt-16 flex overflow-hidden">
      {/* Sidebar - visible full width on mobile when no user selected, or side-by-side on desktop */}
      <div className={`w-full lg:w-80 xl:w-96 h-full shrink-0 min-w-0 overflow-hidden ${selectedUser ? "hidden lg:flex" : "flex"}`}>
        <Sidebar />
      </div>

      {/* Chat Container or Welcome Screen - visible full width on mobile when user selected */}
      <div className={`w-full lg:flex-1 h-full min-w-0 flex flex-col overflow-hidden ${!selectedUser ? "hidden lg:flex" : "flex"}`}>
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};

export default HomePage;
