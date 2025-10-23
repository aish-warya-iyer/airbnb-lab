import NavBar from "../components/NavBar";
export default function AppLayout({ children }) {
  return (
    <div>
      <NavBar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>{children}</main>
    </div>
  );
}
