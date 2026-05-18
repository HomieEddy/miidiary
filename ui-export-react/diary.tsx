import { Icon } from "@iconify/react";

export function Diary() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-sans selection:bg-primary/30 overflow-x-hidden">
      <header className="p-6 pt-12 relative">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-heading text-4xl tracking-tight text-foreground">My Diary</h1>
            <p className="font-bold text-muted-foreground mt-1">124 moments captured</p>
          </div>
          <div className="w-20 h-20 -mb-4 -mr-2">
            <img
              src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/qdW4O1gNnjG/components/cH8JMyydsyO.png"
              alt="Diary character"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Icon
              icon="solar:magnifer-bold-duotone"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search memories..."
              className="w-full bg-card border-4 border-border rounded-2xl py-3 pl-12 pr-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-[4px_4px_0px_theme(colors.border)]"
            />
          </div>
          <button className="bg-secondary p-3 border-4 border-border rounded-2xl shadow-[4px_4px_0px_theme(colors.border)] active:translate-y-1 active:shadow-none transition-all">
            <Icon
              icon="solar:filter-bold-duotone"
              className="text-2xl text-secondary-foreground block"
            />
          </button>
        </div>
      </header>
      <main className="px-6 space-y-8 relative">
        <div className="absolute left-10 top-0 bottom-0 w-1 bg-border/20 rounded-full" />
        <section className="space-y-4">
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-primary border-4 border-border w-8 h-8 rounded-full shadow-[2px_2px_0px_theme(colors.border)] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <h3 className="font-heading text-xl text-foreground">Today</h3>
          </div>
          <div className="pl-12 space-y-4">
            <div className="bg-card border-4 border-border rounded-[2rem] p-5 shadow-[4px_4px_0px_theme(colors.border)] relative group">
              <button className="absolute top-4 right-4 text-primary active:scale-125 transition-transform">
                <Icon icon="solar:heart-bold" className="text-2xl" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="solar:clock-circle-bold-duotone" className="text-muted-foreground" />
                <span className="text-xs font-black text-muted-foreground uppercase">10:42 AM</span>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                Finally tried that new matcha place! It was way too sweet but the aesthetic was
                10/10. Definitely going back for the vibes alone.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-secondary/20 text-secondary-foreground text-[10px] font-bold px-2 py-1 rounded-lg border border-secondary">
                  #CoffeeShop
                </span>
                <span className="bg-accent/20 text-accent-foreground text-[10px] font-bold px-2 py-1 rounded-lg border border-accent">
                  #Vibes
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-secondary border-4 border-border w-8 h-8 rounded-full shadow-[2px_2px_0px_theme(colors.border)] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <h3 className="font-heading text-xl text-foreground">Yesterday</h3>
          </div>
          <div className="pl-12 space-y-4">
            <div className="bg-card border-4 border-border rounded-[2rem] p-5 shadow-[4px_4px_0px_theme(colors.border)] relative -rotate-1">
              <button className="absolute top-4 right-4 text-muted hover:text-primary transition-colors">
                <Icon icon="solar:heart-bold" className="text-2xl" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="solar:clock-circle-bold-duotone" className="text-muted-foreground" />
                <span className="text-xs font-black text-muted-foreground uppercase">4:15 PM</span>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                Walking through the park today made me realize how much I missed the sound of dry
                leaves crunching. Autumn is officially here!
              </p>
            </div>
            <div className="bg-card border-4 border-border rounded-[2rem] p-5 shadow-[4px_4px_0px_theme(colors.border)] relative rotate-1">
              <button className="absolute top-4 right-4 text-muted hover:text-primary transition-colors">
                <Icon icon="solar:heart-bold" className="text-2xl" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="solar:clock-circle-bold-duotone" className="text-muted-foreground" />
                <span className="text-xs font-black text-muted-foreground uppercase">8:00 AM</span>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                Dreamt about a giant cat wearing a tuxedo. It was very polite.
              </p>
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
          className="flex flex-col items-center justify-center p-2 text-primary relative group"
        >
          <div className="absolute -bottom-2 w-10 h-1.5 bg-primary rounded-full skew-x-12 transform" />
          <Icon
            icon="solar:book-bookmark-minimalistic-bold"
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
