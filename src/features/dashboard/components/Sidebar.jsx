import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Home" },
  { href: "/workspaces", label: "Workspaces" },
  { href: "/documents", label: "Documents" },
  { href: "/tasks", label: "Tasks" },
  { href: "/chat", label: "Chat" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="hidden md:block w-60 border-r bg-white">
      <div className="h-16 flex items-center px-4 border-b">
        <span className="text-lg font-extrabold tracking-tight relative inline-block">
          <span className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-indigo-400/30 to-fuchsia-400/30 blur-md" />
          <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">OneDesk</span>
        </span>
      </div>
      <nav className="p-3 space-y-1">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            {it.label}
          </Link>
        ))}
        <button onClick={onLogout} className="mt-2 w-full text-left rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
          Log out
        </button>
      </nav>
    </aside>
  );
}


