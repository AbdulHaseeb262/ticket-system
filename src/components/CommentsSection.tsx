'use client';

import { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, IconButton } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSession } from 'next-auth/react';

interface Comment {
  _id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface Props {
  ticketId: string;
}

export default function CommentsSection({ ticketId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<{name: string}[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<{name: string}[]>([]);
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [autocompleteStart, setAutocompleteStart] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownAnchor, setDropdownAnchor] = useState<null | HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email || '';
  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(data => setUsers(data.map((u: any) => ({ name: u.name }))));
  }, []);

  const load = () => {
    setLoading(true);
    fetch(`/api/comments?ticketId=${ticketId}`)
      .then(r => r.json())
      .then(setComments)
      .catch(() => setError('Fehler beim Laden der Kommentare.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, author: userName, text })
    });
    if (res.ok) {
      setText('');
      load();
    } else {
      setError('Fehler beim Speichern.');
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: commentId })
    });
    load();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    const atIdx = val.lastIndexOf('@');
    if (atIdx !== -1 && (atIdx === 0 || val[atIdx - 1] === ' ')) {
      const query = val.slice(atIdx + 1).toLowerCase();
      setAutocompleteStart(atIdx);
      setAutocompleteValue(query);
      setAutocompleteOptions(
        users.filter(u =>
          u.name.toLowerCase().split(' ').some(part => part.startsWith(query))
        )
      );
      setDropdownOpen(query.length > 0);
    } else {
      setDropdownOpen(false);
      setAutocompleteStart(null);
    }
  };

  const handleUserSelect = (user: { name: string }) => {
    if (autocompleteStart !== null) {
      const before = text.slice(0, autocompleteStart);
      const after = text.slice(autocompleteStart);
      const match = after.match(/^@\w*/);
      const afterMention = match ? after.slice(match[0].length) : '';
      setText(before + '@' + user.name + afterMention + ' ');
      setDropdownOpen(false);
      setAutocompleteStart(null);
      setAutocompleteValue('');
      setAutocompleteOptions([]);
      // Fokus zurück ins Textfeld
      setTimeout(() => textFieldRef.current?.focus(), 0);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Kommentare</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ mb: 2, maxHeight: 300, overflowY: 'auto' }}>
        {comments.map(c => (
          <Paper key={c._id} sx={{ p: 2, mb: 1, position: 'relative' }}>
            <Typography fontWeight="bold">{c.author}</Typography>
            <Typography variant="body2" color="text.secondary">{new Date(c.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Typography>
            {editId === c._id ? (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="contained" size="small" onClick={async () => {
                    await fetch('/api/comments', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ _id: c._id, text: editText })
                    });
                    setEditId(null);
                    load();
                  }}>Speichern</Button>
                  <Button variant="outlined" size="small" onClick={() => setEditId(null)}>Abbrechen</Button>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ mt: 1, wordBreak: 'break-word', maxWidth: '100%' }}>{c.text}</Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {c.author !== userName && replyOpen !== c._id && (
                <Button size="small" variant="outlined" onClick={() => { setReplyOpen(c._id); setReplyText(`@${c.author} `); }}>Antworten</Button>
              )}
              {replyOpen === c._id && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  <TextField
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button variant="contained" size="small" onClick={async () => {
                      await fetch('/api/comments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ticketId, author: userName, text: replyText })
                      });
                      setReplyOpen(null);
                      setReplyText('');
                      load();
                    }}>Absenden</Button>
                    <Button variant="outlined" size="small" onClick={() => setReplyOpen(null)}>Abbrechen</Button>
                  </Box>
                </Box>
              )}
              {(isAdmin || c.author === userName) && editId !== c._id && (
                <>
                  <IconButton size="small" sx={{ position: 'absolute', top: 4, right: 36 }} onClick={() => { setEditId(c._id); setEditText(c.text); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4 }} onClick={() => handleDelete(c._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
        <TextField
          label="Kommentar hinzufügen (@Name für Tagging)"
          value={text}
          onChange={handleTextChange}
          fullWidth
          required
          inputRef={textFieldRef}
        />
        {dropdownOpen && autocompleteOptions.length > 0 && (
          <Paper sx={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 20, maxHeight: 200, overflowY: 'auto' }}>
            <List>
              {autocompleteOptions.map(u => (
                <ListItem key={u.name} disablePadding>
                  <ListItemButton onClick={() => handleUserSelect(u)}>
                    <ListItemText primary={u.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        <Button type="submit" variant="contained" disabled={loading}>Posten</Button>
      </Box>
    </Box>
  );
} 