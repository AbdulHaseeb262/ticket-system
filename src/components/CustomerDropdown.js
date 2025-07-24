const _jsxFileName = "src\\components\\CustomerDropdown.tsx";'use client';
import { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Paper, MenuItem } from '@mui/material';

















export default function CustomerDropdown({ value, onChange, label = 'Kunde wählen', softwareValue = 'Notabene 5', onSoftwareChange }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setOptions(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    React.createElement(React.Fragment, null
      /* Software-Auswahl vor Kundenauswahl */
      , React.createElement(Box, { sx: { mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 36}}
        , React.createElement(TextField, {
          select: true,
          label: "Software",
          value: softwareValue,
          onChange: e => onSoftwareChange && onSoftwareChange(e.target.value),
          fullWidth: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}}

          , React.createElement(MenuItem, { value: "Notabene 5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}, "Notabene 5" )
          , React.createElement(MenuItem, { value: "Notabene 7" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}}, "Notabene 7" )
        )
      )
      , React.createElement(Autocomplete, {
        options: options,
        getOptionLabel: o => o.name,
        groupBy: o => o.name[0].toUpperCase(),
        value: value,
        onChange: (_, v) => onChange(v),
        loading: loading,
        isOptionEqualToValue: (a, b) => a._id === b._id,
        filterOptions: (opts, { inputValue }) =>
          opts.filter(o => o.name.toLowerCase().startsWith(inputValue.toLowerCase()))
        ,
        renderInput: params => (
          React.createElement(TextField, { ...params, label: label, fullWidth: true, InputProps: { ...params.InputProps, endAdornment: loading ? React.createElement(CircularProgress, { size: 20, __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}} ) : params.InputProps.endAdornment }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}} )
        ),
        renderOption: (props, option) => (
          React.createElement(Box, { component: "li", ...props, key: option._id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
            , React.createElement(Typography, { fontWeight: "bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}, option.name)
          )
        ),
        ListboxProps: {
          style: {
            maxHeight: 300,
            overflowY: 'auto',
          },
        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
      )
      , value && (
        React.createElement(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, mb: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}
          , React.createElement(Paper, { sx: { p: 0.3, bgcolor: '#fff9c4', fontSize: 14, lineHeight: 1.2 }, elevation: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
            , React.createElement('span', { style: { fontWeight: 'bold' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}, "Ort:"), " " , value.ort
          )
          , React.createElement(Paper, { sx: { p: 0.3, bgcolor: '#fff9c4', fontSize: 14, lineHeight: 1.2 }, elevation: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}
            , React.createElement('span', { style: { fontWeight: 'bold' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}, "E-Mail:"), " " , value.email || '-'
          )
          , React.createElement(Paper, { sx: { p: 0.3, bgcolor: '#fff9c4', fontSize: 14, lineHeight: 1.2 }, elevation: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}
            , React.createElement('span', { style: { fontWeight: 'bold' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Tel:"), " " , value.telefon
          )
        )
      )
    )
  );
} 