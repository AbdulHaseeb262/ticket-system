'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Select, InputLabel, FormControl, Checkbox, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSession } from 'next-auth/react';

interface User {
  _id: string;
  name?: string;
  email: string;
  role: string;
  firma?: string;
  status?: string;
  active?: boolean;
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', firma: 'Notabene' });
  const [active, setActive] = useState(true);
  // forcePasswordChange entfernt
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { data: session } = useSession();
  const myEmail = (session?.user as any)?.email;
  const myRole = (session?.user as any)?.role;
  const isAdminOrOwner = myRole === 'admin' || myRole === 'owner';

  const load = () => fetch('/api/users').then(r => r.json()).then(setUsers);
  useEffect(() => { load(); }, []);

  const handleOpen = (u?: User) => {
    setEdit(u || null);
    setForm(u ? { name: u.name || '', email: u.email, role: u.role, firma: u.firma || 'Notabene' } : { name: '', email: '', role: 'user', firma: 'Notabene' });
    setActive(u?.active !== false);
    // forcePasswordChange entfernt
    setPassword('');
    setPasswordRepeat('');
    setPasswordError('');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    // Passwort-Validierung, wenn Passwort gesetzt werden soll (bei Neuanlage oder Owner-Edit)
    if (!edit || edit) {
      if (password.length > 0) {
        if (password.length < 8) {
          setPasswordError('Passwort muss mindestens 8 Zeichen lang sein.');
          return;
        }
        if (password !== passwordRepeat) {
          setPasswordError('Passwörter stimmen nicht überein.');
          return;
        }
      }
    }
    if (edit) {
      const body = { _id: edit._id, ...form, active };
      if (password.length > 0) {
        (body as any).password = password;
      }
      await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, password, status: 'pending', active }) });
    }
    setOpen(false); load();
  };
  const handleForcePasswordChange = async () => {
    if (!edit) return;
    // forcePasswordChange entfernt
  };
  const handleDelete = async (_id: string) => {
    if (!window.confirm('Benutzer wirklich löschen?')) return;
    await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id }) });
    load();
    
  };

  return (
    <Box sx={{ mt: 4 }}>
      {isAdminOrOwner && (
        <>
          <Typography variant="h6" gutterBottom>Benutzerverwaltung</Typography>
          <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Benutzer anlegen</Button>
        </>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>E-Mail</TableCell><TableCell>Firma</TableCell><TableCell>Rolle</TableCell><TableCell>Status</TableCell><TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u._id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.firma || 'Notabene'}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  {u.active === false ? (
                    <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>inaktiv</span>
                  ) : (
                    <span style={{ color: '#388e3c', fontWeight: 'bold' }}>aktiv</span>
                  )}
                  {/* forcePasswordChange entfernt */}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(u)} disabled={u.role === 'owner' && u.email !== myEmail}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(u._id)} disabled={u.role === 'owner'}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{edit ? 'Benutzer bearbeiten' : 'Benutzer einladen'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth margin="normal" />
          <TextField label="E-Mail" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} fullWidth margin="normal" />
          <FormControlLabel
            control={<Checkbox checked={active} onChange={e => setActive(e.target.checked)} color="primary" disabled={edit?.role === 'owner' && edit?.email !== myEmail} />}
            label={active ? 'Aktiv' : 'Deaktiviert'}
            sx={{ mt: 1 }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Rolle</InputLabel>
            <Select labelId="role-label" value={form.role} label="Rolle" onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <MenuItem value="user" disabled={
                !!(
                  (edit && edit.role === 'owner') ||
                  (edit && edit.role === 'admin' && myRole !== 'owner')
                )
              }>User</MenuItem>
              <MenuItem value="admin" disabled={
                !!(
                  (edit && edit.role === 'owner')
                )
              }>Admin</MenuItem>
              <MenuItem value="owner" disabled={form.email !== 'michael.wessely@notabene.at' ? true : false}>Owner</MenuItem>
            </Select>
          </FormControl>
          {}
           {(
              !edit || edit
            ) && (
              <>
                <TextField
                  label="Passwort"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!passwordError}
                  helperText={passwordError}
                  disabled={!!(edit && edit.email !== myEmail && myEmail !== 'michael.wessely@notabene.at')}
                />
                <TextField
                  label="Passwort wiederholen"
                  type="password"
                  value={passwordRepeat}
                  onChange={e => setPasswordRepeat(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!passwordError && password !== passwordRepeat}
                  helperText={password !== passwordRepeat && passwordRepeat.length > 0 ? 'Passwörter stimmen nicht überein.' : ''}
                  inputProps={{
                    onPaste: (e) => e.preventDefault(),
                    onCopy: (e) => e.preventDefault(),
                    autoComplete: 'new-password',
                  }}
                  disabled={!!(edit && edit.email !== myEmail && myEmail !== 'michael.wessely@notabene.at')}
                />
              </>
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