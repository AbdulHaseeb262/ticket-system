"use client";
import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(''); setError('');
    // API-Call zum Anlegen des Users und Versand der Invite-Mail
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, status: 'pending' })
    });
    if (res.ok) {
      setSuccess('Einladung verschickt!');
      setEmail('');
      setRole('user');
    } else {
      setError('Fehler beim Einladen.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>Benutzer einladen</Typography>
        <Box component="form" onSubmit={handleInvite} sx={{ mt: 2, width: '100%' }}>
          <TextField
            label="E-Mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Rolle</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="Rolle"
              onChange={e => setRole(e.target.value as string)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Einladung senden
          </Button>
        </Box>
      </Box>
    </Container>
  );
}