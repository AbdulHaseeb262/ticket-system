'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Select, MenuItem, InputLabel, FormControl, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete, IconButton } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import EditIcon from '@mui/icons-material/Edit';
import CommentsSection from './CommentsSection';
import { DatePicker, LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSession } from 'next-auth/react';

interface Ticket {
  _id: string;
  subject: string;
  desc: string;
  status: string;
  assignee?: string;
  prio?: string;
  due?: string;
  customerId?: string;
  topic?: string;
  file?: string;
}
interface User { _id: string; name: string; }

interface KanbanBoardProps {
  userId: string;
}

const statusCols = [
  { key: 'offen', label: 'Offen' },
  { key: 'in_bearbeitung', label: 'In Bearbeitung' },
  { key: 'erledigt', label: 'Erledigt' },
];

export default function KanbanBoard({ userId }: KanbanBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('me');
  const [loading, setLoading] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [topics, setTopics] = useState<{_id: string, name: string}[]>([]);
  const [customers, setCustomers] = useState<{_id: string, name: string}[]>([]);
  const [customerFilter, setCustomerFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [prioFilter, setPrioFilter] = useState('');
  const [customerFilterInput, setCustomerFilterInput] = useState('');
  const [topicFilterInput, setTopicFilterInput] = useState('');

  // Drag & Drop für E-Mail-Dateien
  const [dropActive, setDropActive] = useState(false);
  const [dropStatus, setDropStatus] = useState<string | null>(null);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(false);
    setDropStatus('Verarbeite Datei...');
    const file = e.dataTransfer.files[0];
    if (!file) return setDropStatus('Keine Datei erkannt.');
    const formData = new FormData();
    formData.append('file', file);
    if (session && (session.user as any)?.id) formData.append('assignee', (session.user as any).id);
    const res = await fetch('/api/parse-email', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.ticketCreated) {
      setDropStatus('Ticket automatisch erstellt!');
      setTimeout(() => setDropStatus(null), 2000);
      // Tickets neu laden
      fetch('/api/tickets').then(r => r.json()).then(setTickets);
    } else {
      setDropStatus(data.error || 'Konnte kein Ticket erstellen.');
      setTimeout(() => setDropStatus(null), 4000);
    }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDropActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDropActive(false); };

  const { data: session } = useSession();
  const isAdminOrOwner = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'owner';

  useEffect(() => {
    setLoading(true);
    fetch('/api/tickets').then(r => r.json()).then(ts => {
      setTickets(ts);
      // Entfernt: Keine Benachrichtigung mehr für bald ablaufende Tickets
    }).finally(() => setLoading(false));
    fetch('/api/users').then(r => r.json()).then(setUsers);
    fetch('/api/topics').then(r => r.json()).then(setTopics);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
  }, []);

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Ticket wirklich löschen?')) return;
    await fetch('/api/tickets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: ticketId })
    });
    setTickets(ts => ts.filter(t => t._id !== ticketId));
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'me') {
      if (t.assignee !== userId) return false;
    } else if (filter !== 'all') {
      if (t.assignee !== filter) return false;
    }
    if (customerFilter && t.customerId !== customerFilter) return false;
    if (topicFilter && t.topic !== topicFilter) return false;
    if (prioFilter && t.prio !== prioFilter) return false;
    return true;
  });

  const grouped = statusCols.map(col => ({
    ...col,
    tickets: filteredTickets.filter(t => t.status === col.key),
  }));

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const ticketId = result.draggableId;
    const newStatus = result.destination.droppableId;
    setTickets(ts => ts.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));
    await fetch('/api/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: ticketId, status: newStatus })
    });
  };

  const handleEditOpen = (ticket: Ticket) => {
    setEditTicket(ticket);
    // file-Feld prüfen: Wenn es ein leeres Objekt ist, auf '' setzen
    let file = ticket.file;
    if (
      typeof file === 'object' &&
      file &&
      Object.prototype.toString.call(file) === '[object Object]' &&
      Object.keys(file).length === 0
    ) {
      file = '';
    }
    setEditForm({ ...ticket, file });
  };
  const handleEditClose = () => {
    setEditTicket(null);
    setEditForm({});
  };
  const handleEditSave = async () => {
    const prevTicket = tickets.find(t => t._id === editForm._id);
    await fetch('/api/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setTickets(ts => ts.map(t => t._id === editForm._id ? { ...t, ...editForm } : t));

    // Notification bei Assignment-Änderung
    if (prevTicket && editForm.assignee && prevTicket.assignee !== editForm.assignee) {
      const assignedUser = users.find(u => u._id === editForm.assignee);
      const fromUser = users.find(u => u._id === userId);
      if (assignedUser && fromUser) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: assignedUser._id,
            ticketId: editForm._id,
            message: `${fromUser.name} hat dir das Ticket zugewiesen`,
            from: fromUser.name,
            createdAt: new Date(),
            read: false
          })
        });
      }
    }
    handleEditClose();
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Drag & Drop Zone für E-Mail-Dateien */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: dropActive ? '2px dashed #1976d2' : '2px dashed #e0e0e0',
          bgcolor: dropActive ? '#e3eafc' : '#f7fafd',
          borderRadius: 3,
          p: 3,
          mb: 3,
          textAlign: 'center',
          fontWeight: 'bold',
          color: dropActive ? '#1976d2' : '#888',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
      >
        {dropStatus ? dropStatus : 'E-Mail-Datei hierher ziehen, um automatisch ein Ticket zu erstellen'}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="filter-label">Tickets anzeigen</InputLabel>
          <Select labelId="filter-label" value={filter} label="Tickets anzeigen" onChange={e => setFilter(e.target.value)}>
            <MenuItem value="me">Meine Tickets</MenuItem>
            <MenuItem value="all">Alle Tickets</MenuItem>
            {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Autocomplete
          options={[{ _id: '', name: 'Alle' }, ...customers]}
          getOptionLabel={o => o.name}
          value={customers.find(c => c._id === customerFilter) || (customerFilter === '' ? { _id: '', name: 'Alle' } : null)}
          onChange={(_, v) => setCustomerFilter(v ? v._id : '')}
          inputValue={customerFilterInput}
          onInputChange={(_, v) => setCustomerFilterInput(v)}
          renderInput={params => (
            <TextField {...params} label="Kunde" fullWidth />
          )}
          renderOption={(props, option, idx) => (
            <Box component="li" {...props} key={option._id || option.name + '-' + idx}>
              {option.name}
            </Box>
          )}
          ListboxProps={{ style: { maxHeight: 200, overflowY: 'auto' } }}
          sx={{ minWidth: 160 }}
        />
        <Autocomplete
          options={[{ _id: '', name: 'Alle' }, ...topics]}
          getOptionLabel={o => o.name}
          value={topics.find(t => t._id === topicFilter) || (topicFilter === '' ? { _id: '', name: 'Alle' } : null)}
          onChange={(_, v) => setTopicFilter(v ? v._id : '')}
          inputValue={topicFilterInput}
          onInputChange={(_, v) => setTopicFilterInput(v)}
          renderInput={params => (
            <TextField {...params} label="Thema" fullWidth />
          )}
          renderOption={(props, option, idx) => (
            <Box component="li" {...props} key={option._id || option.name + '-' + idx}>
              {option.name}
            </Box>
          )}
          ListboxProps={{ style: { maxHeight: 200, overflowY: 'auto' } }}
          sx={{ minWidth: 140 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="prio-filter-label">Prio</InputLabel>
          <Select labelId="prio-filter-label" value={prioFilter} label="Prio" onChange={e => setPrioFilter(e.target.value)}>
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="niedrig">Niedrig</MenuItem>
            <MenuItem value="mittel">Mittel</MenuItem>
            <MenuItem value="hoch">Hoch</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => window.location.reload()}>Aktualisieren</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {grouped.map((col, idx) => (
              <Droppable droppableId={col.key} key={col.key + '-' + idx} isDropDisabled={false}>
                {(provided: import('@hello-pangea/dnd').DroppableProvided) => (
                  <Paper ref={provided.innerRef} {...provided.droppableProps} sx={{ flex: 1, minWidth: 320, minHeight: 700, maxHeight: '80vh', p: 2, overflowY: 'auto' }}>
                    <Typography variant="h6" align="center" gutterBottom>{col.label}</Typography>
                    {col.tickets.map((t, idx) => (
                      <Draggable draggableId={t._id} index={idx} key={t._id}>
                        {(prov: import('@hello-pangea/dnd').DraggableProvided) => (
                          <Box ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, cursor: 'pointer' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography fontWeight="bold">
                                {customers.find(c => c._id === t.customerId)?.name || 'Kunde unbekannt'}
                              </Typography>
                              <IconButton size="small" onClick={() => handleEditOpen(t)}><EditIcon fontSize="small" /></IconButton>
                              {isAdminOrOwner && (
                                <IconButton size="small" onClick={() => handleDeleteTicket(t._id)} color="error" sx={{ ml: 0.5 }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {topics.find(tp => tp._id === t.topic)?.name || ''}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: t.prio === 'hoch' ? 'error.main' : t.prio === 'mittel' ? 'orange' : 'success.main', fontWeight: 'bold' }}>
                              Prio: {t.prio}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                              Fällig: {t.due ? (() => {
                                const d = new Date(t.due);
                                d.setHours(17, 0, 0, 0);
                                return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                              })() : ''}
                            </Typography>
                            {t.file && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                <a
                                  href={
                                    typeof t.file === 'string'
                                      ? `/api/files/${encodeURIComponent(t.file)}`
                                      : ((t.file as unknown) instanceof File)
                                        ? URL.createObjectURL(t.file as File)
                                        : '#'
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  style={{ textDecoration: 'underline', color: '#1976d2', wordBreak: 'break-all' }}
                                >
                                  {typeof t.file === 'string'
                                    ? t.file
                                    : ((t.file as unknown) instanceof File)
                                      ? (t.file as File).name
                                      : ''}
                                </a>
                              </Typography>
                            )}
                            {/* Kommentar-Badge */}
                            {/* <CommentsCount ticketId={t._id} /> */}
                            {/* (CommentsCount-Komponente muss ggf. noch erstellt werden, um die Anzahl der Kommentare anzuzeigen.) */}
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            ))}
          </Box>
        </DragDropContext>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editTicket} onClose={handleEditClose}>
        <DialogTitle>Ticket bearbeiten</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="customer-label">Kunde</InputLabel>
            <Select labelId="customer-label" value={editForm.customerId || ''} label="Kunde" onChange={e => setEditForm((f: any) => ({ ...f, customerId: e.target.value }))}>
              {customers.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Autocomplete
            options={topics}
            getOptionLabel={o => o.name}
            value={topics.find(t => t._id === editForm.topic) || null}
            onChange={(_, v) => setEditForm((f: any) => ({ ...f, topic: v ? v._id : '' }))}
            renderInput={params => (
              <TextField {...params} label="Thema" fullWidth margin="normal" />
            )}
          />
          {/* Wenn Thema 'Updates' gewählt ist, zeige zwei zusätzliche Felder */}
          {(() => {
            const topicName = topics.find(t => t._id === editForm.topic)?.name?.toLowerCase();
            if (topicName === 'updates') {
              return <>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="update-type-label">Update-Art</InputLabel>
                  <Select
                    labelId="update-type-label"
                    value={editForm.updateType || ''}
                    label="Update-Art"
                    onChange={e => setEditForm((f: any) => ({ ...f, updateType: e.target.value }))}
                  >
                    <MenuItem value="durch_uns">Update installiert durch uns</MenuItem>
                    <MenuItem value="selbst">Selbstinstallation</MenuItem>
                  </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                  <DateTimePicker
                    label="Termin vereinbart"
                    value={editForm.updateAppointment ? new Date(editForm.updateAppointment) : null}
                    onChange={val => setEditForm((f: any) => ({ ...f, updateAppointment: val ? val.toISOString() : '' }))}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal', InputLabelProps: { shrink: true } } }}
                    format="dd.MM.yyyy HH:mm"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, mb: 2, display: 'block' }}>
                    15 Minuten vor dem Termin erfolgt ein Trigger/Reminder.
                  </Typography>
                </LocalizationProvider>
              </>;
            }
            return null;
          })()}
          <TextField label="Beschreibung" value={editForm.desc || ''} onChange={e => setEditForm((f: any) => ({ ...f, desc: e.target.value }))} fullWidth margin="normal" multiline minRows={2} />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
            <DatePicker
              label="Fälligkeitsdatum"
              value={editForm.due ? new Date(editForm.due) : null}
              onChange={val => setEditForm((f: any) => ({ ...f, due: val ? val.toISOString().slice(0, 10) : '' }))}
              slotProps={{ textField: { fullWidth: true, margin: 'normal', InputLabelProps: { shrink: true } } }}
              format="dd.MM.yyyy"
            />
          </LocalizationProvider>
          <FormControl fullWidth margin="normal">
            <InputLabel id="prio-label">Prio</InputLabel>
            <Select labelId="prio-label" value={editForm.prio || ''} label="Prio" onChange={e => setEditForm((f: any) => ({ ...f, prio: e.target.value }))}>
              <MenuItem value="niedrig">Niedrig</MenuItem>
              <MenuItem value="mittel">Mittel</MenuItem>
              <MenuItem value="hoch">Hoch</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" value={editForm.status || ''} label="Status" onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))}>
              <MenuItem value="offen">Offen</MenuItem>
              <MenuItem value="in_bearbeitung">In Bearbeitung</MenuItem>
              <MenuItem value="erledigt">Erledigt</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="assignee-label">Zugewiesen an</InputLabel>
            <Select labelId="assignee-label" value={editForm.assignee || ''} label="Zugewiesen an" onChange={e => setEditForm((f: any) => ({ ...f, assignee: e.target.value }))}>
              {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label" fullWidth>
              Datei hochladen
              <input
                type="file"
                hidden
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditForm((f: any) => ({ ...f, file }));
                  }
                }}
              />
            </Button>
            {(
              (editForm.file instanceof File) ||
              (typeof editForm.file === 'string' && editForm.file.trim() !== '')
            ) && !(
              typeof editForm.file === 'object' &&
              editForm.file &&
              Object.prototype.toString.call(editForm.file) === '[object Object]' &&
              Object.keys(editForm.file).length === 0
            ) && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    Datei: {editForm.file instanceof File ? editForm.file.name : editForm.file}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setEditForm((f: any) => ({ ...f, file: '' }))}
                  >
                    Entfernen
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      let url = '';
                      let filename = '';
                      if (editForm.file instanceof File) {
                        url = URL.createObjectURL(editForm.file);
                        filename = editForm.file.name;
                      } else if (typeof editForm.file === 'string') {
                        url = `/api/files/${encodeURIComponent(editForm.file)}`;
                        filename = editForm.file;
                      }
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      a.click();
                      if (editForm.file instanceof File) URL.revokeObjectURL(url);
                    }}
                  >
                    Herunterladen
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          {editForm._id && userId && (
            <CommentsSection ticketId={editForm._id} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Abbrechen</Button>
          <Button onClick={handleEditSave} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 