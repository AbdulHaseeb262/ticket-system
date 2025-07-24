import { Container, Box, Typography } from '@mui/material';

export default function VerifyRequestPage() {
  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>Bitte E-Mail prüfen</Typography>
        <Typography variant="body1" color="text.secondary">
          Wir haben dir einen Login-Link geschickt. Bitte prüfe dein E-Mail-Postfach (und ggf. den Spam-Ordner).
        </Typography>
      </Box>
    </Container>
  );
} 