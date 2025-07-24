const _jsxFileName = "src\\components\\TicketForm.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }'use client';
import { useEffect, useState } from 'react';
import { Box, Button, Container, TextField, Typography, MenuItem, Select, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';
import CustomerDropdown, { } from './CustomerDropdown';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';








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

export default function TicketForm({ userId }) {
  const [customer, setCustomer] = useState(null);
  const [software, setSoftware] = useState('Notabene 5');
  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('offen');
  const [assignee, setAssignee] = useState(userId);
  const [users, setUsers] = useState([]);
  const [prio, setPrio] = useState('mittel');
  const [due, setDue] = useState(() => new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updateType, setUpdateType] = useState('durch_uns');
  const [updateAppointment, setUpdateAppointment] = useState(null);

  useEffect(() => {
    fetch('/api/topics').then(r => r.json()).then(setTopics);
    fetch('/api/users').then(r => r.json()).then(setUsers);
  }, []);

  const handleFile = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(''); setError('');
    const body = {
      customerId: _optionalChain([customer, 'optionalAccess', _2 => _2._id]),
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
    React.createElement(Container, { maxWidth: "sm", sx: { mt: 4 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
      , React.createElement(Typography, { variant: "h5", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}, "Neues Ticket" )
      , React.createElement(Box, { component: "form", onSubmit: handleSubmit, sx: { mt: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}
        , React.createElement(CustomerDropdown, {
          value: customer,
          onChange: setCustomer,
          softwareValue: software,
          onSoftwareChange: setSoftware, __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}
        )
        /* Themen-Auswahl: Autocomplete statt Select */
        , React.createElement(Autocomplete, {
          options: topics,
          getOptionLabel: o => o.name,
          value: topics.find(t => t._id === topic) || null,
          onChange: (_, v) => setTopic(v ? v._id : ''),
          isOptionEqualToValue: (a, b) => a._id === b._id,
          filterOptions: (opts, { inputValue }) =>
            opts.filter(o => o.name.toLowerCase().includes(inputValue.toLowerCase()))
          ,
          renderInput: params => (
            React.createElement(TextField, { ...params, label: "Thema", fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}} )
          ),
          ListboxProps: {
            style: {
              maxHeight: 120, // ca. 3 Zeilen
              overflowY: 'auto',
            },
          }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
        )
        , React.createElement(TextField, { label: "Beschreibung", value: desc, onChange: e => setDesc(e.target.value), fullWidth: true, margin: "normal", multiline: true, minRows: 3, required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
        , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}}
          , React.createElement(InputLabel, { id: "status-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}, "Status")
          , React.createElement(Select, { labelId: "status-label", value: status, label: "Status", onChange: e => setStatus(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}
            , statusOptions.map(s => React.createElement(MenuItem, { key: s.value, value: s.value, __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}, s.label))
          )
        )
        , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
          , React.createElement(InputLabel, { id: "assignee-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}, "Zuweisen an" )
          , React.createElement(Select, { labelId: "assignee-label", value: assignee, label: "Zuweisen an" , onChange: e => setAssignee(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
            , users.map(u => React.createElement(MenuItem, { key: u._id, value: u._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}, u.name, " (" , u.email, ")"))
          )
        )
        , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}
          , React.createElement(InputLabel, { id: "prio-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}, "Priorität")
          , React.createElement(Select, { labelId: "prio-label", value: prio, label: "Priorität", onChange: e => setPrio(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
            , prioOptions.map(p => React.createElement(MenuItem, { key: p.value, value: p.value, __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}, p.label))
          )
        )
        /* Fälligkeitsdatum mit deutschem Kalender */
        , React.createElement(LocalizationProvider, { dateAdapter: AdapterDateFns, adapterLocale: de, __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}
          , React.createElement(DatePicker, {
            label: "Fälligkeitsdatum",
            value: due ? new Date(due) : null,
            onChange: val => setDue(val ? val.toISOString().slice(0, 10) : ''),
            slotProps: { textField: { fullWidth: true, margin: 'normal', InputLabelProps: { shrink: true } } },
            format: "dd.MM.yyyy", __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}
          )
        )
        , (() => {
          const topicName = _optionalChain([topics, 'access', _3 => _3.find, 'call', _4 => _4(t => t._id === topic), 'optionalAccess', _5 => _5.name, 'optionalAccess', _6 => _6.toLowerCase, 'call', _7 => _7()]);
          if (topicName === 'updates') {
            return React.createElement(React.Fragment, null
              , React.createElement(FormControl, { fullWidth: true, margin: "normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 150}}
                , React.createElement(InputLabel, { id: "update-type-label", __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}, "Update-Art")
                , React.createElement(Select, {
                  labelId: "update-type-label",
                  value: updateType,
                  label: "Update-Art",
                  onChange: e => setUpdateType(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}

                  , React.createElement(MenuItem, { value: "durch_uns", __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}, "Update installiert durch uns"   )
                  , React.createElement(MenuItem, { value: "selbst", __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}, "Selbstinstallation")
                )
              )
              , React.createElement(LocalizationProvider, { dateAdapter: AdapterDateFns, adapterLocale: de, __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
                , React.createElement(DatePicker, {
                  label: "Termin vereinbart" ,
                  value: updateAppointment,
                  onChange: val => setUpdateAppointment(val),
                  slotProps: { textField: { fullWidth: true, margin: 'normal', InputLabelProps: { shrink: true } } },
                  format: "dd.MM.yyyy", __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}}
                )
              )
            );
          }
          return null;
        })()
        /* Anzeige des deutschen Datumsformats entfernt */
        , React.createElement(Button, { variant: "outlined", component: "label", fullWidth: true, sx: { mt: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "E-Mail/Anhang importieren"

          , React.createElement('input', { type: "file", hidden: true, onChange: handleFile, __self: this, __source: {fileName: _jsxFileName, lineNumber: 178}} )
        )
        , file && React.createElement(Typography, { variant: "body2", sx: { mt: 1 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}, "Datei: " , file.name)
        , success && React.createElement(Alert, { severity: "success", sx: { mt: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}, success)
        , error && React.createElement(Alert, { severity: "error", sx: { mt: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}, error)
        , React.createElement(Button, { type: "submit", variant: "contained", color: "primary", fullWidth: true, sx: { mt: 3 }, disabled: loading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
          , loading ? React.createElement(CircularProgress, { size: 24, __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}} ) : 'Ticket speichern'
        )
      )
    )
  );
} 