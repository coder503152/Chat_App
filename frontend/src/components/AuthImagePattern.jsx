import { Sparkles, Zap, ShieldCheck, MessageCircle, Bot, Users } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  const features = [
    {
      icon: Sparkles,
      title: "AI Power",
      color: "text-amber-400 bg-amber-400/10",
      desc: "Smart summaries & suggested replies",
    },
    {
      icon: Zap,
      title: "Real-time",
      color: "text-emerald-400 bg-emerald-400/10",
      desc: "Instant Socket.io live updates",
    },
    {
      icon: ShieldCheck,
      title: "Secure",
      color: "text-blue-400 bg-blue-400/10",
      desc: "JWT Auth & Protected data",
    },
    {
      icon: MessageCircle,
      title: "Rich Chat",
      color: "text-purple-400 bg-purple-400/10",
      desc: "Text, attachments & editing",
    },
    {
      icon: Bot,
      title: "Q&A Agent",
      color: "text-rose-400 bg-rose-400/10",
      desc: "Ask AI anything about your chat",
    },
    {
      icon: Users,
      title: "Presence",
      color: "text-cyan-400 bg-cyan-400/10",
      desc: "See who is online instantly",
    },
  ];

  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-base-200/50 p-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md text-center z-10 space-y-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-base-100/80 backdrop-blur-md border border-base-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center space-y-2 group"
              >
                <div className={`p-2.5 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="size-5" />
                </div>
                <div className="font-semibold text-xs text-base-content">{item.title}</div>
                <div className="text-[10px] text-base-content/50 leading-tight hidden sm:block">
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-base-content/60 leading-relaxed">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;

