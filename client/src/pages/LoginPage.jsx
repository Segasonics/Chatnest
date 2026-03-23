import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useLoginMutation } from '../features/auth/authApi';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form).unwrap();
      toast.success('Logged in');
      navigate(location.state?.from || '/dashboard');
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass-panel w-full max-w-md rounded-2xl p-6">
        <h1 className="font-display text-2xl font-bold text-white">Sign in to Chat Nest</h1>
        <p className="mt-1 text-sm text-slate-300">Automate your conversations in minutes.</p>
        <div className="mt-5 space-y-3">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-300">
          New here?{' '}
          <Link to="/auth/register" className="text-emerald-300">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;

