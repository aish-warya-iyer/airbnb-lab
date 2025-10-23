// src/pages/Dashboard/index.jsx
import useFetch from "../../hooks/useFetch";
import { getMockProperties } from "../../api/properties";
import PropertyCard from "../../components/PropertyCard";

export default function Dashboard() {
  const { data, loading, error } = useFetch(getMockProperties, []);

  if (loading) return <div>Loading properties…</div>;
  if (error) return <div style={{ color: "crimson" }}>Failed to load: {error.message}</div>;
  if (!data || data.length === 0) return <div>No properties found.</div>;

  return (
    <div>
      <h2>Explore stays</h2>
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {data.map((p) => (
          <PropertyCard key={p.id || p._id} property={p} />
        ))}
      </div>
    </div>
  );
}
