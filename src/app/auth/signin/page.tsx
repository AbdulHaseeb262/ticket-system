'use client';

import { getCsrfToken, signIn } from 'next-auth/react';
import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) setError('Falsche E-Mail oder Passwort!');
    else {
      // Nach Login: Userdaten holen und ggf. Redirect auf Passwort-Ändern
      const userRes = await fetch('/api/users/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (userRes.ok) {
        const user = await userRes.json();
        if (user && user.forcePasswordChange) {
          router.push('/auth/change-password');
          return;
        }
      }
      router.push('/');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Logo entfernt: Hier wird KEIN <Image> oder Bild mehr angezeigt */}
        <Typography variant="h4" gutterBottom>Notabene Service-Portal</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Bitte logge dich mit deiner E-Mail und deinem Passwort ein.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            label="E-Mail oder Benutzername"
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Passwort"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 