const _jsxFileName = "src\\app\\page.tsx";
function _optionalChain(ops) {
  let lastAccessLHS = undefined;
  let value = ops[0];
  let i = 1;
  while (i < ops.length) {
    const op = ops[i];
    const fn = ops[i + 1];
    i += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
      return undefined;
    }
    if (op === "access" || op === "optionalAccess") {
      lastAccessLHS = value;
      value = fn(value);
    } else if (op === "call" || op === "optionalCall") {
      value = fn((...args) => value.call(lastAccessLHS, ...args));
      lastAccessLHS = undefined;
    }
  }
  return value;
}
("use client");
import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Button,
} from "@mui/material";
import KanbanBoard from "../components/KanbanBoard";
import TicketForm from "../components/TicketForm";
import AdminCustomersPanel from "../components/AdminCustomersPanel";
import AdminTopicsPanel from "../components/AdminTopicsPanel";
import AdminUsersPanel from "../components/AdminUsersPanel";
import NotificationBadge from "../components/NotificationBadge";
import Image from "next/image";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { IconButton, Menu, MenuItem, ListItemText } from "@mui/material";
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

const theme = createTheme({
  palette: {
    primary: { main: "#6995c9" },
    secondary: { main: "#1976d2" },
    background: { default: "#eaf6fb" },
  },
});

const TABS = [
  { label: "Kanban", value: "kanban" },
  { label: "Ticket anlegen", value: "ticket" },
  { label: "Kunden", value: "kunden" },
  { label: "Themen", value: "themen" },
  { label: "Benutzer", value: "benutzer" },
];

function HomePageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const user = _optionalChain([session, "optionalAccess", (_2) => _2.user]);
  const userId = _optionalChain([user, "optionalAccess", (_3) => _3.id]) || "";
  const isAdmin =
    _optionalChain([user, "optionalAccess", (_4) => _4.role]) === "admin";
  const isAdminOrOwner =
    _optionalChain([user, "optionalAccess", (_5) => _5.role]) === "admin" ||
    _optionalChain([user, "optionalAccess", (_6) => _6.role]) === "owner";
  const userName =
    _optionalChain([user, "optionalAccess", (_7) => _7.name]) ||
    _optionalChain([user, "optionalAccess", (_8) => _8.email]) ||
    "";
  const [tab, setTab] = useState("kanban");
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    window.location.reload();
  };

  if (loading) return null;
  if (!session)
    return React.createElement(
      Box,
      {
        sx: {
          minHeight: "100vh",
          bgcolor: "#eaf6fb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
        __self: this,
        __source: { fileName: _jsxFileName, lineNumber: 53 },
      },
      React.createElement(
        Box,
        {
          sx: {
            mb: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          },
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 54 },
        },
        React.createElement(Image, {
          src: "/notabene.png",
          alt: "Notabene Logo",
          height: 120,
          width: 120,
          style: { marginBottom: 16 },
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 55 },
        }),
        React.createElement(
          Typography,
          {
            variant: "h4",
            sx: { fontWeight: "bold", color: "#6995c9", mb: 2 },
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 56 },
          },
          "Notabene Ticketingsystem"
        ),
        React.createElement(
          Typography,
          {
            variant: "body1",
            color: "text.secondary",
            sx: { mb: 3 },
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 57 },
          },
          "Bitte logge dich mit deinem Benutzernamen oder deiner E-Mail-Adresse und Passwort ein."
        ),
        React.createElement(
          Button,
          {
            onClick: () => signIn(),
            variant: "contained",
            color: "primary",
            size: "large",
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 58 },
          },
          "Login"
        )
      )
    );

  return React.createElement(
    ThemeProvider,
    {
      theme: theme,
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 64 },
    },
    React.createElement(CssBaseline, {
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 65 },
    }),
    React.createElement(
      AppBar,
      {
        position: "static",
        color: "primary",
        sx: { mb: 4 },
        __self: this,
        __source: { fileName: _jsxFileName, lineNumber: 66 },
      },
      React.createElement(
        Toolbar,
        { __self: this, __source: { fileName: _jsxFileName, lineNumber: 67 } },
        React.createElement(
          Box,
          {
            sx: { flexGrow: 1, display: "flex", alignItems: "center", mt: 3.5 },
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 68 },
          },
          React.createElement(
            Box,
            {
              sx: { cursor: "pointer" },
              onClick: () => setTab("kanban"),
              __self: this,
              __source: { fileName: _jsxFileName, lineNumber: 69 },
            },
            React.createElement(Image, {
              src: "/notabene.png",
              alt: "Notabene Logo",
              height: 101,
              width: 101,
              style: { marginRight: 24 },
              __self: this,
              __source: { fileName: _jsxFileName, lineNumber: 70 },
            })
          )
        ),
        React.createElement(NotificationBadge, {
          userId: userId,
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 73 },
        }),
        React.createElement(
          IconButton,
          {
            color: "inherit",
            onClick: handleMenu,
            sx: { ml: 2 },
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 74 },
          },
          React.createElement(AccountCircle, {
            fontSize: "large",
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 75 },
          })
        ),
        React.createElement(
          Menu,
          {
            anchorEl: anchorEl,
            open: Boolean(anchorEl),
            onClose: handleClose,
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
            transformOrigin: { vertical: "top", horizontal: "right" },
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 77 },
          },
          React.createElement(
            MenuItem,
            {
              disabled: true,
              __self: this,
              __source: { fileName: _jsxFileName, lineNumber: 78 },
            },
            React.createElement(ListItemText, {
              primary: userName,
              __self: this,
              __source: { fileName: _jsxFileName, lineNumber: 79 },
            })
          ),
          React.createElement(
            MenuItem,
            {
              onClick: () => {
                handleClose();
                window.location.href = "/user/profile";
              },
              __self: this,
              __source: { fileName: _jsxFileName, lineNumber: 81 },
            },
            "Profil"
          ),
          React.createElement(
            MenuItem,
            {
              onClick: handleLogout,
              __self: this,
              __source: { fileName: _jsxFileName, lineNumber: 82 },
            },
            "Logout"
          )
        )
      ),
      React.createElement(
        Tabs,
        {
          value: tab,
          onChange: (_, v) => setTab(v),
          centered: true,
          textColor: "inherit",
          indicatorColor: "secondary",
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 85 },
        },
        React.createElement(Tab, {
          key: "kanban",
          label: "Kanban",
          value: "kanban",
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 86 },
        }),
        React.createElement(Tab, {
          key: "ticket",
          label: "Ticket anlegen",
          value: "ticket",
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 87 },
        }),
        isAdminOrOwner &&
          React.createElement(Tab, {
            key: "kunden",
            label: "Kunden",
            value: "kunden",
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 88 },
          }),
        isAdminOrOwner &&
          React.createElement(Tab, {
            key: "themen",
            label: "Themen",
            value: "themen",
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 89 },
          }),
        isAdminOrOwner &&
          React.createElement(Tab, {
            key: "benutzer",
            label: "Benutzer",
            value: "benutzer",
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 90 },
          })
      )
    ),
    React.createElement(
      Container,
      {
        maxWidth: "lg",
        sx: { bgcolor: "#f4faff", borderRadius: 3, p: 3, minHeight: 600 },
        __self: this,
        __source: { fileName: _jsxFileName, lineNumber: 93 },
      },
      tab === "kanban" &&
        React.createElement(KanbanBoard, {
          userId: userId,
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 94 },
        }),
      tab === "ticket" &&
        React.createElement(TicketForm, {
          userId: userId,
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 95 },
        }),
      tab === "kunden" &&
        isAdminOrOwner &&
        React.createElement(AdminCustomersPanel, {
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 96 },
        }),
      tab === "themen" &&
        isAdminOrOwner &&
        React.createElement(AdminTopicsPanel, {
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 97 },
        }),
      tab === "benutzer" &&
        isAdminOrOwner &&
        React.createElement(AdminUsersPanel, {
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 98 },
        }),
      tab !== "kanban" &&
        tab !== "ticket" &&
        !isAdminOrOwner &&
        React.createElement(
          Typography,
          {
            color: "text.secondary",
            align: "center",
            sx: { mt: 8 },
            __self: this,
            __source: { fileName: _jsxFileName, lineNumber: 100 },
          },
          "Kein Zugriff"
        )
    )
  );
}

export default function HomePage() {
  return React.createElement(
    SessionProvider,
    { __self: this, __source: { fileName: _jsxFileName, lineNumber: 109 } },
    React.createElement(HomePageContent, {
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 110 },
    })
  );
}
