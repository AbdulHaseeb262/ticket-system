const _jsxFileName = "src\\app\\user\\profile\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";
import { useState } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { Box, Button, TextField, Typography, Alert, Paper } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

function UserProfilePageInner() {
  const { data: session } = useSession();
  const user = _optionalChain([session, 'optionalAccess', _ => _.user]) ;
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (pw1.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/users/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: _optionalChain([user, 'optionalAccess', _2 => _2.id]), password: pw1 })
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Passwort erfolgreich geändert.");
      setPw1(""); setPw2("");
    } else {
      setError("Fehler beim Ändern des Passworts.");
    }
  };

  return (
    React.createElement(Box, { sx: { minHeight: '100vh', width: '100vw', bgcolor: '#f7fafd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 10 } }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}}
      , React.createElement(Box, { sx: { width: '100%', maxWidth: 440, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 46}}
        , React.createElement(IconButton, { onClick: () => window.location.href = '/', size: "large", sx: { mr: 2, bgcolor: '#e3eafc', borderRadius: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
          , React.createElement(ArrowBackIcon, { fontSize: "medium", __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}} )
        )
        , React.createElement(Typography, { variant: "h4", fontWeight: "bold", sx: { letterSpacing: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}, "Profil")
      )
      , React.createElement(Paper, { elevation: 4, sx: { p: { xs: 3, md: 4 }, mb: 4, width: '100%', maxWidth: 440, borderRadius: 4, boxShadow: 6, bgcolor: '#fff' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
        , React.createElement(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold', mb: 2, color: '#1976d2' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}, "Mein Profil" )
        , React.createElement(Box, { sx: { mb: 1.5, fontSize: 18 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}, React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}, "Name:"), " " , React.createElement('span', { style: { color: '#333' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}, _optionalChain([user, 'optionalAccess', _3 => _3.name])))
        , React.createElement(Box, { sx: { mb: 1.5, fontSize: 18 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}, React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}, "E-Mail:"), " " , React.createElement('span', { style: { color: '#333' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}, _optionalChain([user, 'optionalAccess', _4 => _4.email])))
        , React.createElement(Box, { sx: { mb: 1.5, fontSize: 18 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}, React.createElement('b', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}, "Rolle:"), " " , React.createElement('span', { style: { color: '#333' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}, _optionalChain([user, 'optionalAccess', _5 => _5.role])))
      )
      , React.createElement(Paper, { elevation: 4, sx: { p: { xs: 3, md: 4 }, width: '100%', maxWidth: 440, borderRadius: 4, boxShadow: 6, bgcolor: '#fff' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}
        , React.createElement(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold', mb: 2, color: '#1976d2' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}, "Passwort ändern" )
        , React.createElement(Box, { component: "form", onSubmit: handleSubmit, sx: { mt: 2, width: "100%" }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}
          , React.createElement(TextField, {
            label: "Neues Passwort" ,
            type: "password",
            value: pw1,
            onChange: e => setPw1(e.target.value),
            fullWidth: true,
            required: true,
            margin: "normal",
            sx: { mb: 2, bgcolor: '#f5f8fa', borderRadius: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 61}}
          )
          , React.createElement(TextField, {
            label: "Passwort wiederholen" ,
            type: "password",
            value: pw2,
            onChange: e => setPw2(e.target.value),
            fullWidth: true,
            required: true,
            margin: "normal",
            sx: { mb: 2, bgcolor: '#f5f8fa', borderRadius: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}
          )
          , error && React.createElement(Alert, { severity: "error", sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}, error)
          , success && React.createElement(Alert, { severity: "success", sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}, success)
          , React.createElement(Button, { type: "submit", variant: "contained", color: "primary", fullWidth: true, size: "large", sx: { mt: 1, fontWeight: 'bold', fontSize: 18, borderRadius: 2, boxShadow: 2 }, disabled: loading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Passwort ändern"

          )
        )
      )
    )
  );
}

export default function UserProfilePage() {
  return (
    React.createElement(SessionProvider, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}
      , React.createElement(UserProfilePageInner, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 95}} )
    )
  );
} 