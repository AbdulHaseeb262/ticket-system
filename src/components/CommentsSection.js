const _jsxFileName = "src\\components\\CommentsSection.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }'use client';

import { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, IconButton } from '@mui/material';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSession } from 'next-auth/react';












export default function CommentsSection({ ticketId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [autocompleteStart, setAutocompleteStart] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const textFieldRef = useRef(null);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { data: session } = useSession();
  const userName = _optionalChain([session, 'optionalAccess', _ => _.user, 'optionalAccess', _2 => _2.name]) || _optionalChain([session, 'optionalAccess', _3 => _3.user, 'optionalAccess', _4 => _4.email]) || '';
  const isAdmin = _optionalChain([(_optionalChain([session, 'optionalAccess', _5 => _5.user]) ), 'optionalAccess', _6 => _6.role]) === 'admin';

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(data => setUsers(data.map((u) => ({ name: u.name }))));
  }, []);

  const load = () => {
    setLoading(true);
    fetch(`/api/comments?ticketId=${ticketId}`)
      .then(r => r.json())
      .then(setComments)
      .catch(() => setError('Fehler beim Laden der Kommentare.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [ticketId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, author: userName, text })
    });
    if (res.ok) {
      setText('');
      load();
    } else {
      setError('Fehler beim Speichern.');
    }
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: commentId })
    });
    load();
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    const atIdx = val.lastIndexOf('@');
    if (atIdx !== -1 && (atIdx === 0 || val[atIdx - 1] === ' ')) {
      const query = val.slice(atIdx + 1).toLowerCase();
      setAutocompleteStart(atIdx);
      setAutocompleteValue(query);
      setAutocompleteOptions(
        users.filter(u =>
          u.name.toLowerCase().split(' ').some(part => part.startsWith(query))
        )
      );
      setDropdownOpen(query.length > 0);
    } else {
      setDropdownOpen(false);
      setAutocompleteStart(null);
    }
  };

  const handleUserSelect = (user) => {
    if (autocompleteStart !== null) {
      const before = text.slice(0, autocompleteStart);
      const after = text.slice(autocompleteStart);
      const match = after.match(/^@\w*/);
      const afterMention = match ? after.slice(match[0].length) : '';
      setText(before + '@' + user.name + afterMention + ' ');
      setDropdownOpen(false);
      setAutocompleteStart(null);
      setAutocompleteValue('');
      setAutocompleteOptions([]);
      // Fokus zurück ins Textfeld
      setTimeout(() => _optionalChain([textFieldRef, 'access', _7 => _7.current, 'optionalAccess', _8 => _8.focus, 'call', _9 => _9()]), 0);
    }
  };

  return (
    React.createElement(Box, { sx: { mt: 4 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
      , React.createElement(Typography, { variant: "h6", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}, "Kommentare")
      , loading && React.createElement(CircularProgress, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 127}} )
      , error && React.createElement(Alert, { severity: "error", __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}, error)
      , React.createElement(Box, { sx: { mb: 2, maxHeight: 300, overflowY: 'auto' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 129}}
        , comments.map(c => (
          React.createElement(Paper, { key: c._id, sx: { p: 2, mb: 1, position: 'relative' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}
            , React.createElement(Typography, { fontWeight: "bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}, c.author)
            , React.createElement(Typography, { variant: "body2", color: "text.secondary", __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}, new Date(c.createdAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }))
            , editId === c._id ? (
              React.createElement(Box, { sx: { mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
                , React.createElement(TextField, {
                  value: editText,
                  onChange: e => setEditText(e.target.value),
                  fullWidth: true,
                  multiline: true,
                  minRows: 2,
                  size: "small", __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
                )
                , React.createElement(Box, { sx: { display: 'flex', gap: 1, mt: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}
                  , React.createElement(Button, { variant: "contained", size: "small", onClick: async () => {
                    await fetch('/api/comments', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ _id: c._id, text: editText })
                    });
                    setEditId(null);
                    load();
                  }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, "Speichern")
                  , React.createElement(Button, { variant: "outlined", size: "small", onClick: () => setEditId(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}, "Abbrechen")
                )
              )
            ) : (
              React.createElement(Typography, { sx: { mt: 1, wordBreak: 'break-word', maxWidth: '100%' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}, c.text)
            )
            , React.createElement(Box, { sx: { display: 'flex', gap: 1, mt: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
              , c.author !== userName && replyOpen !== c._id && (
                React.createElement(Button, { size: "small", variant: "outlined", onClick: () => { setReplyOpen(c._id); setReplyText(`@${c.author} `); }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}, "Antworten")
              )
              , replyOpen === c._id && (
                React.createElement(Box, { sx: { mt: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
                  , React.createElement(TextField, {
                    value: replyText,
                    onChange: e => setReplyText(e.target.value),
                    fullWidth: true,
                    multiline: true,
                    minRows: 2,
                    size: "small", __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
                  )
                  , React.createElement(Box, { sx: { display: 'flex', gap: 1, mt: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
                    , React.createElement(Button, { variant: "contained", size: "small", onClick: async () => {
                      await fetch('/api/comments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ticketId, author: userName, text: replyText })
                      });
                      setReplyOpen(null);
                      setReplyText('');
                      load();
                    }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}, "Absenden")
                    , React.createElement(Button, { variant: "outlined", size: "small", onClick: () => setReplyOpen(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}, "Abbrechen")
                  )
                )
              )
              , (isAdmin || c.author === userName) && editId !== c._id && (
                React.createElement(React.Fragment, null
                  , React.createElement(IconButton, { size: "small", sx: { position: 'absolute', top: 4, right: 36 }, onClick: () => { setEditId(c._id); setEditText(c.text); }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}
                    , React.createElement(EditIcon, { fontSize: "small", __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}} )
                  )
                  , React.createElement(IconButton, { size: "small", sx: { position: 'absolute', top: 4, right: 4 }, onClick: () => handleDelete(c._id), __self: this, __source: {fileName: _jsxFileName, lineNumber: 194}}
                    , React.createElement(DeleteIcon, { fontSize: "small", __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}} )
                  )
                )
              )
            )
          )
        ))
      )
      , React.createElement(Box, { component: "form", onSubmit: handleSubmit, sx: { display: 'flex', gap: 2, position: 'relative' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 203}}
        , React.createElement(TextField, {
          label: "Kommentar hinzufügen (@Name für Tagging)"    ,
          value: text,
          onChange: handleTextChange,
          fullWidth: true,
          required: true,
          inputRef: textFieldRef, __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}}
        )
        , dropdownOpen && autocompleteOptions.length > 0 && (
          React.createElement(Paper, { sx: { position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 20, maxHeight: 200, overflowY: 'auto' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}
            , React.createElement(List, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 214}}
              , autocompleteOptions.map(u => (
                React.createElement(ListItem, { key: u.name, disablePadding: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}
                  , React.createElement(ListItemButton, { onClick: () => handleUserSelect(u), __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}}
                    , React.createElement(ListItemText, { primary: u.name, __self: this, __source: {fileName: _jsxFileName, lineNumber: 218}} )
                  )
                )
              ))
            )
          )
        )
        , React.createElement(Button, { type: "submit", variant: "contained", disabled: loading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}, "Posten")
      )
    )
  );
} 