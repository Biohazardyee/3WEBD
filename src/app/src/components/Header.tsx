import { NavLink } from "react-router-dom";
import HeaderSearch from "./HeaderSearch";

const Header = () => {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white">
            📘
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-semibold text-blue-900">
              City Library
            </h1>
            <p className="text-sm text-gray-500">
              Public Collection
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <HeaderSearch />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/advanced-search">Advanced Search</NavItem>
          <NavItem to="/about">About</NavItem>
        </nav>
      </div>
    </header>
  );
};

export default Header;

/* ---------- */

const NavItem = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `rounded-lg px-4 py-2 text-sm font-medium transition
       ${
         isActive
           ? "bg-blue-900 text-white"
           : "text-gray-700 hover:bg-gray-100"
       }`
    }
  >
    {children}
  </NavLink>
);
