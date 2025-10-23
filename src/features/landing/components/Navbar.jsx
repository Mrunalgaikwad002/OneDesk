export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-lg font-extrabold tracking-tight relative inline-block">
          <span className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-indigo-400/30 to-fuchsia-400/30 blur-md" />
          <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent drop-shadow-sm">
            OneDesk
          </span>
        </a>
        <nav className="hidden sm:flex items-center gap-5 text-sm text-gray-600">
         
        </nav>
        <div className="flex items-center gap-3">
          <a href="/login" className="hidden sm:inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-gray-50">Log in</a>
          <a href="/signup" className="inline-flex h-9 items-center rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 text-sm font-medium text-white hover:opacity-90">Sign up</a>
        </div>
      </div>
    </header>
  );
}


