import { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Truck } from 'lucide-react';
import { api } from '../../services/api';

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const persistAuth = ({ token, user }) => {
    localStorage.setItem('fleet.token', String(token));
    if (user?.role) {
      localStorage.setItem('fleet.role', String(user.role));
    }
    if (user?.email) {
      localStorage.setItem('fleet.email', String(user.email));
    }
  };

  const getFriendlyError = (err) => {
    const status = typeof err === 'object' && err !== null && 'status' in err ? err.status : undefined;
    const message = err instanceof Error ? err.message : String(err);

    const isNetwork =
      status === 0 ||
      message === 'Failed to fetch' ||
      message === 'Network error' ||
      message.toLowerCase().includes('failed to fetch');

    if (isNetwork) {
      return 'Unable to reach the server. Check that the backend is running or enable Demo Mode.';
    }

    if (status === 400) {
      return message || 'Invalid request. Please check your input.';
    }

    if (status === 401) {
      return message && message !== 'Unauthorized' ? message : 'Invalid email or password.';
    }

    if (typeof status === 'number' && status >= 500) {
      return 'Server error. Please try again later.';
    }

    return message || 'Login failed. Please try again.';
  };

  const resolveDemoRole = (overrideRole) => {
    if (overrideRole) return overrideRole;
    const e = String(email || '').toLowerCase().trim();
    if (e === 'admin@fleet.com') return 'owner';
    if (e === 'supervisor@fleet.com') return 'supervisor';
    return 'supervisor';
  };

  const login = async ({ nextEmail, nextPassword, roleOverride } = {}) => {
    if (submittingRef.current) return;

    const e = (nextEmail ?? email).trim();
    const p = nextPassword ?? password;

    setError('');
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (demoMode) {
        const role = resolveDemoRole(roleOverride);

        if (String(p) !== 'password123') {
          throw new Error('Invalid demo password. Demo Password: password123');
        }

        const user = {
          id: `demo-${role}`,
          email: e || (role === 'owner' ? 'admin@fleet.com' : 'supervisor@fleet.com'),
          role,
        };
        const token = `demo-token-${role}`;

        persistAuth({ token, user });
        onLogin(role);
        return;
      }

      const data = await api.auth.login({ email: e, password: p });
      const { token, user } = data || {};

      if (!token) {
        throw new Error('No authentication token received');
      }

      persistAuth({ token, user: user || { email: e, role: 'user' } });
      onLogin((user && user.role) || 'user');
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login();
  };

  const handleQuickDemo = async (role) => {
    const demoEmail = role === 'owner' ? 'admin@fleet.com' : 'supervisor@fleet.com';
    const demoPassword = 'password123';

    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');

    if (demoMode) {
      await login({ nextEmail: demoEmail, nextPassword: demoPassword, roleOverride: role });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-[#10b981] p-3 rounded-full">
              <Truck className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">FleetMaster Pro</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Fleet Management & Telematics System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter email"
                value={email}

                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="bg-slate-50"
                disabled={isSubmitting}
                required
              />

            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}

                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="bg-slate-50"
                disabled={isSubmitting}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0f172a] hover:bg-[#1e293b]"
            >
              {isSubmitting ? 'Signing In…' : 'Sign In'}
            </Button>

            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}

            <div className="pt-4 space-y-3">
              <div className="h-px w-full bg-slate-200" />
              <div className="text-[11px] text-center text-slate-500">Quick Demo Login:</div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo('owner')}
                >
                  Owner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo('supervisor')}
                >
                  Supervisor
                </Button>
              </div>

              <div className="text-[11px] text-center text-slate-500">Demo Password: password123</div>

              <div className="flex items-center justify-center gap-2">
                <input
                  id="demoMode"
                  type="checkbox"
                  checked={demoMode}
                  disabled={isSubmitting}
                  className="h-3 w-3"
                  onChange={(e) => {
                    setDemoMode(e.target.checked);
                    if (error) setError('');
                  }}
                />

                <Label htmlFor="demoMode" className="text-xs text-slate-500 font-normal">
                  Demo Mode (no backend required)
                </Label>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}