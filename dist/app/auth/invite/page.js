const _jsxFileName = "src\\app\\auth\\invite\\page.tsx";"use client";
import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');
    // API-Call zum Anlegen des Users und Versand der Invite-Mail
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, status: 'pending' })
    });
    if (res.ok) {
      setSuccess('Einladung verschickt!');
      setEmail('');
      setRole('user');
    } else {
      setError('Fehler beim Einladen.');
    }
  };

  return (
    React.createElement(Container, { maxWidth: "xs", sx: { mt: 8 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 30}}
      , React.createElement(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 31}}
        , React.createElement(Typography, { variant: "h5", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 32}}, "Benutzer einladen" )
        , React.createElement(Box, { component: "form", onSubmit: handleInvite, sx: { mt: 2, width: '100%' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 33}}
          , React.createElement(TextField, {
            label: "E-Mail",
            type: "email",
            value: email,
            onChange: e => setEmail(e.target.value),
            fullWidth: true,
            required: true,
            margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 34}}
          )
          , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 43}}
            , React.createElement(InputLabel, { id: "role-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}, "Rolle")
            , React.createElement(Select, {
              labelId: "role-label",
              value: role,
              label: "Rolle",
              onChange: e => setRole(e.target.value ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}}

              , React.createElement(MenuItem, { value: "user", __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}, "User")
              , React.createElement(MenuItem, { value: "admin", __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}, "Admin")
            )
          )
          , success && React.createElement(Alert, { severity: "success", sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}, success)
          , error && React.createElement(Alert, { severity: "error", sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}, error)
          , React.createElement(Button, { type: "submit", variant: "contained", color: "primary", fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, "Einladung senden"

          )
        )
      )
    )
  );
}