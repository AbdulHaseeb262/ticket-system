'use client';
import { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Paper, MenuItem } from '@mui/material';

export interface Customer {
  _id: string;
  name: string;
  ort: string;
  telefon: string;
  email: string;
}

interface Props {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  label?: string;
  softwareValue?: string;
  onSoftwareChange?: (software: string) => void;
}

export default function CustomerDropdown({ value, onChange, label = 'Kunde wählen', softwareValue = 'Notabene 5', onSoftwareChange }: Props) {
  const [options, setOptions] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setOptions(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Software-Auswahl vor Kundenauswahl */}
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          label="Software"
          value={softwareValue}
          onChange={e => onSoftwareChange && onSoftwareChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="Notabene 5">Notabene 5</MenuItem>
          <MenuItem value="Notabene 7">Notabene 7</MenuItem>
        </TextField>
      </Box>
      <Autocomplete
        options={options}
        getOptionLabel={o => o.name}
        groupBy={o => o.name[0].toUpperCase()}
        value={value}
        onChange={(_, v) => onChange(v)}
        loading={loading}
        isOptionEqualToValue={(a, b) => a._id === b._id}
        filterOptions={(opts, { inputValue }) =>
          opts.filter(o => o.name.toLowerCase().startsWith(inputValue.toLowerCase()))
        }
        renderInput={params => (
          <TextField {...params} label={label} fullWidth InputProps={{ ...params.InputProps, endAdornment: loading ? <CircularProgress size={20} /> : params.InputProps.endAdornment }} />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option._id}>
            <Typography fontWeight="bold">{option.name}</Typography>
          </Box>
        )}
        ListboxProps={{
          style: {
            maxHeight: 300,
            overflowY: 'auto',
          },
        }}
      />
      {value && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, mb: 2 }}>
          <Paper sx={{ p: 0.3, bgcolor: '#fff9c4', fontSize: 14, lineHeight: 1.2 }} elevation={0}>
            <span style={{ fontWeight: 'bold' }}>Ort:</span> {value.ort}
          </Paper>
          <Paper sx={{ p: 0.3, bgcolor: '#fff9c4', fontSize: 14, lineHeight: 1.2 }} elevation={0}>
            <span style={{ fontWeight: 'bold' }}>E-Mail:</span> {value.email || '-'}
          </Paper>
          <Paper sx={{ p: 0.3, bgcolor: '#fff9c4', fontSize: 14, lineHeight: 1.2 }} elevation={0}>
            <span style={{ fontWeight: 'bold' }}>Tel:</span> {value.telefon}
          </Paper>
        </Box>
      )}
    </>
  );
} 