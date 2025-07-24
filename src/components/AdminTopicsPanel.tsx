'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { useSession } from 'next-auth/react';

interface Topic {
  _id: string;
  name: string;
}

export default function AdminTopicsPanel() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Topic | null>(null);
  const [form, setForm] = useState({ name: '' });
  const [search, setSearch] = useState('');

  const load = () => fetch('/api/topics').then(r => r.json()).then(setTopics);
  useEffect(() => { load(); }, []);

  const handleOpen = (t?: Topic) => {
    setEdit(t || null);
    setForm(t ? { name: t.name } : { name: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (edit) {
      await fetch('/api/topics', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: edit._id, ...form }) });
    } else {
      await fetch('/api/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setOpen(false); load();
  };
  const handleDelete = async (_id: string) => {
    if (!window.confirm('Thema wirklich löschen?')) return;
    await fetch('/api/topics', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id }) });
    load();
  };

  const { data: session } = useSession();
  const myRole = (session?.user as any)?.role;
  const isAdminOrOwner = myRole === 'admin' || myRole === 'owner';

  return (
    <Box sx={{ mt: 4 }}>
      {isAdminOrOwner && (
        <>
          <Typography variant="h6" gutterBottom>Themenverwaltung</Typography>
          <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Thema hinzufügen</Button>
        </>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <TextField
          label="Themen suchen"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ maxWidth: 400, bgcolor: '#f5f8fa', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            style: { borderRadius: 8, background: '#f5f8fa', paddingLeft: 4 }
          }}
          fullWidth
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topics.filter(t => {
              const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9äöüß]/gi, '');
              const q = normalize(search);
              return normalize(t.name).includes(q);
            }).map(t => (
              <TableRow key={t._id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(t)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(t._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{edit ? 'Thema bearbeiten' : 'Thema hinzufügen'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm({ name: e.target.value })} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 