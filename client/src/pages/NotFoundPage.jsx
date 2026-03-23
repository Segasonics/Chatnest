import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel rounded-2xl p-8 text-center">
        <h1 className="font-display text-4xl font-bold text-white">404</h1>
        <p className="mt-2 text-slate-300">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-4 inline-block text-emerald-300">
          Go home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

