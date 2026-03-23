import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useRegisterMutation } from '../features/auth/authApi';

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form).unwrap();
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass-panel w-full max-w-md rounded-2xl p-6">
        <h1 className="font-display text-2xl font-bold text-white">Create your account</h1>
        <div className="mt-5 space-y-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
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
            {isLoading ? 'Creating...' : 'Create account'}
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-emerald-300">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;

