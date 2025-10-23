// src/components/NavBar/index.jsx
import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  marginRight: 12,
  textDecoration: "none",
  fontWeight: isActive ? 700 : 500,
});

export default function NavBar() {
  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
      <NavLink to="/" style={linkStyle}>Home</NavLink>
      <NavLink to="/favorites" style={linkStyle}>Favorites</NavLink>
      <NavLink to="/bookings" style={linkStyle}>Bookings</NavLink>
      <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
      <NavLink to="/owner/dashboard" style={linkStyle}>Owner</NavLink>
      <span style={{ float: "right" }}>
        <NavLink to="/login" style={linkStyle}>Login</NavLink>
        <NavLink to="/signup" style={linkStyle}>Sign Up</NavLink>
      </span>
    </nav>
  );
}
