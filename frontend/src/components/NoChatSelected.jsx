import { MessageSquare, Sparkles, Video, ShieldCheck, Zap } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-base-100/40 via-base-100/60 to-base-200/40 backdrop-blur-2xl">
      <div className="max-w-lg text-center space-y-6 animate-fadeIn">
        {/* Animated Hero Icon */}
        <div className="flex justify-center mb-2">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative size-20 sm:size-24 rounded-3xl bg-base-100 border border-base-300 shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <MessageSquare className="size-10 sm:size-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Welcome Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Welcome to Chatty!
          </h2>
          <p className="text-sm sm:text-base text-base-content/60 max-w-sm mx-auto font-normal">
            Select a contact from the left sidebar to start real-time messaging
          </p>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-4 text-xs">
          <div className="flex items-center gap-2 p-3 bg-base-200/60 border border-base-300/80 rounded-2xl text-left backdrop-blur-sm shadow-xs">
            <Zap className="size-4 text-amber-500 shrink-0" />
            <div>
              <div className="font-semibold text-base-content">Instant Socket</div>
              <div className="text-[10px] text-base-content/50">Real-time chat delivery</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-base-200/60 border border-base-300/80 rounded-2xl text-left backdrop-blur-sm shadow-xs">
            <Video className="size-4 text-emerald-500 shrink-0" />
            <div>
              <div className="font-semibold text-base-content">HD Media Sharing</div>
              <div className="text-[10px] text-base-content/50">Photos & 50MB Videos</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-base-200/60 border border-base-300/80 rounded-2xl text-left backdrop-blur-sm shadow-xs">
            <Sparkles className="size-4 text-primary shrink-0" />
            <div>
              <div className="font-semibold text-base-content">AI Companion</div>
              <div className="text-[10px] text-base-content/50">Smart summary & replies</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-base-200/60 border border-base-300/80 rounded-2xl text-left backdrop-blur-sm shadow-xs">
            <ShieldCheck className="size-4 text-cyan-500 shrink-0" />
            <div>
              <div className="font-semibold text-base-content">End-to-End Feel</div>
              <div className="text-[10px] text-base-content/50">Read receipts & persistent DB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;

