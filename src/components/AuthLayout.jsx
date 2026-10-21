import logo from '../assets/fiscora-mark.png';
import Rosette from './Rosette.jsx';

const ROSETTE = {
  login: { spread: 150, accentSpread: 70, position: '-left-[300px] -bottom-[380px]' },
  register: { spread: 200, accentSpread: 95, position: '-left-[320px] -bottom-[360px]' },
};

// Shared shell for the log in and create account pages:
// brand panel on the left (top on phones), form on the right.
export default function AuthLayout({ variant = 'login', children }) {
  const rosette = ROSETTE[variant];

  return (
    <div className="flex min-h-screen flex-col bg-ink font-sans text-bone lg:flex-row">
      <div className="relative min-h-[220px] overflow-hidden bg-ink px-6 py-7 lg:min-h-screen lg:w-[54%] lg:px-14 lg:py-10">
        <Rosette
          spread={rosette.spread}
          accentSpread={rosette.accentSpread}
          className={rosette.position}
        />
        <div className="relative flex items-center gap-3">
          <img src={logo} alt="" className="h-11 w-11 object-contain" />
          <span className="font-display text-[30px] leading-none tracking-[0.01em]">Fiscora</span>
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center bg-pane px-6 py-10 lg:px-14 lg:py-14">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}