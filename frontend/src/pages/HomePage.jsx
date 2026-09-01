import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200/90 relative overflow-hidden flex items-center justify-center pt-16 pb-2 sm:pb-4 px-0 sm:px-4">
      {/* Background ambient lighting blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="w-full max-w-6xl h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] z-10">
        <div className="bg-base-100/90 backdrop-blur-xl sm:rounded-2xl border-0 sm:border border-base-300 shadow-2xl w-full h-full overflow-hidden flex">
          {/* Sidebar - visible full width on mobile when no user selected, or side-by-side on desktop */}
          <div className={`w-full lg:w-80 h-full shrink-0 min-w-0 overflow-hidden ${selectedUser ? "hidden lg:flex" : "flex"}`}>
            <Sidebar />
          </div>

          {/* Chat Container or Welcome Screen - visible full width on mobile when user selected */}
          <div className={`w-full lg:flex-1 h-full min-w-0 flex flex-col overflow-hidden ${!selectedUser ? "hidden lg:flex" : "flex"}`}>
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

