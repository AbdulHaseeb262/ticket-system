import { Container, Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Fehler beim Login</Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere den Support.
        </Typography>
        <Button component={Link} href="/auth/signin" variant="contained" sx={{ mt: 2 }}>
          Zurück zum Login
        </Button>
      </Box>
    </Container>
  );
} 