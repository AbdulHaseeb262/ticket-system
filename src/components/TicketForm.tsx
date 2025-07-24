'use client';
import { useEffect, useState } from 'react';
import { Box, Button, Container, TextField, Typography, MenuItem, Select, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';
import CustomerDropdown, { Customer } from './CustomerDropdown';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';

interface User { _id: string; name: string; email: string; }
interface Topic { _id: string; name: string; }

interface TicketFormProps {
  userId: string;
}

const statusOptions = [
  { value: 'offen', label: 'Offen' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung' },
  { value: 'erledigt', label: 'Erledigt' },
];
const prioOptions = [
  { value: 'niedrig', label: 'Niedrig' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'hoch', label: 'Hoch' },
];

export default function TicketForm({ userId }: TicketFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [software, setSoftware] = useState('Notabene 5');
  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('offen');
  const [assignee, setAssignee] = useState(userId);
  const [users, setUsers] = useState<User[]>([]);
  const [prio, setPrio] = useState('mittel');
  const [due, setDue] = useState(() => new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updateType, setUpdateType] = useState('durch_uns');
  const [updateAppointment, setUpdateAppointment] = useState<Date | null>(null);

  useEffect(() => {
    fetch('/api/topics').then(r => r.json()).then(setTopics);
    fetch('/api/users').then(r => r.json()).then(setUsers);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSuccess(''); setError('');
    const body = {
      customerId: customer?._id,
      topic,
      subject,
      desc,
      status,
      assignee,
      prio,
      due,
      file: file ? file.name : undefined,
      updateType,
      updateAppointment: updateAppointment ? updateAppointment.toISOString().slice(0, 10) : undefined,
      createdAt: new Date(),
    };
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setSuccess('Ticket gespeichert!');
      setCustomer(null); setTopic(''); setSubject(''); setDesc(''); setStatus('offen'); setAssignee(''); setPrio('mittel'); setDue(''); setFile(null);
    } else {
      setError('Fehler beim Speichern.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Neues Ticket</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <CustomerDropdown
          value={customer}
          onChange={setCustomer}
          softwareValue={software}
          onSoftwareChange={setSoftware}
        />
        {/* Themen-Auswahl: Autocomplete statt Select */}
        <Autocomplete
          options={topics}
          getOptionLabel={o => o.name}
          value={topics.find(t => t._id === topic) || null}
          onChange={(_, v) => setTopic(v ? v._id : '')}
          isOptionEqualToValue={(a, b) => a._id === b._id}
          filterOptions={(opts, { inputValue }) =>
            opts.filter(o => o.name.toLowerCase().includes(inputValue.toLowerCase()))
          }
          renderInput={params => (
            <TextField {...params} label="Thema" fullWidth />
          )}
          ListboxProps={{
            style: {
              maxHeight: 120, // ca. 3 Zeilen
              overflowY: 'auto',
            },
          }}
        />
        <TextField label="Beschreibung" value={desc} onChange={e => setDesc(e.target.value)} fullWidth margin="normal" multiline minRows={3} required />
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-label">Status</InputLabel>
          <Select labelId="status-label" value={status} label="Status" onChange={e => setStatus(e.target.value)}>
            {statusOptions.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="assignee-label">Zuweisen an</InputLabel>
          <Select labelId="assignee-label" value={assignee} label="Zuweisen an" onChange={e => setAssignee(e.target.value)}>
            {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name} ({u.email})</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="prio-label">Priorität</InputLabel>
          <Select labelId="prio-label" value={prio} label="Priorität" onChange={e => setPrio(e.target.value)}>
            {prioOptions.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
          </Select>
        </FormControl>
        {/* Fälligkeitsdatum mit deutschem Kalender */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
          <DatePicker
            label="Fälligkeitsdatum"
            value={due ? new Date(due) : null}
            onChange={val => setDue(val ? val.toISOString().slice(0, 10) : '')}
            slotProps={{ textField: { fullWidth: true, margin: 'normal', InputLabelProps: { shrink: true } } }}
            format="dd.MM.yyyy"
          />
        </LocalizationProvider>
        {(() => {
          const topicName = topics.find(t => t._id === topic)?.name?.toLowerCase();
          if (topicName === 'updates') {
            return <>
              <FormControl fullWidth margin="normal">
                <InputLabel id="update-type-label">Update-Art</InputLabel>
                <Select
                  labelId="update-type-label"
                  value={updateType}
                  label="Update-Art"
                  onChange={e => setUpdateType(e.target.value)}
                >
                  <MenuItem value="durch_uns">Update installiert durch uns</MenuItem>
                  <MenuItem value="selbst">Selbstinstallation</MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                <DatePicker
                  label="Termin vereinbart"
                  value={updateAppointment}
                  onChange={val => setUpdateAppointment(val)}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal', InputLabelProps: { shrink: true } } }}
                  format="dd.MM.yyyy"
                />
              </LocalizationProvider>
            </>;
          }
          return null;
        })()}
        {/* Anzeige des deutschen Datumsformats entfernt */}
        <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
          E-Mail/Anhang importieren
          <input type="file" hidden onChange={handleFile} />
        </Button>
        {file && <Typography variant="body2" sx={{ mt: 1 }}>Datei: {file.name}</Typography>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Ticket speichern'}
        </Button>
      </Box>
    </Container>
  );
} 