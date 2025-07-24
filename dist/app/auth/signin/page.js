const _jsxFileName = "src\\app\\auth\\signin\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (_optionalChain([res, 'optionalAccess', _ => _.error])) setError('Falsche E-Mail oder Passwort!');
    else {
      // Nach Login: Userdaten holen und ggf. Redirect auf Passwort-Ändern
      const userRes = await fetch('/api/users/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (userRes.ok) {
        const user = await userRes.json();
        if (user && user.forcePasswordChange) {
          router.push('/auth/change-password');
          return;
        }
      }
      router.push('/');
    }
  };

  return (
    React.createElement(Container, { maxWidth: "xs", sx: { mt: 8 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 38}}
      , React.createElement(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 39}}
        /* Logo entfernt: Hier wird KEIN <Image> oder Bild mehr angezeigt */
        , React.createElement(Typography, { variant: "h4", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 41}}, "Notabene Service-Portal" )
        , React.createElement(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}}, "Bitte logge dich mit deiner E-Mail und deinem Passwort ein."

        )
        , React.createElement(Box, { component: "form", onSubmit: handleSubmit, sx: { mt: 2, width: '100%' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}}
          , React.createElement(TextField, {
            label: "E-Mail oder Benutzername"  ,
            type: "text",
            value: email,
            onChange: e => setEmail(e.target.value),
            fullWidth: true,
            required: true,
            margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 46}}
          )
          , React.createElement(TextField, {
            label: "Passwort",
            type: "password",
            value: password,
            onChange: e => setPassword(e.target.value),
            fullWidth: true,
            required: true,
            margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
          )
          , error && React.createElement(Alert, { severity: "error", sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}, error)
          , React.createElement(Button, { type: "submit", variant: "contained", color: "primary", fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}, "Login"

          )
        )
      )
    )
  );
} 