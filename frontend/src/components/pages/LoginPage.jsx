import { useState } from 'react';
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

export function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000')
    .replace(/\/$/, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Attempting login to:', `${apiBaseUrl}/api/auth/login`);
      console.log('Login payload:', { email: username, password: '***' });
      
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password,
        }),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      console.log('Login response:', { 
        status: res.status, 
        statusText: res.statusText,
        ok: res.ok,
        data 
      });

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          `Login failed (${res.status})`;
        console.error('Login failed:', msg);
        throw new Error(msg);
      }

      // Accept BOTH backend formats safely
      const token = data?.accessToken || data?.token;
      const user = data?.user || data;

      if (!token) {
        console.error('No token in response:', data);
        throw new Error('No authentication token received');
      }

      console.log('Token received:', token.substring(0, 20) + '...');
      console.log('User data:', user);

      // Store the token and user data
      localStorage.setItem('fleet.token', token);
      if (user?.role) {
        localStorage.setItem('fleet.role', String(user.role));
      }
      if (user?.email) {
        localStorage.setItem('fleet.email', String(user.email));
      }

      console.log('Login successful, token stored');
      onLogin(user.role || 'user');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-slate-700">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-[#10b981] p-4 rounded-full">
              <Truck className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">FleetMaster Pro</CardTitle>
          <CardDescription className="text-base">
            Fleet Management & Telematics System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                placeholder="Enter email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-50"
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
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50"
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
              <div className="text-xs text-red-200 bg-red-950/40 border border-red-900 rounded p-2">
                {error}
              </div>
            )}

            <div className="text-xs text-center text-slate-500 mt-4 space-y-1">
              <p>Demo Credentials:</p>
              <p>Owner: admin@fleet.com / admin123</p>
              <p>Supervisor: supervisor@fleet.com / super123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}