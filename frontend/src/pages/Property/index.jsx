import { useParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { propertiesApi } from "../../api/properties";

export default function Property() {
  const { id } = useParams();
  const { data: p, loading, error } = useFetch(() => propertiesApi.getPropertyById(id), [id]);

  if (loading) return <div>Loading property…</div>;
  if (error)   return <div style={{ color: "crimson" }}>Failed to load: {error.message}</div>;
  if (!p)      return <div>Property not found. <Link to="/">Back</Link></div>;

  const {
    title, name, city, country, description,
    price_per_night, price, pricePerNight,
    image, thumbnail, thumbnail_url
  } = p;

  return (
    <div>
      <Link to="/" style={{ textDecoration: "none" }}>← Back to results</Link>
      <h2 style={{ marginTop: 8 }}>{title || name || "Property"}</h2>
      <div style={{ color: "#666" }}>{[city, country].filter(Boolean).join(", ")}</div>

      <div
        style={{
          width: "100%", height: 300, marginTop: 12, borderRadius: 12, background: "#f5f5f5",
          backgroundImage: (image || thumbnail || thumbnail_url) ? `url(${image || thumbnail || thumbnail_url})` : "none",
          backgroundSize: "cover", backgroundPosition: "center"
        }}
      />

      <p style={{ marginTop: 16 }}>{description || "No description provided."}</p>
      <div style={{ fontSize: 18, fontWeight: 700 }}>
        {(price_per_night ?? pricePerNight ?? price)
          ? <>${price_per_night ?? pricePerNight ?? price}<span style={{ color: "#666", fontWeight: 500 }}>/night</span></>
          : "—"}
      </div>
    </div>
  );
}
