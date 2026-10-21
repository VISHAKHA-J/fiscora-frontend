import { useAuth } from '../context/AuthContext.jsx';

// Placeholder so login and register have somewhere to land.
// Replaced when the real dashboard is built.
export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-start justify-center gap-4 bg-pane px-6 lg:px-14">
      <h1 className="font-display text-4xl">Welcome, {user.username}.</h1>
      <p className="text-mist">Your dashboard is coming next.</p>
      <button
        type="button"
        onClick={logout}
        className="cursor-pointer text-sm font-semibold text-brass underline underline-offset-4 hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
      >
        Log out
      </button>
    </main>
  );
}