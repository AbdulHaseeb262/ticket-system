const _jsxFileName = "src\\components\\AdminTopicsPanel.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { useSession } from 'next-auth/react';






export default function AdminTopicsPanel() {
  const [topics, setTopics] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [search, setSearch] = useState('');

  const load = () => fetch('/api/topics').then(r => r.json()).then(setTopics);
  useEffect(() => { load(); }, []);

  const handleOpen = (t) => {
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
  const handleDelete = async (_id) => {
    if (!window.confirm('Thema wirklich löschen?')) return;
    await fetch('/api/topics', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id }) });
    load();
  };

  const { data: session } = useSession();
  const myRole = _optionalChain([(_optionalChain([session, 'optionalAccess', _ => _.user]) ), 'optionalAccess', _2 => _2.role]);
  const isAdminOrOwner = myRole === 'admin' || myRole === 'owner';

  return (
    React.createElement(Box, { sx: { mt: 4 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}
      , isAdminOrOwner && (
        React.createElement(React.Fragment, null
          , React.createElement(Typography, { variant: "h6", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}, "Themenverwaltung")
          , React.createElement(Button, { variant: "contained", onClick: () => handleOpen(), sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}, "Thema hinzufügen" )
        )
      )
      , React.createElement(Box, { sx: { display: 'flex', justifyContent: 'flex-end', mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}
        , React.createElement(TextField, {
          label: "Themen suchen" ,
          value: search,
          onChange: e => setSearch(e.target.value),
          sx: { maxWidth: 400, bgcolor: '#f5f8fa', borderRadius: 2 },
          InputProps: {
            startAdornment: (
              React.createElement(InputAdornment, { position: "start", __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}
                , React.createElement(SearchIcon, { color: "action", __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}} )
              )
            ),
            style: { borderRadius: 8, background: '#f5f8fa', paddingLeft: 4 }
          },
          fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}
        )
      )
      , React.createElement(TableContainer, { component: Paper, __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}
        , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
          , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
            , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}
              , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}, "Name"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 79}})
            )
          )
          , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}
            , topics.filter(t => {
              const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9äöüß]/gi, '');
              const q = normalize(search);
              return normalize(t.name).includes(q);
            }).map(t => (
              React.createElement(TableRow, { key: t._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}, t.name)
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}
                  , React.createElement(IconButton, { onClick: () => handleOpen(t), __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}, React.createElement(EditIcon, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 91}} ))
                  , React.createElement(IconButton, { onClick: () => handleDelete(t._id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}, React.createElement(DeleteIcon, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 92}} ))
                )
              )
            ))
          )
        )
      )
      , React.createElement(Dialog, { open: open, onClose: handleClose, __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}
        , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}, edit ? 'Thema bearbeiten' : 'Thema hinzufügen')
        , React.createElement(DialogContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
          , React.createElement(TextField, { label: "Name", value: form.name, onChange: e => setForm({ name: e.target.value }), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}} )
        )
        , React.createElement(DialogActions, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}
          , React.createElement(Button, { onClick: handleClose, __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}, "Abbrechen")
          , React.createElement(Button, { onClick: handleSave, variant: "contained", __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}, "Speichern")
        )
      )
    )
  );
} 