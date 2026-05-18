import { Icon } from "@iconify/react";

export function Tasks() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-sans selection:bg-primary/30 overflow-x-hidden">
      <header className="p-6 pt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-heading text-4xl tracking-tight text-foreground">To-Doodles</h1>
            <div className="flex gap-4 mt-2">
              <p className="text-xs font-black text-primary uppercase">8 Pending</p>
              <p className="text-xs font-black text-accent uppercase">14 Done</p>
            </div>
          </div>
          <div className="w-24 h-24 -mb-4 -mr-4">
            <img
              src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/qdW4O1gNnjG/components/c7SFzx0TfaL.png"
              alt="Tasks character"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="relative">
          <Icon
            icon="solar:magnifer-bold-duotone"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Find a task..."
            className="w-full bg-card border-4 border-border rounded-2xl py-3 pl-12 pr-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-secondary shadow-[4px_4px_0px_theme(colors.border)]"
          />
        </div>
      </header>
      <main className="px-6 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-2xl tracking-wide">Today</h2>
            <span className="bg-secondary px-3 py-1 border-2 border-border rounded-full text-[10px] font-black shadow-[2px_2px_0px_theme(colors.border)] transform rotate-2">
              URGENT-ISH
            </span>
          </div>
          <div className="space-y-3">
            <div className="group flex items-center gap-4 bg-card border-4 border-border p-4 rounded-2xl shadow-[4px_4px_0px_theme(colors.border)] transition-all active:translate-y-1 active:shadow-none">
              <button className="w-8 h-8 rounded-lg border-4 border-border bg-white flex items-center justify-center shrink-0 hover:bg-secondary/20 transition-colors" />
              <div className="flex-1">
                <p className="font-bold text-base leading-tight">Buy oat milk for coffee</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">
                  Captured via Voice • 10:42 AM
                </p>
              </div>
              <Icon icon="solar:fire-bold-duotone" className="text-destructive text-xl" />
            </div>
            <div className="group flex items-center gap-4 bg-card border-4 border-border p-4 rounded-2xl shadow-[4px_4px_0px_theme(colors.border)] transition-all active:translate-y-1 active:shadow-none -rotate-1">
              <button className="w-8 h-8 rounded-lg border-4 border-border bg-white flex items-center justify-center shrink-0 hover:bg-secondary/20 transition-colors" />
              <div className="flex-1">
                <p className="font-bold text-base leading-tight">Call Mom for her birthday!</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">
                  Due Today
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </section>
        <section>
          <h2 className="font-heading text-2xl tracking-wide mb-4">Upcoming</h2>
          <div className="space-y-3">
            <div className="group flex items-center gap-4 bg-muted/30 border-4 border-border/50 p-4 rounded-2xl opacity-70 scale-[0.98]">
              <button className="w-8 h-8 rounded-lg border-4 border-border bg-accent flex items-center justify-center shrink-0">
                <Icon icon="solar:check-read-bold" className="text-white text-lg" />
              </button>
              <div className="flex-1">
                <p className="font-bold text-base leading-tight line-through text-muted-foreground">
                  Pick up dry cleaning
                </p>
                <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">
                  Yesterday
                </p>
              </div>
            </div>
            <div className="group flex items-center gap-4 bg-card border-4 border-border p-4 rounded-2xl shadow-[4px_4px_0px_theme(colors.border)] transition-all active:translate-y-1 active:shadow-none rotate-1">
              <button className="w-8 h-8 rounded-lg border-4 border-border bg-white flex items-center justify-center shrink-0 hover:bg-secondary/20 transition-colors" />
              <div className="flex-1">
                <p className="font-bold text-base leading-tight">Research new app ideas</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">
                  Friday
                </p>
              </div>
              <Icon icon="solar:calendar-bold-duotone" className="text-accent text-xl" />
            </div>
          </div>
        </section>
      </main>
      <nav className="fixed bottom-6 left-6 right-6 bg-card border-4 border-border rounded-3xl p-3 shadow-[4px_4px_0px_theme(colors.border)] z-50 flex items-center justify-around">
        <a
          href="#"
          className="flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
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
          className="flex flex-col items-center justify-center p-2 text-primary relative group"
        >
          <div className="absolute -bottom-2 w-10 h-1.5 bg-primary rounded-full skew-x-12 transform" />
          <Icon
            icon="solar:check-square-bold"
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
