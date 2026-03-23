import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#2a3942] bg-[#0b141a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-bold tracking-wide text-white">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/auth/login" className="rounded-lg px-3 py-2 text-sm text-[#d1d7db] hover:text-emerald-300">
            Sign in
          </Link>
          <Link
            to="/auth/register"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-2 text-sm font-semibold text-white shadow-glow"
          >
            Start Free Trial
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

