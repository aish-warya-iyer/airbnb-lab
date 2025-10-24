import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  if (!property) return null;

  const pid = property.id ?? property._id;

  // 🔹 field fallbacks to support both mock + real backend
  const img =
    property.thumbnail_url || property.image || property.thumbnail || null;

  const title = property.title || property.name || "Property";
  const city =
    property.city || property.location_city || null;
  const country = property.country || null;

  const price =
    property.price_per_night ?? property.pricePerNight ?? property.price ?? null;

  const description = property.description || "";

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
          backgroundImage: img ? `url(${img})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#f5f5f5",
        }}
        aria-label={title}
        role="img"
      />
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: 18 }}>{title}</h3>
        <div style={{ color: "#555", fontSize: 14 }}>
          {[city, country].filter(Boolean).join(", ")}
        </div>
        <div style={{ marginTop: 6, fontWeight: 600 }}>
          {price != null ? (
            <>
              ${price} <span style={{ color: "#777", fontWeight: 400 }}>/night</span>
            </>
          ) : (
            "—"
          )}
        </div>
        {description && (
          <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
            {description.length > 110 ? `${description.slice(0, 110)}…` : description}
          </p>
        )}
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
