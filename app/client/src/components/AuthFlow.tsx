import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { WS_URL } from '@/config';

type Stage = 'initial' | 'login' | 'signup' | 'redirect-oauth';

export default function AuthFlow() {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('initial');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<'email' | 'google' | null>(null);

  const handleEmailSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(WS_URL + '/auth/check-email', { email });
      const { exists, provider } = res.data;

      if (!exists) {
        setStage('signup');
        setProvider('email');
      } else if (provider === 'email') {
        setStage('login');
        setProvider('email');
      } else {
        // Redirect to the correct OAuth provider
        setStage('redirect-oauth');
        setProvider(provider);
        window.location.href = `${WS_URL}/auth/${provider}`;
      }
    } catch (err) {
      console.error('Error checking email:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(WS_URL + '/auth/login', { email, password }, { withCredentials: true });
      console.log('Login successful', res.data);
      window.location.href = '/b';
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleSignup = async () => {
    try {
      const res = await axios.post(WS_URL + '/auth/signup', { email, password, name });
      console.log('Signup successful', res.data);
      // TODO: Store token
    } catch (err) {
      console.error('Signup failed', err);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = WS_URL + '/auth/google';
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-semibold text-center">Sign in to Simple Digits</h1>

      {stage === 'initial' && (
        <>
          <Button variant="outline" className="w-full" onClick={loginWithGoogle}>
            Continue with Google
          </Button>

          <div className="text-center text-sm">or</div>

          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
          />
          <Button className="w-full" onClick={handleEmailSubmit} disabled={loading}>
            Continue
          </Button>
        </>
      )}

      {stage === 'login' && provider === 'email' && (
        <>
          <p className="text-sm">Welcome back! Enter your password to sign in.</p>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <Button className="w-full" onClick={handleLogin}>Log in</Button>
        </>
      )}

      {stage === 'signup' && provider === 'email' && (
        <>
          <p className="text-sm">Looks like you're new. Let's get you set up.</p>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
          />
          <p>Here's the rules: - Must be at least 6 characters - Must contain a digit - Must contain a special character</p>
          <Button className="w-full" onClick={handleSignup}>Sign up</Button>
        </>
      )}

      {stage === 'redirect-oauth' && provider && (
        <p className="text-center text-sm">
          Redirecting to {provider} login...
        </p>
      )}
    </div>
  );
}
