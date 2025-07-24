const _jsxFileName = "src\\app\\auth\\error\\page.tsx";import { Container, Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    React.createElement(Container, { maxWidth: "xs", sx: { mt: 8 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 6}}
      , React.createElement(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 7}}
        , React.createElement(Typography, { variant: "h5", color: "error", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 8}}, "Fehler beim Login"  )
        , React.createElement(Typography, { variant: "body1", color: "text.secondary", gutterBottom: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 9}}, "Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere den Support."

        )
        , React.createElement(Button, { component: Link, href: "/auth/signin", variant: "contained", sx: { mt: 2 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 12}}, "Zurück zum Login"

        )
      )
    )
  );
} 