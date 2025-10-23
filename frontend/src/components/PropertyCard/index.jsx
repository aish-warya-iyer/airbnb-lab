import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  const { id, _id, title, city, pricePerNight, thumbnail, description } = property || {};
  const pid = id || _id;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 16,
        overflow: "hidden",
        width: 280,
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          height: 180,
          backgroundImage: `url(${thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: 18 }}>{title}</h3>
        <div style={{ color: "#555", fontSize: 14 }}>{city}</div>
        <div style={{ marginTop: 6, fontWeight: 600 }}>
          ${pricePerNight} <span style={{ color: "#777", fontWeight: 400 }}>/night</span>
        </div>
        <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>{description}</p>
        <Link
          to={`/property/${pid}`}
          style={{
            display: "inline-block",
            marginTop: 6,
            textDecoration: "none",
            color: "#0077cc",
            fontWeight: 600,
          }}
        >
          View →
        </Link>
      </div>
    </div>
  );
}
