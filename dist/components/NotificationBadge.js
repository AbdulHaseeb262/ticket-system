const _jsxFileName = "src\\components\\NotificationBadge.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }'use client';
import { useEffect, useState } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemText, Typography, Button, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSession } from 'next-auth/react';





















export default function NotificationBadge({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [topics, setTopics] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replied, setReplied] = useState([]);
  const { data: session } = useSession();
  const userName = _optionalChain([session, 'optionalAccess', _ => _.user, 'optionalAccess', _2 => _2.name]) || _optionalChain([session, 'optionalAccess', _3 => _3.user, 'optionalAccess', _4 => _4.email]) || '';

  useEffect(() => {
    fetch(`/api/notifications?userId=${userId}`)
      .then(r => r.json())
      .then(data => setNotifications(data.filter((n) => !n.read && String(n.userId) === String(userId))));
    fetch('/api/tickets').then(r => r.json()).then(setTickets);
    fetch('/api/topics').then(r => r.json()).then(setTopics);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
  }, [userId]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRead = async (n) => {
    if (!n.read) {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: n._id })
      });
      setNotifications(prev => prev.filter(x => x._id !== n._id));
    }
  };

  const handleAccordionChange = (id) => {
    setExpanded(expanded === id ? false : id);
  };

  const getTypeText = (n) => {
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
    React.createElement(React.Fragment, null
      , React.createElement(IconButton, { color: "inherit", onClick: handleOpen, __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
        , React.createElement(Badge, { badgeContent: notifications.length, color: "error", __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}
          , React.createElement(NotificationsIcon, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 95}} )
        )
      )
      , React.createElement(Popover, {
        open: Boolean(anchorEl),
        anchorEl: anchorEl,
        onClose: handleClose,
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
        transformOrigin: { vertical: 'top', horizontal: 'right' },
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true,
        disablePortal: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}

        , React.createElement(List, { sx: { minWidth: 300 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}
          , notifications.length === 0 ? (
            React.createElement(ListItem, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}
              , React.createElement(ListItemText, { primary: React.createElement(Typography, { color: "text.secondary", __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}, "Keine neuen Benachrichtigungen"  ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}} )
            )
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
              React.createElement(ListItem, { disablePadding: true, key: n._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}
                , React.createElement(Accordion, { expanded: expanded === n._id, onChange: () => handleAccordionChange(n._id),
                  sx: { width: '100%', boxShadow: 'none', bgcolor: isUpdateAppointment ? '#ffebee' : 'transparent', borderLeft: isUpdateAppointment ? '6px solid #d32f2f' : undefined }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}
                  , React.createElement(AccordionSummary, { expandIcon: React.createElement(ExpandMoreIcon, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 136}} ), sx: { minHeight: 0, bgcolor: expanded === n._id ? '#f0f0f0' : 'transparent' }, tabIndex: -1, __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
                    , React.createElement(ListItemText, {
                      primary: getTypeText(n),
                      secondary: new Date(n.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}
                    )
                  )
                  , React.createElement(AccordionDetails, { sx: { pt: 0 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}
                    , customer && React.createElement(Typography, { variant: "body2", sx: { mb: 0.5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 143}}, React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 143}}, "Kunde:"), " " , customer.name)
                    , topic && React.createElement(Typography, { variant: "body2", sx: { mb: 0.5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}, React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}, "Thema:"), " " , topic.name)
                    , n.message && React.createElement(Typography, { variant: "body2", sx: { mb: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, n.message)
                    , n.text && React.createElement(Typography, { variant: "body2", sx: { mb: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}, n.text)
                    , isUpdateAppointment && (
                      React.createElement(Typography, { variant: "caption", sx: { color: '#d32f2f', fontWeight: 'bold', display: 'block', mb: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}, "Diese Benachrichtigung muss mit "
                            , React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 149}}, "GELESEN"), " bestätigt werden!"
                      )
                    )
                    , React.createElement(Button, { variant: "outlined", size: "small", sx: { mt: 1, mr: 1, bgcolor: isUpdateAppointment ? '#ffcdd2' : undefined, color: isUpdateAppointment ? '#b71c1c' : undefined, borderColor: isUpdateAppointment ? '#b71c1c' : undefined }, onClick: () => handleRead(n), __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}, "Gelesen")
                    , n.type === 'mention' && !replied.includes(n._id) && (
                      React.createElement(Button, { variant: "contained", size: "small", sx: { mt: 1 }, onClick: () => {
                        setReplyOpen(n._id);
                        setReplyText(`@${n.from} `);
                      }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}, "Antworten")
                    )
                    , replyOpen === n._id && (
                      React.createElement(Box, { sx: { mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
                        , React.createElement('textarea', {
                          value: replyText,
                          onChange: e => setReplyText(e.target.value),
                          style: { width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 16 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}
                        )
                        , React.createElement(Box, { sx: { display: 'flex', gap: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
                          , React.createElement(Button, { variant: "contained", size: "small", onClick: async () => {
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
                          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}, "Absenden")
                          , React.createElement(Button, { variant: "outlined", size: "small", onClick: () => setReplyOpen(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}, "Abbrechen")
                        )
                      )
                    )
                  )
                )
              )
            );
          })
        )
      )
    )
  );
} 