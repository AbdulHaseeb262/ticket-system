'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

interface Customer {
  _id: string;
  name: string;
  ort: string;
  telefon: string;
  email: string;
  ncode?: string;
  lanzahl?: string;
}

export default function AdminCustomersPanel() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', ort: '', telefon: '', email: '', ncode: '', lanzahl: '' });
  const [search, setSearch] = useState('');
  const { data: session } = useSession();
  const myRole = (session?.user as any)?.role;
  const isAdminOrOwner = myRole === 'admin' || myRole === 'owner';

  const load = () => fetch('/api/customers').then(r => r.json()).then(setCustomers);
  useEffect(() => { load(); }, []);

  const handleOpen = (c?: Customer) => {
    setEdit(c || null);
    setForm(c ? { name: c.name, ort: c.ort, telefon: c.telefon, email: c.email, ncode: c.ncode || '', lanzahl: c.lanzahl || '' } : { name: '', ort: '', telefon: '', email: '', ncode: '', lanzahl: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (edit) {
      await fetch('/api/customers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: edit._id, ...form }) });
    } else {
      await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setOpen(false); load();
  };
  const handleDelete = async (_id: string) => {
    if (!window.confirm('Kunde wirklich löschen?')) return;
    await fetch('/api/customers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id }) });
    load();
  };

  return (
    <Box sx={{ mt: 4 }}>
      {isAdminOrOwner && (
        <>
          <Typography variant="h6" gutterBottom>Kundenverwaltung</Typography>
          <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Kunde hinzufügen</Button>
        </>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <TextField
          label="Kunden suchen"
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
              <TableCell>Name</TableCell><TableCell>Ort</TableCell><TableCell>Telefon</TableCell><TableCell>E-Mail</TableCell><TableCell>N-Code</TableCell>
              {isAdminOrOwner && <TableCell>Lanzahl</TableCell>}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.filter(c => {
              // Hilfsfunktion: entfernt Leerzeichen und Sonderzeichen
              const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9äöüß@.]/gi, '');
              const q = normalize(search);
              return (
                normalize(c.name).includes(q) ||
                normalize(c.ort).includes(q) ||
                normalize(c.telefon).includes(q) ||
                normalize(c.email || '').includes(q) ||
                normalize(c.ncode || '').includes(q)
              );
            }).map(c => (
              <TableRow key={c._id}>
                <TableCell>{c.name}</TableCell><TableCell>{c.ort}</TableCell><TableCell>{c.telefon}</TableCell><TableCell>{c.email}</TableCell><TableCell>{c.ncode || ''}</TableCell>
                {isAdminOrOwner && <TableCell>{c.lanzahl}</TableCell>}
                <TableCell>
                  <IconButton onClick={() => handleOpen(c)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(c._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{edit ? 'Kunde bearbeiten' : 'Kunde hinzufügen'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Ort" value={form.ort} onChange={e => setForm(f => ({ ...f, ort: e.target.value }))} fullWidth margin="normal" />
          <TextField label="Telefon" value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} fullWidth margin="normal" />
          <TextField label="E-Mail" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth margin="normal" />
          <TextField label="N-Code" value={form.ncode} onChange={e => setForm(f => ({ ...f, ncode: e.target.value }))} fullWidth margin="normal" />
          {isAdminOrOwner && (
            <TextField label="Lanzahl" value={form.lanzahl} onChange={e => setForm(f => ({ ...f, lanzahl: e.target.value }))} fullWidth margin="normal" />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 