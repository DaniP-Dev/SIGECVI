"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../page.module.css";

export default function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    visitorName: "", 
    email: "", 
    visitDate: "", 
    entryTime: "",
    departmentVisited: "", 
    purpose: "" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("register");
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const nameParam = searchParams.get("name");
    const emailParam = searchParams.get("email");
    setName(nameParam || "Usuario");
    setEmail(emailParam || "");
    fetchVisits();
  }, [searchParams]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/visits");
      if (!res.ok) throw new Error("Error al cargar visitas");
      const data = await res.json();
      setVisits(data.visits || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las visitas");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitVisit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.visitorName || !formData.email || !formData.departmentVisited) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    // Obtener fecha y hora actual
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const currentDate = `${year}-${month}-${day}`;
    const currentTime = `${hours}:${minutes}`;

    try {
      const payload = {
        visitorName: formData.visitorName,
        email: formData.email,
        visitDate: currentDate,
        entryTime: currentTime,
        departmentVisited: formData.departmentVisited,
        purpose: formData.purpose,
        registeredBy: email,
      };
      
      console.log("[CLIENT] Enviando payload:", payload);
      
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[CLIENT] Response status:", res.status);
      const data = await res.json();
      console.log("[CLIENT] Response data:", data);

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar visita");
      }

      setSuccess("Visitante registrado correctamente");
      setFormData({ 
        visitorName: "", 
        email: "", 
        visitDate: "", 
        entryTime: "",
        departmentVisited: "", 
        purpose: "" 
      });
      
      // Usa el array de visitas devuelto por el servidor en lugar de hacer otro GET
      if (data.allVisits) {
        console.log("[CLIENT] Actualizando visitas desde respuesta POST:", data.allVisits);
        setVisits(data.allVisits);
      } else {
        // Fallback: hacer GET si por alguna razón no viene allVisits
        await fetchVisits();
      }
    } catch (err) {
      console.error("[CLIENT] Error:", err);
      setError(err.message || "Error al registrar la visita");
    }
  };

  const handleDeleteVisit = async (idx) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      
      const visitToDelete = visits[idx];
      const updatedVisits = visits.filter((_, i) => i !== idx);
      
      const res = await fetch("/api/visits", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: visitToDelete.timestamp }), // Assuming timestamp is the unique ID
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar el registro");
      }

      setVisits(updatedVisits);
      setSuccess("Registro eliminado correctamente.");
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      console.error("[CLIENT] Error al eliminar:", err);
      setError(err.message || "No se pudo eliminar el registro.");
    }
  };

  const handleLogout = () => {
    router.push("/");
  };

  const handleDateSearch = () => {
    const results = visits.filter(visit => visit.visitDate === searchDate);
    setSearchResults(results);
  };

  const getTabStyle = (tabName) => ({
    padding: "10px 20px",
    border: "none",
    borderBottom: activeTab === tabName ? "3px solid #2E8BFF" : "3px solid transparent",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: activeTab === tabName ? "bold" : "normal",
    color: activeTab === tabName ? "#0F4C81" : "#555",
  });

  const thStyle = { padding: "12px 15px", textAlign: "left", fontWeight: "bold" };
  const tdStyle = { padding: "12px 15px", borderBottom: "1px solid #eee" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      {/* Navbar */}
      <nav style={{
        background: "linear-gradient(135deg, #0F4C81 0%, #0A1C33 100%)",
        color: "white",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 20px rgba(10, 28, 51, 0.2)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexWrap: "wrap",
        gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "120px" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", letterSpacing: "1px", color: "#2E8BFF" }}>
            SIGECVI
          </div>
          <div style={{ borderLeft: "2px solid rgba(255,255,255,0.3)", paddingLeft: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <p style={{ margin: "0", fontSize: "0.8rem", fontWeight: "600", whiteSpace: "nowrap" }}>
              {name?.length > 15 ? name.substring(0, 12) + "..." : name}
            </p>
            <p style={{ margin: "0", fontSize: "0.7rem", opacity: "0.9", color: "#89CFFF", whiteSpace: "nowrap" }}>
              {email?.length > 20 ? email.substring(0, 17) + "..." : email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "rgba(46, 139, 255, 0.2)",
            color: "#89CFFF",
            border: "2px solid #2E8BFF",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.8rem",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#2E8BFF";
            e.target.style.color = "#0A1C33";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "rgba(46, 139, 255, 0.2)";
            e.target.style.color = "#89CFFF";
          }}
        >
          SALIR
        </button>
      </nav>

      <main style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          {/* Pestañas de Navegación */}
          <div style={{ marginBottom: "20px", borderBottom: "2px solid #ccc", display: "flex", gap: "4px", overflowX: "auto", scrollBehavior: "smooth", paddingBottom: "4px" }}>
            <button onClick={() => setActiveTab("register")} style={{...getTabStyle("register"), fontSize: "0.85rem", padding: "8px 14px", whiteSpace: "nowrap", flex: "1", minWidth: "100px" }}>
              Registrar
            </button>
            <button onClick={() => setActiveTab("history")} style={{...getTabStyle("history"), fontSize: "0.85rem", padding: "8px 14px", whiteSpace: "nowrap", flex: "1", minWidth: "90px" }}>
              Historial
            </button>
            <button onClick={() => setActiveTab("search")} style={{...getTabStyle("search"), fontSize: "0.85rem", padding: "8px 14px", whiteSpace: "nowrap", flex: "1", minWidth: "80px" }}>
              Buscar
            </button>
          </div>

          {/* Contenido de las Pestañas */}
          {activeTab === "register" && (
             <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(15, 76, 129, 0.08)",
                marginBottom: "40px",
                overflow: "hidden",
                border: "1px solid #89CFFF",
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #2E8BFF 0%, #0F4C81 100%)",
                  padding: "24px 30px",
                  color: "white",
                }}>
                  <h2 style={{ margin: "0", fontSize: "1.5rem", fontWeight: "700" }}>
                    📝 Registrar Nuevo Visitante
                  </h2>
                </div>
    
                <div style={{ padding: "30px" }}>
                  <form onSubmit={handleSubmitVisit} style={{ display: "grid", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#0F4C81", fontSize: "0.95rem" }}>
                          Nombre del Visitante *
                        </label>
                        <input
                          type="text"
                          name="visitorName"
                          value={formData.visitorName}
                          onChange={handleInputChange}
                          placeholder="Nombre completo"
                          style={{ width: "100%", padding: "12px 14px", border: "2px solid #A3B1C6", borderRadius: "8px", fontSize: "1rem", transition: "all 0.3s ease", boxSizing: "border-box" }}
                        />
                      </div>
    
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#0F4C81", fontSize: "0.95rem" }}>
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="correo@ejemplo.com"
                          style={{ width: "100%", padding: "12px 14px", border: "2px solid #A3B1C6", borderRadius: "8px", fontSize: "1rem", transition: "all 0.3s ease", boxSizing: "border-box" }}
                        />
                      </div>
                    </div>
    
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#0F4C81", fontSize: "0.95rem" }}>
                        Despacho/Departamento Visitado *
                      </label>
                      <select
                        name="departmentVisited"
                        value={formData.departmentVisited}
                        onChange={handleInputChange}
                        style={{ width: "100%", padding: "12px 14px", border: "2px solid #A3B1C6", borderRadius: "8px", fontSize: "1rem", transition: "all 0.3s ease", boxSizing: "border-box", backgroundColor: "white", cursor: "pointer" }}
                      >
                        <option value="">-- Selecciona un despacho --</option>
                        <option value="Despacho del Alcalde">Despacho del Alcalde</option>
                        <option value="Secretaría General">Secretaría General</option>
                        <option value="Tesorería">Tesorería</option>
                        <option value="Planeación">Planeación</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                        <option value="Contraloría">Contraloría</option>
                        <option value="Juzgado Municipal">Juzgado Municipal</option>
                        <option value="Personería Municipal">Personería Municipal</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
    
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#0F4C81", fontSize: "0.95rem" }}>
                        Propósito de la Visita
                      </label>
                      <textarea
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        placeholder="¿Cuál es el motivo de la visita?"
                        rows={3}
                        style={{ width: "100%", padding: "12px 14px", border: "2px solid #A3B1C6", borderRadius: "8px", fontSize: "1rem", fontFamily: "inherit", transition: "all 0.3s ease", boxSizing: "border-box", resize: "none" }}
                      />
                    </div>
    
                    <button
                      type="submit"
                      style={{ background: "linear-gradient(135deg, #2E8BFF 0%, #0F4C81 100%)", color: "white", border: "none", padding: "14px 28px", borderRadius: "8px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(46, 139, 255, 0.3)" }}
                    >
                      ✓ REGISTRAR VISITANTE
                    </button>
    
                    {error && <div style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "12px 16px", borderRadius: "8px", borderLeft: "4px solid #c62828", fontWeight: "500" }}>{error}</div>}
                    {success && <div style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "12px 16px", borderRadius: "8px", borderLeft: "4px solid #2e7d32", fontWeight: "500" }}>{success}</div>}
                  </form>
                </div>
              </div>
          )}

          {activeTab === "history" && (
            <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 8px 32px rgba(15, 76, 129, 0.08)", overflow: "hidden", border: "1px solid #89CFFF" }}>
              <div style={{ background: "linear-gradient(135deg, #2E8BFF 0%, #0F4C81 100%)", padding: "24px 30px", color: "white" }}>
                <h2 style={{ margin: "0", fontSize: "1.5rem", fontWeight: "700" }}>📋 Historial de Visitas ({visits.length})</h2>
              </div>
              <div style={{ padding: "0", overflowX: "auto" }}>
                {loading ? <p style={{padding: "20px"}}>Cargando historial...</p> : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "linear-gradient(to right, #0F4C81, #0A1C33)", color: "white" }}>
                        <th style={thStyle}>Visitante</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Fecha</th>
                        <th style={thStyle}>Hora</th>
                        <th style={thStyle}>Departamento</th>
                        <th style={thStyle}>Propósito</th>
                        <th style={thStyle}>Registrado por</th>
                        <th style={thStyle}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map((visit, idx) => (
                        <tr key={visit.timestamp || idx} style={{ borderBottom: "1px solid #eee", backgroundColor: idx % 2 === 0 ? "#fafbff" : "white" }}>
                          <td style={tdStyle}>{visit.visitorName}</td>
                          <td style={tdStyle}>{visit.email}</td>
                          <td style={tdStyle}>{visit.visitDate}</td>
                          <td style={tdStyle}>{visit.entryTime}</td>
                          <td style={tdStyle}>{visit.departmentVisited}</td>
                          <td style={tdStyle}>{visit.purpose}</td>
                          <td style={tdStyle}>{visit.registeredBy}</td>
                          <td style={tdStyle}>
                            <button onClick={() => handleDeleteVisit(idx)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 8px 32px rgba(15, 76, 129, 0.08)", padding: "30px", border: "1px solid #89CFFF" }}>
              <h2 style={{ marginTop: 0, color: "#0F4C81" }}>Buscar Visitas por Fecha</h2>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "2px solid #A3B1C6", fontSize: "1rem" }} />
                <button onClick={handleDateSearch} style={{ padding: "10px 20px", backgroundColor: "#2E8BFF", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                  Buscar
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "linear-gradient(to right, #0F4C81, #0A1C33)", color: "white" }}>
                        <th style={thStyle}>Visitante</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Fecha</th>
                        <th style={thStyle}>Hora</th>
                        <th style={thStyle}>Departamento</th>
                        <th style={thStyle}>Propósito</th>
                        <th style={thStyle}>Registrado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((visit, idx) => (
                        <tr key={visit.timestamp || idx} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={tdStyle}>{visit.visitorName}</td>
                          <td style={tdStyle}>{visit.email}</td>
                          <td style={tdStyle}>{visit.visitDate}</td>
                          <td style={tdStyle}>{visit.entryTime}</td>
                          <td style={tdStyle}>{visit.departmentVisited}</td>
                          <td style={tdStyle}>{visit.purpose}</td>
                          <td style={tdStyle}>{visit.registeredBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No se encontraron visitas para la fecha seleccionada.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
