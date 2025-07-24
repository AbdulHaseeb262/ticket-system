'use client';
import { useEffect, useState } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography, Button, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';
import ListItemButton from '@mui/material/ListItemButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSession } from 'next-auth/react';

interface Notification {
  _id: string;
  type: string;
  ticketId?: string;
  read: boolean;
  createdAt: string;
  text?: string;
  userId?: string; // Added for 'assigned' type
  message?: string;
  from?: string; // Added for 'mention' type
}

interface Ticket { _id: string; customerId?: string; topic?: string; updateAppointment?: string; }
interface Topic { _id: string; name: string; }
interface Customer { _id: string; name: string; }

interface Props {
  userId: string;
}

export default function NotificationBadge({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replied, setReplied] = useState<string[]>([]);
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email || '';

  useEffect(() => {
    fetch(`/api/notifications?userId=${userId}`)
      .then(r => r.json())
      .then(data => setNotifications(data.filter((n: Notification) => !n.read && String(n.userId) === String(userId))));
    fetch('/api/tickets').then(r => r.json()).then(setTickets);
    fetch('/api/topics').then(r => r.json()).then(setTopics);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
  }, [userId]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRead = async (n: Notification) => {
    if (!n.read) {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: n._id })
      });
      setNotifications(prev => prev.filter(x => x._id !== n._id));
    }
  };

  const handleAccordionChange = (id: string) => {
    setExpanded(expanded === id ? false : id);
  };

  const getTypeText = (n: Notification) => {
    if (n.type === 'due_soon') return 'Ticket läuft ab';
    if (n.type === 'assigned') return 'Neues Ticket zugewiesen';
    if (n.type === 'mention') return 'Im Kommentar erwähnt';
    return n.text || n.type;
  };

  // Panel bleibt offen, kein Redirect mehr:
  // const handleNotificationClick = (n: Notification) => {
  //   if (n.ticketId) router.push(`/ticket/${n.ticketId}`);
  //   handleClose();
  // };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        disablePortal
      >
        <List sx={{ minWidth: 300 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary={<Typography color="text.secondary">Keine neuen Benachrichtigungen</Typography>} />
            </ListItem>
          ) : notifications.filter(n => {
            // Updates-Termin-Benachrichtigung: Nur anzeigen, wenn Termin <= 15min in der Zukunft und noch nicht vorbei
            if (n.type === 'update_appointment' && n.message && n.ticketId) {
              const ticket = tickets.find(t => t._id === n.ticketId);
              if (ticket && ticket.updateAppointment) {
                const appt = new Date(ticket.updateAppointment);
                const now = new Date();
                const diff = (appt.getTime() - now.getTime()) / 60000;
                if (diff < 0 || diff > 15) return false;
              }
            }
            return true;
          }).map(n => {
            const ticket = n.ticketId ? tickets.find(t => t._id === n.ticketId) : undefined;
            const customer = ticket && ticket.customerId ? customers.find(c => c._id === ticket.customerId) : undefined;
            const topic = ticket && ticket.topic ? topics.find(t => t._id === ticket.topic) : undefined;
            // Updates-Termin-Benachrichtigung erkennen (type: 'update_appointment' oder message enthält 'Termin vereinbart')
            const isUpdateAppointment = n.type === 'update_appointment' || (n.message && n.message.toLowerCase().includes('termin vereinbart'));
            return (
              <ListItem disablePadding key={n._id}>
                <Accordion expanded={expanded === n._id} onChange={() => handleAccordionChange(n._id)}
                  sx={{ width: '100%', boxShadow: 'none', bgcolor: isUpdateAppointment ? '#ffebee' : 'transparent', borderLeft: isUpdateAppointment ? '6px solid #d32f2f' : undefined }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 0, bgcolor: expanded === n._id ? '#f0f0f0' : 'transparent' }} tabIndex={-1}>
                    <ListItemText
                      primary={getTypeText(n)}
                      secondary={new Date(n.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    />
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    {customer && <Typography variant="body2" sx={{ mb: 0.5 }}><b>Kunde:</b> {customer.name}</Typography>}
                    {topic && <Typography variant="body2" sx={{ mb: 0.5 }}><b>Thema:</b> {topic.name}</Typography>}
                    {n.message && <Typography variant="body2" sx={{ mb: 1 }}>{n.message}</Typography>}
                    {n.text && <Typography variant="body2" sx={{ mb: 1 }}>{n.text}</Typography>}
                    {isUpdateAppointment && (
                      <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 'bold', display: 'block', mb: 1 }}>
                        Diese Benachrichtigung muss mit <b>GELESEN</b> bestätigt werden!
                      </Typography>
                    )}
                    <Button variant="outlined" size="small" sx={{ mt: 1, mr: 1, bgcolor: isUpdateAppointment ? '#ffcdd2' : undefined, color: isUpdateAppointment ? '#b71c1c' : undefined, borderColor: isUpdateAppointment ? '#b71c1c' : undefined }} onClick={() => handleRead(n)}>Gelesen</Button>
                    {n.type === 'mention' && !replied.includes(n._id) && (
                      <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={() => {
                        setReplyOpen(n._id);
                        setReplyText(`@${n.from} `);
                      }}>Antworten</Button>
                    )}
                    {replyOpen === n._id && (
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          style={{ width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 16 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button variant="contained" size="small" onClick={async () => {
                            await fetch('/api/comments', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                ticketId: n.ticketId,
                                author: userName,
                                text: replyText
                              })
                            });
                            setReplyOpen(null);
                            setReplyText('');
                            setReplied(prev => [...prev, n._id]);
                          }}>Absenden</Button>
                          <Button variant="outlined" size="small" onClick={() => setReplyOpen(null)}>Abbrechen</Button>
                        </Box>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </ListItem>
            );
          })}
        </List>
      </Popover>
    </>
  );
} 