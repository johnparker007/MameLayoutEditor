import { Link, NavLink } from "react-router-dom";
import { useLayoutStore } from "../state/layoutStore";

export const Header = () => {
  const filename = useLayoutStore((state) => state.filename);

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-lg font-semibold text-white">
          MAME Layout Editor
        </Link>
        {filename ? (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
            {filename}
          </span>
        ) : (
          <span className="text-xs text-slate-400">No file loaded</span>
        )}
      </div>
      <nav className="flex items-center gap-4 text-sm text-slate-300">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "text-white" : "text-slate-400 hover:text-white"
          }
        >
          Editor
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "text-white" : "text-slate-400 hover:text-white"
          }
        >
          About
        </NavLink>
      </nav>
    </header>
  );
};
