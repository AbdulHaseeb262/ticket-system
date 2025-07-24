const _jsxFileName = "src\\components\\AdminUsersPanel.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Select, InputLabel, FormControl, Checkbox, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSession } from 'next-auth/react';











export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', firma: 'Notabene' });
  const [active, setActive] = useState(true);
  // forcePasswordChange entfernt
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { data: session } = useSession();
  const myEmail = _optionalChain([(_optionalChain([session, 'optionalAccess', _ => _.user]) ), 'optionalAccess', _2 => _2.email]);
  const myRole = _optionalChain([(_optionalChain([session, 'optionalAccess', _3 => _3.user]) ), 'optionalAccess', _4 => _4.role]);
  const isAdminOrOwner = myRole === 'admin' || myRole === 'owner';

  const load = () => fetch('/api/users').then(r => r.json()).then(setUsers);
  useEffect(() => { load(); }, []);

  const handleOpen = (u) => {
    setEdit(u || null);
    setForm(u ? { name: u.name || '', email: u.email, role: u.role, firma: u.firma || 'Notabene' } : { name: '', email: '', role: 'user', firma: 'Notabene' });
    setActive(_optionalChain([u, 'optionalAccess', _5 => _5.active]) !== false);
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
        (body ).password = password;
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
  const handleDelete = async (_id) => {
    if (!window.confirm('Benutzer wirklich löschen?')) return;
    await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id }) });
    load();
    
  };

  return (
    React.createElement(Box, { sx: { mt: 4 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
      , isAdminOrOwner && (
        React.createElement(React.Fragment, null
          , React.createElement(Typography, { variant: "h6", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}, "Benutzerverwaltung")
          , React.createElement(Button, { variant: "contained", onClick: () => handleOpen(), sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}, "Benutzer anlegen" )
        )
      )
      , React.createElement(TableContainer, { component: Paper, __self: this, __source: {fileName: _jsxFileName, lineNumber: 92}}
        , React.createElement(Table, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
          , React.createElement(TableHead, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}
            , React.createElement(TableRow, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}
              , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}, "Name"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}, "E-Mail"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}, "Firma"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}, "Rolle"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 96}}, "Status"), React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 96}})
            )
          )
          , React.createElement(TableBody, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}
            , users.map(u => (
              React.createElement(TableRow, { key: u._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}, u.name)
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}, u.email)
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}, u.firma || 'Notabene')
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}, u.role)
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}
                  , u.active === false ? (
                    React.createElement('span', { style: { color: '#d32f2f', fontWeight: 'bold' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}, "inaktiv")
                  ) : (
                    React.createElement('span', { style: { color: '#388e3c', fontWeight: 'bold' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}, "aktiv")
                  )
                  /* forcePasswordChange entfernt */
                )
                , React.createElement(TableCell, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
                  , React.createElement(IconButton, { onClick: () => handleOpen(u), disabled: u.role === 'owner' && u.email !== myEmail, __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}, React.createElement(EditIcon, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 115}} ))
                  , React.createElement(IconButton, { onClick: () => handleDelete(u._id), disabled: u.role === 'owner', __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}, React.createElement(DeleteIcon, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 116}} ))
                )
              )
            ))
          )
        )
      )
      , React.createElement(Dialog, { open: open, onClose: handleClose, __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}
        , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}, edit ? 'Benutzer bearbeiten' : 'Benutzer einladen')
        , React.createElement(DialogContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
          , React.createElement(TextField, { label: "Name", value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}} )
          , React.createElement(TextField, { label: "E-Mail", value: form.email, onChange: e => setForm(f => ({ ...f, email: e.target.value })), fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}} )
          , React.createElement(FormControlLabel, {
            control: React.createElement(Checkbox, { checked: active, onChange: e => setActive(e.target.checked), color: "primary", disabled: _optionalChain([edit, 'optionalAccess', _6 => _6.role]) === 'owner' && _optionalChain([edit, 'optionalAccess', _7 => _7.email]) !== myEmail, __self: this, __source: {fileName: _jsxFileName, lineNumber: 129}} ),
            label: active ? 'Aktiv' : 'Deaktiviert',
            sx: { mt: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}
          )
          , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}
            , React.createElement(InputLabel, { id: "role-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}, "Rolle")
            , React.createElement(Select, { labelId: "role-label", value: form.role, label: "Rolle", onChange: e => setForm(f => ({ ...f, role: e.target.value })), __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
              , React.createElement(MenuItem, { value: "user", disabled: 
                !!(
                  (edit && edit.role === 'owner') ||
                  (edit && edit.role === 'admin' && myRole !== 'owner')
                )
              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}, "User")
              , React.createElement(MenuItem, { value: "admin", disabled: 
                !!(
                  (edit && edit.role === 'owner')
                )
              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}, "Admin")
              , React.createElement(MenuItem, { value: "owner", disabled: form.email !== 'michael.wessely@notabene.at' ? true : false, __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}, "Owner")
            )
          )
          
           , (
              !edit || edit
            ) && (
              React.createElement(React.Fragment, null
                , React.createElement(TextField, {
                  label: "Passwort",
                  type: "password",
                  value: password,
                  onChange: e => setPassword(e.target.value),
                  fullWidth: true,
                  margin: "normal",
                  error: !!passwordError,
                  helperText: passwordError,
                  disabled: !!(edit && edit.email !== myEmail && myEmail !== 'michael.wessely@notabene.at'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}
                )
                , React.createElement(TextField, {
                  label: "Passwort wiederholen" ,
                  type: "password",
                  value: passwordRepeat,
                  onChange: e => setPasswordRepeat(e.target.value),
                  fullWidth: true,
                  margin: "normal",
                  error: !!passwordError && password !== passwordRepeat,
                  helperText: password !== passwordRepeat && passwordRepeat.length > 0 ? 'Passwörter stimmen nicht überein.' : '',
                  inputProps: {
                    onPaste: (e) => e.preventDefault(),
                    onCopy: (e) => e.preventDefault(),
                    autoComplete: 'new-password',
                  },
                  disabled: !!(edit && edit.email !== myEmail && myEmail !== 'michael.wessely@notabene.at'), __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
                )
              )
            )
        )
        , React.createElement(DialogActions, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}
          , React.createElement(Button, { onClick: handleClose, __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}, "Abbrechen")
          , React.createElement(Button, { onClick: handleSave, variant: "contained", __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}, "Speichern")
        )
      )
    )
  );
} 