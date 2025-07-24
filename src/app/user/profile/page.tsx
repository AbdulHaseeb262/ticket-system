"use client";
import { useState } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { Box, Button, Container, TextField, Typography, Alert, Paper } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

function UserProfilePageInner() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (pw1.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/users/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, password: pw1 })
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Passwort erfolgreich geändert.");
      setPw1(""); setPw2("");
    } else {
      setError("Fehler beim Ändern des Passworts.");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f7fafd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 10 } }}>
      <Box sx={{ width: '100%', maxWidth: 440, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconButton onClick={() => window.location.href = '/'} size="large" sx={{ mr: 2, bgcolor: '#e3eafc', borderRadius: 2 }}>
          <ArrowBackIcon fontSize="medium" />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 1 }}>Profil</Typography>
      </Box>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, mb: 4, width: '100%', maxWidth: 440, borderRadius: 4, boxShadow: 6, bgcolor: '#fff' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>Mein Profil</Typography>
        <Box sx={{ mb: 1.5, fontSize: 18 }}><b>Name:</b> <span style={{ color: '#333' }}>{user?.name}</span></Box>
        <Box sx={{ mb: 1.5, fontSize: 18 }}><b>E-Mail:</b> <span style={{ color: '#333' }}>{user?.email}</span></Box>
        <Box sx={{ mb: 1.5, fontSize: 18 }}><b>Rolle:</b> <span style={{ color: '#333' }}>{user?.role}</span></Box>
      </Paper>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, width: '100%', maxWidth: 440, borderRadius: 4, boxShadow: 6, bgcolor: '#fff' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>Passwort ändern</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: "100%" }}>
          <TextField
            label="Neues Passwort"
            type="password"
            value={pw1}
            onChange={e => setPw1(e.target.value)}
            fullWidth
            required
            margin="normal"
            sx={{ mb: 2, bgcolor: '#f5f8fa', borderRadius: 2 }}
          />
          <TextField
            label="Passwort wiederholen"
            type="password"
            value={pw2}
            onChange={e => setPw2(e.target.value)}
            fullWidth
            required
            margin="normal"
            sx={{ mb: 2, bgcolor: '#f5f8fa', borderRadius: 2 }}
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 1, fontWeight: 'bold', fontSize: 18, borderRadius: 2, boxShadow: 2 }} disabled={loading}>
            Passwort ändern
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default function UserProfilePage() {
  return (
    <SessionProvider>
      <UserProfilePageInner />
    </SessionProvider>
  );
} 