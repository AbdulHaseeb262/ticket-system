'use client';
import { useState } from 'react';
import { AppBar, Box, Toolbar, Typography, Tabs, Tab, Container, CssBaseline, ThemeProvider, createTheme, Button } from '@mui/material';
import KanbanBoard from '../components/KanbanBoard';
import TicketForm from '../components/TicketForm';
import AdminCustomersPanel from '../components/AdminCustomersPanel';
import AdminTopicsPanel from '../components/AdminTopicsPanel';
import AdminUsersPanel from '../components/AdminUsersPanel';
import NotificationBadge from '../components/NotificationBadge';
import Image from 'next/image';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { IconButton, Menu, MenuItem, Avatar, ListItemText } from '@mui/material';
import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const theme = createTheme({
  palette: {
    primary: { main: '#6995c9' }, 
    secondary: { main: '#1976d2' },
    background: { default: '#eaf6fb' },
  },
});

const TABS = [
  { label: 'Kanban', value: 'kanban' },
  { label: 'Ticket anlegen', value: 'ticket' },
  { label: 'Kunden', value: 'kunden' },
  { label: 'Themen', value: 'themen' },
  { label: 'Benutzer', value: 'benutzer' },
];

function HomePageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const user = session?.user as any;
  const userId = user?.id || '';
  const isAdmin = user?.role === 'admin';
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  const userName = user?.name || user?.email || '';
  const [tab, setTab] = useState('kanban');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    window.location.reload();
  };

  if (loading) return null;
  if (!session) return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#eaf6fb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image src="/notabene.png" alt="Notabene Logo" height={120} width={120} style={{ marginBottom: 16 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6995c9', mb: 2 }}>Notabene Ticketingsystem</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Bitte logge dich mit deinem Benutzernamen oder deiner E-Mail-Adresse und Passwort ein.</Typography>
        <Button onClick={() => signIn()} variant="contained" color="primary" size="large">Login</Button>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', mt: 3.5 }}>
            <Box sx={{ cursor: 'pointer' }} onClick={() => setTab('kanban')}>
              <Image src="/notabene.png" alt="Notabene Logo" height={101} width={101} style={{ marginRight: 24 }} />
            </Box>
          </Box>
          <NotificationBadge userId={userId} />
          <IconButton color="inherit" onClick={handleMenu} sx={{ ml: 2 }}>
            <AccountCircle fontSize="large" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem disabled>
              <ListItemText primary={userName} />
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); window.location.href = '/user/profile'; }}>Profil</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered textColor="inherit" indicatorColor="secondary">
          <Tab key="kanban" label="Kanban" value="kanban" />
          <Tab key="ticket" label="Ticket anlegen" value="ticket" />
          {isAdminOrOwner && <Tab key="kunden" label="Kunden" value="kunden" />}
          {isAdminOrOwner && <Tab key="themen" label="Themen" value="themen" />}
          {isAdminOrOwner && <Tab key="benutzer" label="Benutzer" value="benutzer" />}
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" sx={{ bgcolor: '#f4faff', borderRadius: 3, p: 3, minHeight: 600 }}>
        {tab === 'kanban' && <KanbanBoard userId={userId} />}
        {tab === 'ticket' && <TicketForm userId={userId} />}
        {tab === 'kunden' && isAdminOrOwner && <AdminCustomersPanel />}
        {tab === 'themen' && isAdminOrOwner && <AdminTopicsPanel />}
        {tab === 'benutzer' && isAdminOrOwner && <AdminUsersPanel />}
        {tab !== 'kanban' && tab !== 'ticket' && !isAdminOrOwner && (
          <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>Kein Zugriff</Typography>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default function HomePage() {
  return (
    <SessionProvider>
      <HomePageContent />
    </SessionProvider>
  );
}
