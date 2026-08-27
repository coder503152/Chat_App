import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Check, Palette } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How do you like the new UI design?", isSent: false },
  { id: 2, content: "It looks super clean and modern! Love the glassmorphism and colors.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20 pb-12 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="size-5 text-primary" /> Theme Selector
          </h2>
          <p className="text-sm text-base-content/70">
            Customize the look and feel of your chat interface. Select from 30+ DaisyUI themes.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {THEMES.map((t) => {
            const isActive = theme === t;
            return (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all border
                  ${
                    isActive
                      ? "bg-base-200 border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-base-100/60 border-base-300 hover:bg-base-200/50 hover:border-base-300"
                  }
                `}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-8 w-full rounded-xl overflow-hidden shadow-2xs" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1 bg-base-100">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-2xs">
                      <Check className="size-4 text-primary" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center flex items-center justify-center gap-1">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Preview Section */}
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-semibold tracking-tight">Live Chat Preview</h3>
          <div className="rounded-2xl border border-base-300 overflow-hidden bg-base-100 shadow-xl">
            <div className="p-4 sm:p-6 bg-base-200/40">
              <div className="max-w-lg mx-auto">
                {/* Mock Chat UI */}
                <div className="bg-base-100 rounded-2xl shadow-md overflow-hidden border border-base-300">
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-base-300 bg-base-100/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-sm">
                          J
                        </div>
                        <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-base-100 animate-pulse"></span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">John Doe</h3>
                        <p className="text-[11px] text-emerald-500 font-medium">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-3 min-h-[180px] max-h-[180px] overflow-y-auto bg-base-100/50">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`
                            max-w-[80%] rounded-2xl p-3 shadow-xs text-sm leading-relaxed
                            ${
                              message.isSent
                                ? "bg-primary text-primary-content rounded-tr-xs"
                                : "bg-base-200 text-base-content border border-base-300 rounded-tl-xs"
                            }
                          `}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`
                              text-[10px] mt-1 opacity-70 font-mono text-right
                            `}
                          >
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-base-300 bg-base-100/80">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 text-xs h-9 rounded-xl focus:outline-none"
                        placeholder="Type a message..."
                        value="This is a preview of the selected theme"
                        readOnly
                      />
                      <button className="btn btn-primary btn-sm h-9 min-h-0 rounded-xl px-3">
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;

