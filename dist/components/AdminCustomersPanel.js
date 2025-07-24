const _jsxFileName = "src\\components\\AdminCustomersPanel.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';











export default function AdminCustomersPanel() {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', ort: '', telefon: '', email: '', ncode: '', lanzahl: '' });
  const [search, setSearch] = useState('');
  const { data: session } = useSession();
  const myRole = _optionalChain([(_optionalChain([session, 'optionalAccess', _ => _.user]) ), 'optionalAccess', _2 => _2.role]);
  const isAdminOrOwner = myRole === 'admin' || myRole === 'owner';

  const load = () => fetch('/api/customers').then(r => r.json()).then(setCustomers);
  useEffect(() => { load(); }, []);

  const handleOpen = (c) => {
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
  const handleDelete = async (_id) => {
    if (!window.confirm('Kunde wirklich löschen?')) return;
    await fetch('/api/customers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id }) });
    load();
  };

  return (
    React.createElement(Box, { sx: { mt: 4 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}
      , isAdminOrOwner && (
        React.createElement(React.Fragment, null
          , React.createElement(Typography, { variant: "h6", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, "Kundenverwaltung")
          , React.createElement(Button, { variant: "contained", onClick: () => handleOpen(), sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, "Kunde hinzufügen" )
        )
      )
      , React.createElement(Box, { sx: { display: 'flex', justifyContent: 'flex-end', mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 61}}
        , React.createElement(TextField, {
          label: "Kunden suchen" ,
          value: search,
          onChange: e => setSearch(e.target.value),
          sx: { maxWidth: 400, bgcolor: '#f5f8fa', borderRadius: 2 },
          InputProps: {
            startAdornment: (
              React.createElement(InputAdornment, { position: "start", __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}
                , React.createElement(SearchIcon, { color: "action", __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}} )
              )
            ),
            style: { borderRadius: 8, background: '#f5f8fa', paddingLeft: 4 }
          },
          fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}
        )
      )
      , React.createElement(TableContainer, { component: Paper, __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
        , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}
          , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}
            , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}
              , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}, "Name"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}, "Ort"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}, "Telefon"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}, "E-Mail"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}, "N-Code")
              , isAdminOrOwner && React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Lanzahl")
              , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 84}})
            )
          )
          , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}
            , customers.filter(c => {
              // Hilfsfunktion: entfernt Leerzeichen und Sonderzeichen
              const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9äöüß@.]/gi, '');
              const q = normalize(search);
              return (
                normalize(c.name).includes(q) ||
                normalize(c.ort).includes(q) ||
                normalize(c.telefon).includes(q) ||
                normalize(c.email || '').includes(q) ||
                normalize(c.ncode || '').includes(q)
              );
            }).map(c => (
              React.createElement(TableRow, { key: c._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, c.name), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, c.ort), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, c.telefon), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, c.email), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, c.ncode || '')
                , isAdminOrOwner && React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}, c.lanzahl)
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}
                  , React.createElement(IconButton, { onClick: () => handleOpen(c), __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}, React.createElement(EditIcon, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 104}} ))
                  , React.createElement(IconButton, { onClick: () => handleDelete(c._id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}, React.createElement(DeleteIcon, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 105}} ))
                )
              )
            ))
          )
        )
      )
      , React.createElement(Dialog, { open: open, onClose: handleClose, __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}
        , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}, edit ? 'Kunde bearbeiten' : 'Kunde hinzufügen')
        , React.createElement(DialogContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
          , React.createElement(TextField, { label: "Name", value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}} )
          , React.createElement(TextField, { label: "Ort", value: form.ort, onChange: e => setForm(f => ({ ...f, ort: e.target.value })), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}} )
          , React.createElement(TextField, { label: "Telefon", value: form.telefon, onChange: e => setForm(f => ({ ...f, telefon: e.target.value })), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
          , React.createElement(TextField, { label: "E-Mail", value: form.email, onChange: e => setForm(f => ({ ...f, email: e.target.value })), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}} )
          , React.createElement(TextField, { label: "N-Code", value: form.ncode, onChange: e => setForm(f => ({ ...f, ncode: e.target.value })), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}} )
          , isAdminOrOwner && (
            React.createElement(TextField, { label: "Lanzahl", value: form.lanzahl, onChange: e => setForm(f => ({ ...f, lanzahl: e.target.value })), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}} )
          )
        )
        , React.createElement(DialogActions, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
          , React.createElement(Button, { onClick: handleClose, __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}, "Abbrechen")
          , React.createElement(Button, { onClick: handleSave, variant: "contained", __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}, "Speichern")
        )
      )
    )
  );
} 