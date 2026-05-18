import { Icon } from "@iconify/react";

export function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-sans selection:bg-primary/30 overflow-x-hidden">
      <header className="p-6 pt-12 relative">
        <div className="relative bg-secondary border-4 border-border rounded-3xl p-6 shadow-[4px_4px_0px_theme(colors.border)] transform -rotate-2">
          <div className="absolute -top-10 -right-4 w-20 h-20">
            <img
              src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/qdW4O1gNnjG/components/tjieNgrH5Ca.png"
              alt="Cute character"
              className="w-full h-full object-contain drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]"
            />
          </div>
          <h2 className="font-heading text-xl mb-1 text-secondary-foreground tracking-wide">
            Daily Spark ✨
          </h2>
          <p className="text-sm text-secondary-foreground font-medium">
            "What made you smile today without even trying?"
          </p>
        </div>
      </header>
      <section className="flex flex-col items-center justify-center py-12">
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-primary/20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[spin_8s_linear_infinite] blur-xl scale-[1.6]" />
          <div className="absolute inset-0 bg-accent/20 rounded-[60%_40%_30%_70%/50%_40%_60%_50%] animate-[spin_10s_linear_infinite_reverse] blur-xl scale-125" />
          <button className="relative w-36 h-36 bg-primary text-primary-foreground border-4 border-border rounded-[40%_60%_70%_30%/40%_50%_60%_50%] shadow-[6px_6px_0px_theme(colors.border)] flex items-center justify-center transition-transform active:translate-y-2 active:translate-x-2 active:shadow-[0px_0px_0px_theme(colors.border)] hover:scale-105">
            <Icon
              icon="solar:microphone-3-bold-duotone"
              className="text-[5rem] animate-pulse drop-shadow-md"
            />
          </button>
        </div>
        <p className="mt-10 font-heading text-xl text-foreground/80 tracking-wide">
          Tap to record a thought
        </p>
      </section>
      <main className="px-6 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-2xl tracking-wide">Fresh Thoughts</h3>
            <button className="bg-card border-2 border-border p-2 rounded-xl shadow-[2px_2px_0px_theme(colors.border)] active:translate-y-1 active:shadow-none transition-all">
              <Icon
                icon="solar:pen-new-round-bold-duotone"
                className="text-2xl text-accent block"
              />
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-card border-4 border-border rounded-2xl p-4 shadow-[4px_4px_0px_theme(colors.border)] rotate-1 relative">
              <div className="absolute -top-3 -right-2">
                <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 border-2 border-border rounded-full transform rotate-3 shadow-[2px_2px_0px_theme(colors.border)]">
                  <Icon icon="solar:check-square-bold" className="text-sm" /> Task
                </span>
              </div>
              <p className="font-medium text-foreground pr-16 text-base">
                "Buy oat milk and don't forget to call Mom for her birthday tomorrow..."
              </p>
              <p className="text-xs text-muted-foreground mt-3 font-bold">10:42 AM</p>
            </div>
            <div className="bg-card border-4 border-border rounded-2xl p-4 shadow-[4px_4px_0px_theme(colors.border)] -rotate-1 relative">
              <div className="absolute -top-3 -right-2">
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 border-2 border-border rounded-full transform -rotate-2 shadow-[2px_2px_0px_theme(colors.border)]">
                  <Icon icon="solar:book-bookmark-bold" className="text-sm" /> Diary
                </span>
              </div>
              <p className="font-medium text-foreground pr-16 text-base">
                "Had a really amazing walk in the park today, the leaves are turning orange..."
              </p>
              <p className="text-xs text-muted-foreground mt-3 font-bold">Yesterday, 4:15 PM</p>
            </div>
            <div className="bg-card border-4 border-border rounded-2xl p-4 shadow-[4px_4px_0px_theme(colors.border)] rotate-[2deg] relative">
              <div className="absolute -top-3 -right-2">
                <span className="inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 border-2 border-border rounded-full transform rotate-1 shadow-[2px_2px_0px_theme(colors.border)]">
                  <Icon icon="solar:notes-bold" className="text-sm" /> Note
                </span>
              </div>
              <p className="font-medium text-foreground pr-16 text-base">
                "App idea: A Pomodoro timer but it grows tiny pixel art flowers."
              </p>
              <p className="text-xs text-muted-foreground mt-3 font-bold">Oct 12, 2:30 PM</p>
            </div>
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-2xl tracking-wide">Recent Digests</h3>
            <button className="bg-card border-2 border-border p-2 rounded-xl shadow-[2px_2px_0px_theme(colors.border)] active:translate-y-1 active:shadow-none transition-all">
              <Icon
                icon="solar:box-minimalistic-bold-duotone"
                className="text-2xl text-chart-4 block"
              />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 hide-scrollbar">
            <div className="snap-center shrink-0 w-64 bg-[#E3F4F4] border-4 border-border rounded-[2rem] p-6 shadow-[4px_4px_0px_theme(colors.border)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/40 rounded-full blur-xl" />
              <Icon
                icon="solar:stars-minimalistic-bold-duotone"
                className="text-5xl text-chart-4 mb-3"
              />
              <h4 className="font-heading text-xl text-foreground">Weekly Wrap-up</h4>
              <p className="text-xs text-foreground/70 font-bold mt-1">Oct 7 - Oct 13</p>
              <button className="mt-5 w-full bg-chart-4 text-white border-2 border-border px-4 py-3 rounded-2xl font-bold text-sm shadow-[2px_2px_0px_theme(colors.border)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                Open Digest
              </button>
            </div>
            <div className="snap-center shrink-0 w-64 bg-[#FFE8D6] border-4 border-border rounded-[2rem] p-6 shadow-[4px_4px_0px_theme(colors.border)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/40 rounded-full blur-xl" />
              <Icon icon="solar:moon-stars-bold-duotone" className="text-5xl text-chart-5 mb-3" />
              <h4 className="font-heading text-xl text-foreground">Monthly Reflection</h4>
              <p className="text-xs text-foreground/70 font-bold mt-1">September</p>
              <button className="mt-5 w-full bg-chart-5 text-white border-2 border-border px-4 py-3 rounded-2xl font-bold text-sm shadow-[2px_2px_0px_theme(colors.border)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                Open Digest
              </button>
            </div>
          </div>
        </section>
      </main>
      <nav className="fixed bottom-6 left-6 right-6 bg-card border-4 border-border rounded-3xl p-3 shadow-[4px_4px_0px_theme(colors.border)] z-50 flex items-center justify-around">
        <a
          href="#"
          className="flex flex-col items-center justify-center p-2 text-primary relative group"
        >
          <div className="absolute -bottom-2 w-10 h-1.5 bg-primary rounded-full skew-x-12 transform" />
          <Icon
            icon="solar:home-smile-bold-duotone"
            className="text-3xl mb-1 group-active:scale-90 transition-transform"
          />
          <span className="text-[10px] font-bold">Home</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Icon
            icon="solar:book-bookmark-minimalistic-bold-duotone"
            className="text-3xl mb-1 group-active:scale-90 transition-transform"
          />
          <span className="text-[10px] font-bold">Diary</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Icon
            icon="solar:check-square-bold-duotone"
            className="text-3xl mb-1 group-active:scale-90 transition-transform"
          />
          <span className="text-[10px] font-bold">Tasks</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Icon
            icon="solar:box-minimalistic-bold-duotone"
            className="text-3xl mb-1 group-active:scale-90 transition-transform"
          />
          <span className="text-[10px] font-bold">Digests</span>
        </a>
      </nav>
    </div>
  );
}
