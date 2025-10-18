import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/workspaces", label: "Workspaces", icon: "🏢" },
  { href: "/documents", label: "Documents", icon: "📝" },
  { href: "/tasks", label: "Tasks", icon: "📋" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar-modern w-64 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200/50">
        <span className="text-xl font-extrabold tracking-tight relative inline-block">
          <span className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-indigo-400/30 to-fuchsia-400/30 blur-md" />
          <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">OneDesk</span>
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {items.map((it) => (
          <Link 
            key={it.href} 
            href={it.href} 
            className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all duration-200 hover:shadow-sm hover:text-indigo-700"
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform">{it.icon}</span>
            {it.label}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200/50">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-rose-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 rounded-lg transition-all duration-200 hover:shadow-sm"
        >
          <span className="text-lg mr-3">🚪</span>
          Log out
        </button>
      </div>
    </aside>
  );
}


