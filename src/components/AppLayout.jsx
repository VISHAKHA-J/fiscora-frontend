import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/fiscora-mark.png';

const navClass = ({ isActive }) =>
  `block py-2.5 text-base hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass ${
    isActive ? 'font-semibold text-brass' : 'font-medium text-mist'
  }`;

// Sidebar + page area shared by every signed-in screen.
// Phone: logo and user on the first row, links on the second. Desktop: a left column.
export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-wrap bg-ink text-bone">
      <aside className="flex basis-full flex-wrap items-center justify-between gap-y-1 border-b border-[#16292c] px-6 py-4 md:basis-60 md:flex-col md:flex-nowrap md:items-stretch md:justify-start md:border-r md:border-b-0 md:py-8">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" className="size-9 object-contain" />
          <span className="font-display text-[26px] leading-none tracking-[0.01em]">Fiscora</span>
        </div>

        <div className="text-right text-sm md:order-3 md:text-left">
          <div className="font-medium">{user.username}</div>
          <button
            type="button"
            onClick={logout}
            className="min-h-10 cursor-pointer font-medium text-mist hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass md:mt-1"
          >
            Log out
          </button>
        </div>

        <nav aria-label="Main" className="flex basis-full gap-6 md:mt-10 md:block md:flex-1 md:basis-auto">
          <NavLink to="/accounts" className={navClass}>
            Accounts
          </NavLink>
          <NavLink to="/categories" className={navClass}>
            Categories
          </NavLink>
          <NavLink to="/transactions" className={navClass}>
            Transactions
          </NavLink>
          <NavLink to="/budgets" className={navClass}>
            Budgets
          </NavLink>
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
        </nav>
      </aside>

      <main className="min-w-0 flex-[999_1_560px] bg-pane px-6 pt-8 pb-12 md:px-14 md:py-12">
        <div className="max-w-[760px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}