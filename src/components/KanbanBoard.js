const _jsxFileName = "src\\components\\KanbanBoard.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Select, MenuItem, InputLabel, FormControl, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete, IconButton } from '@mui/material';
import { DragDropContext, Droppable, Draggable, } from '@hello-pangea/dnd';
import EditIcon from '@mui/icons-material/Edit';
import CommentsSection from './CommentsSection';
import { DatePicker, LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSession } from 'next-auth/react';



















const statusCols = [
  { key: 'offen', label: 'Offen' },
  { key: 'in_bearbeitung', label: 'In Bearbeitung' },
  { key: 'erledigt', label: 'Erledigt' },
];

export default function KanbanBoard({ userId }) {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('me');
  const [loading, setLoading] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [topics, setTopics] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerFilter, setCustomerFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [prioFilter, setPrioFilter] = useState('');
  const [customerFilterInput, setCustomerFilterInput] = useState('');
  const [topicFilterInput, setTopicFilterInput] = useState('');

  // Drag & Drop für E-Mail-Dateien
  const [dropActive, setDropActive] = useState(false);
  const [dropStatus, setDropStatus] = useState(null);
  const handleDrop = async (e) => {
    e.preventDefault();
    setDropActive(false);
    setDropStatus('Verarbeite Datei...');
    const file = e.dataTransfer.files[0];
    if (!file) return setDropStatus('Keine Datei erkannt.');
    const formData = new FormData();
    formData.append('file', file);
    if (session && _optionalChain([(session.user ), 'optionalAccess', _2 => _2.id])) formData.append('assignee', (session.user ).id);
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
  const handleDragOver = (e) => { e.preventDefault(); setDropActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDropActive(false); };

  const { data: session } = useSession();
  const isAdminOrOwner = _optionalChain([(_optionalChain([session, 'optionalAccess', _3 => _3.user]) ), 'optionalAccess', _4 => _4.role]) === 'admin' || _optionalChain([(_optionalChain([session, 'optionalAccess', _5 => _5.user]) ), 'optionalAccess', _6 => _6.role]) === 'owner';

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

  const handleDeleteTicket = async (ticketId) => {
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

  const onDragEnd = async (result) => {
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

  const handleEditOpen = (ticket) => {
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
    React.createElement(Box, { sx: { mt: 4 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
      /* Drag & Drop Zone für E-Mail-Dateien */
      , React.createElement(Box, {
        onDrop: handleDrop,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        sx: {
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
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}

        , dropStatus ? dropStatus : 'E-Mail-Datei hierher ziehen, um automatisch ein Ticket zu erstellen'
      )
      , React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}}
        , React.createElement(FormControl, { sx: { minWidth: 180 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}}
          , React.createElement(InputLabel, { id: "filter-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}, "Tickets anzeigen" )
          , React.createElement(Select, { labelId: "filter-label", value: filter, label: "Tickets anzeigen" , onChange: e => setFilter(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
            , React.createElement(MenuItem, { value: "me", __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}, "Meine Tickets" )
            , React.createElement(MenuItem, { value: "all", __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}, "Alle Tickets" )
            , users.map(u => React.createElement(MenuItem, { key: u._id, value: u._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}, u.name))
          )
        )
        , React.createElement(Autocomplete, {
          options: [{ _id: '', name: 'Alle' }, ...customers],
          getOptionLabel: o => o.name,
          value: customers.find(c => c._id === customerFilter) || (customerFilter === '' ? { _id: '', name: 'Alle' } : null),
          onChange: (_, v) => setCustomerFilter(v ? v._id : ''),
          inputValue: customerFilterInput,
          onInputChange: (_, v) => setCustomerFilterInput(v),
          renderInput: params => (
            React.createElement(TextField, { ...params, label: "Kunde", fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}} )
          ),
          renderOption: (props, option, idx) => (
            React.createElement(Box, { component: "li", ...props, key: option._id || option.name + '-' + idx, __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}
              , option.name
            )
          ),
          ListboxProps: { style: { maxHeight: 200, overflowY: 'auto' } },
          sx: { minWidth: 160 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}
        )
        , React.createElement(Autocomplete, {
          options: [{ _id: '', name: 'Alle' }, ...topics],
          getOptionLabel: o => o.name,
          value: topics.find(t => t._id === topicFilter) || (topicFilter === '' ? { _id: '', name: 'Alle' } : null),
          onChange: (_, v) => setTopicFilter(v ? v._id : ''),
          inputValue: topicFilterInput,
          onInputChange: (_, v) => setTopicFilterInput(v),
          renderInput: params => (
            React.createElement(TextField, { ...params, label: "Thema", fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}} )
          ),
          renderOption: (props, option, idx) => (
            React.createElement(Box, { component: "li", ...props, key: option._id || option.name + '-' + idx, __self: this, __source: {fileName: _jsxFileName, lineNumber: 242}}
              , option.name
            )
          ),
          ListboxProps: { style: { maxHeight: 200, overflowY: 'auto' } },
          sx: { minWidth: 140 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 231}}
        )
        , React.createElement(FormControl, { sx: { minWidth: 120 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}
          , React.createElement(InputLabel, { id: "prio-filter-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}, "Prio")
          , React.createElement(Select, { labelId: "prio-filter-label", value: prioFilter, label: "Prio", onChange: e => setPrioFilter(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}
            , React.createElement(MenuItem, { value: "", __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}}, "Alle")
            , React.createElement(MenuItem, { value: "niedrig", __self: this, __source: {fileName: _jsxFileName, lineNumber: 253}}, "Niedrig")
            , React.createElement(MenuItem, { value: "mittel", __self: this, __source: {fileName: _jsxFileName, lineNumber: 254}}, "Mittel")
            , React.createElement(MenuItem, { value: "hoch", __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}, "Hoch")
          )
        )
        , React.createElement(Button, { variant: "outlined", onClick: () => window.location.reload(), __self: this, __source: {fileName: _jsxFileName, lineNumber: 258}}, "Aktualisieren")
      )
      , loading ? React.createElement(CircularProgress, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 260}} ) : (
        React.createElement(DragDropContext, { onDragEnd: onDragEnd, __self: this, __source: {fileName: _jsxFileName, lineNumber: 261}}
          , React.createElement(Box, { sx: { display: 'flex', gap: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 262}}
            , grouped.map((col, idx) => (
              React.createElement(Droppable, { droppableId: col.key, key: col.key + '-' + idx, isDropDisabled: false, __self: this, __source: {fileName: _jsxFileName, lineNumber: 264}}
                , (provided) => (
                  React.createElement(Paper, { ref: provided.innerRef, ...provided.droppableProps, sx: { flex: 1, minWidth: 320, minHeight: 700, maxHeight: '80vh', p: 2, overflowY: 'auto' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}}
                    , React.createElement(Typography, { variant: "h6", align: "center", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 267}}, col.label)
                    , col.tickets.map((t, idx) => (
                      React.createElement(Draggable, { draggableId: t._id, index: idx, key: t._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}
                        , (prov) => (
                          React.createElement(Box, { ref: prov.innerRef, ...prov.draggableProps, ...prov.dragHandleProps, sx: { mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, cursor: 'pointer' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}}
                            , React.createElement(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 272}}
                              , React.createElement(Typography, { fontWeight: "bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}
                                , _optionalChain([customers, 'access', _7 => _7.find, 'call', _8 => _8(c => c._id === t.customerId), 'optionalAccess', _9 => _9.name]) || 'Kunde unbekannt'
                              )
                              , React.createElement(IconButton, { size: "small", onClick: () => handleEditOpen(t), __self: this, __source: {fileName: _jsxFileName, lineNumber: 276}}, React.createElement(EditIcon, { fontSize: "small", __self: this, __source: {fileName: _jsxFileName, lineNumber: 276}} ))
                              , isAdminOrOwner && (
                                React.createElement(IconButton, { size: "small", onClick: () => handleDeleteTicket(t._id), color: "error", sx: { ml: 0.5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 278}}
                                  , React.createElement(DeleteIcon, { fontSize: "small", __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}} )
                                )
                              )
                            )
                            , React.createElement(Typography, { variant: "body2", color: "text.secondary", __self: this, __source: {fileName: _jsxFileName, lineNumber: 283}}
                              , _optionalChain([topics, 'access', _10 => _10.find, 'call', _11 => _11(tp => tp._id === t.topic), 'optionalAccess', _12 => _12.name]) || ''
                            )
                            , React.createElement(Typography, { variant: "subtitle2", sx: { color: t.prio === 'hoch' ? 'error.main' : t.prio === 'mittel' ? 'orange' : 'success.main', fontWeight: 'bold' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}}, "Prio: "
                               , t.prio
                            )
                            , React.createElement(Typography, { variant: "subtitle2", sx: { mt: 0.5 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 289}}, "Fällig: "
                               , t.due ? (() => {
                                const d = new Date(t.due);
                                d.setHours(17, 0, 0, 0);
                                return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                              })() : ''
                            )
                            , t.file && (
                              React.createElement(Typography, { variant: "body2", sx: { mt: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 297}}
                                , React.createElement('a', {
                                  href: 
                                    typeof t.file === 'string'
                                      ? `/api/files/${encodeURIComponent(t.file)}`
                                      : ((t.file ) instanceof File)
                                        ? URL.createObjectURL(t.file )
                                        : '#'
                                  ,
                                  target: "_blank",
                                  rel: "noopener noreferrer" ,
                                  download: true,
                                  style: { textDecoration: 'underline', color: '#1976d2', wordBreak: 'break-all' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 298}}

                                  , typeof t.file === 'string'
                                    ? t.file
                                    : ((t.file ) instanceof File)
                                      ? (t.file ).name
                                      : ''
                                )
                              )
                            )
                            /* Kommentar-Badge */
                            /* <CommentsCount ticketId={t._id} /> */
                            /* (CommentsCount-Komponente muss ggf. noch erstellt werden, um die Anzahl der Kommentare anzuzeigen.) */
                          )
                        )
                      )
                    ))
                    , provided.placeholder
                  )
                )
              )
            ))
          )
        )
      )

      /* Edit Dialog */
      , React.createElement(Dialog, { open: !!editTicket, onClose: handleEditClose, __self: this, __source: {fileName: _jsxFileName, lineNumber: 336}}
        , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 337}}, "Ticket bearbeiten" )
        , React.createElement(DialogContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 338}}
          , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 339}}
            , React.createElement(InputLabel, { id: "customer-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 340}}, "Kunde")
            , React.createElement(Select, { labelId: "customer-label", value: editForm.customerId || '', label: "Kunde", onChange: e => setEditForm((f) => ({ ...f, customerId: e.target.value })), __self: this, __source: {fileName: _jsxFileName, lineNumber: 341}}
              , customers.map(c => React.createElement(MenuItem, { key: c._id, value: c._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 342}}, c.name))
            )
          )
          , React.createElement(Autocomplete, {
            options: topics,
            getOptionLabel: o => o.name,
            value: topics.find(t => t._id === editForm.topic) || null,
            onChange: (_, v) => setEditForm((f) => ({ ...f, topic: v ? v._id : '' })),
            renderInput: params => (
              React.createElement(TextField, { ...params, label: "Thema", fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 351}} )
            ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 345}}
          )
          /* Wenn Thema 'Updates' gewählt ist, zeige zwei zusätzliche Felder */
          , (() => {
            const topicName = _optionalChain([topics, 'access', _13 => _13.find, 'call', _14 => _14(t => t._id === editForm.topic), 'optionalAccess', _15 => _15.name, 'optionalAccess', _16 => _16.toLowerCase, 'call', _17 => _17()]);
            if (topicName === 'updates') {
              return React.createElement(React.Fragment, null
                , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 359}}
                  , React.createElement(InputLabel, { id: "update-type-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 360}}, "Update-Art")
                  , React.createElement(Select, {
                    labelId: "update-type-label",
                    value: editForm.updateType || '',
                    label: "Update-Art",
                    onChange: e => setEditForm((f) => ({ ...f, updateType: e.target.value })), __self: this, __source: {fileName: _jsxFileName, lineNumber: 361}}

                    , React.createElement(MenuItem, { value: "durch_uns", __self: this, __source: {fileName: _jsxFileName, lineNumber: 367}}, "Update installiert durch uns"   )
                    , React.createElement(MenuItem, { value: "selbst", __self: this, __source: {fileName: _jsxFileName, lineNumber: 368}}, "Selbstinstallation")
                  )
                )
                , React.createElement(LocalizationProvider, { dateAdapter: AdapterDateFns, adapterLocale: de, __self: this, __source: {fileName: _jsxFileName, lineNumber: 371}}
                  , React.createElement(DateTimePicker, {
                    label: "Termin vereinbart" ,
                    value: editForm.updateAppointment ? new Date(editForm.updateAppointment) : null,
                    onChange: val => setEditForm((f) => ({ ...f, updateAppointment: val ? val.toISOString() : '' })),
                    slotProps: { textField: { fullWidth: true, margin: 'normal', InputLabelProps: { shrink: true } } },
                    format: "dd.MM.yyyy HH:mm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 372}}
                  )
                  , React.createElement(Typography, { variant: "caption", color: "text.secondary", sx: { ml: 0.5, mb: 2, display: 'block' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 379}}, "15 Minuten vor dem Termin erfolgt ein Trigger/Reminder."

                  )
                )
              );
            }
            return null;
          })()
          , React.createElement(TextField, { label: "Beschreibung", value: editForm.desc || '', onChange: e => setEditForm((f) => ({ ...f, desc: e.target.value })), fullWidth: true, margin: "normal", multiline: true, minRows: 2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 387}} )
          , React.createElement(LocalizationProvider, { dateAdapter: AdapterDateFns, adapterLocale: de, __self: this, __source: {fileName: _jsxFileName, lineNumber: 388}}
            , React.createElement(DatePicker, {
              label: "Fälligkeitsdatum",
              value: editForm.due ? new Date(editForm.due) : null,
              onChange: val => setEditForm((f) => ({ ...f, due: val ? val.toISOString().slice(0, 10) : '' })),
              slotProps: { textField: { fullWidth: true, margin: 'normal', InputLabelProps: { shrink: true } } },
              format: "dd.MM.yyyy", __self: this, __source: {fileName: _jsxFileName, lineNumber: 389}}
            )
          )
          , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 397}}
            , React.createElement(InputLabel, { id: "prio-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 398}}, "Prio")
            , React.createElement(Select, { labelId: "prio-label", value: editForm.prio || '', label: "Prio", onChange: e => setEditForm((f) => ({ ...f, prio: e.target.value })), __self: this, __source: {fileName: _jsxFileName, lineNumber: 399}}
              , React.createElement(MenuItem, { value: "niedrig", __self: this, __source: {fileName: _jsxFileName, lineNumber: 400}}, "Niedrig")
              , React.createElement(MenuItem, { value: "mittel", __self: this, __source: {fileName: _jsxFileName, lineNumber: 401}}, "Mittel")
              , React.createElement(MenuItem, { value: "hoch", __self: this, __source: {fileName: _jsxFileName, lineNumber: 402}}, "Hoch")
            )
          )
          , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 405}}
            , React.createElement(InputLabel, { id: "status-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 406}}, "Status")
            , React.createElement(Select, { labelId: "status-label", value: editForm.status || '', label: "Status", onChange: e => setEditForm((f) => ({ ...f, status: e.target.value })), __self: this, __source: {fileName: _jsxFileName, lineNumber: 407}}
              , React.createElement(MenuItem, { value: "offen", __self: this, __source: {fileName: _jsxFileName, lineNumber: 408}}, "Offen")
              , React.createElement(MenuItem, { value: "in_bearbeitung", __self: this, __source: {fileName: _jsxFileName, lineNumber: 409}}, "In Bearbeitung" )
              , React.createElement(MenuItem, { value: "erledigt", __self: this, __source: {fileName: _jsxFileName, lineNumber: 410}}, "Erledigt")
            )
          )
          , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 413}}
            , React.createElement(InputLabel, { id: "assignee-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 414}}, "Zugewiesen an" )
            , React.createElement(Select, { labelId: "assignee-label", value: editForm.assignee || '', label: "Zugewiesen an" , onChange: e => setEditForm((f) => ({ ...f, assignee: e.target.value })), __self: this, __source: {fileName: _jsxFileName, lineNumber: 415}}
              , users.map(u => React.createElement(MenuItem, { key: u._id, value: u._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 416}}, u.name))
            )
          )
          , React.createElement(Box, { sx: { mt: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 419}}
            , React.createElement(Button, { variant: "outlined", component: "label", fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 420}}, "Datei hochladen"

              , React.createElement('input', {
                type: "file",
                hidden: true,
                onChange: e => {
                  const file = _optionalChain([e, 'access', _18 => _18.target, 'access', _19 => _19.files, 'optionalAccess', _20 => _20[0]]);
                  if (file) {
                    setEditForm((f) => ({ ...f, file }));
                  }
                }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 422}}
              )
            )
            , (
              (editForm.file instanceof File) ||
              (typeof editForm.file === 'string' && editForm.file.trim() !== '')
            ) && !(
              typeof editForm.file === 'object' &&
              editForm.file &&
              Object.prototype.toString.call(editForm.file) === '[object Object]' &&
              Object.keys(editForm.file).length === 0
            ) && (
              React.createElement(Box, { sx: { mt: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 442}}
                , React.createElement(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 443}}
                  , React.createElement(Typography, { variant: "body2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 444}}, "Datei: "
                     , editForm.file instanceof File ? editForm.file.name : editForm.file
                  )
                  , React.createElement(Button, {
                    size: "small",
                    color: "error",
                    onClick: () => setEditForm((f) => ({ ...f, file: '' })), __self: this, __source: {fileName: _jsxFileName, lineNumber: 447}}
, "Entfernen"

                  )
                  , React.createElement(Button, {
                    variant: "text",
                    size: "small",
                    onClick: () => {
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
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 454}}
, "Herunterladen"

                  )
                )
              )
            )
          )
          , editForm._id && userId && (
            React.createElement(CommentsSection, { ticketId: editForm._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 481}} )
          )
        )
        , React.createElement(DialogActions, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 484}}
          , React.createElement(Button, { onClick: handleEditClose, __self: this, __source: {fileName: _jsxFileName, lineNumber: 485}}, "Abbrechen")
          , React.createElement(Button, { onClick: handleEditSave, variant: "contained", __self: this, __source: {fileName: _jsxFileName, lineNumber: 486}}, "Speichern")
        )
      )
    )
  );
} 