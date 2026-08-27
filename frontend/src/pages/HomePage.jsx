import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen bg-base-200/90 relative overflow-hidden flex items-center justify-center pt-16 pb-4 px-2 sm:px-4">
      {/* Background ambient lighting blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="w-full max-w-6xl h-[calc(100vh-5rem)] z-10">
        <div className="bg-base-100/90 backdrop-blur-xl rounded-2xl border border-base-300 shadow-2xl w-full h-full overflow-hidden flex">
          <Sidebar />

          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};
export default HomePage;

