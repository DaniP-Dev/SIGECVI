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
  const [formData, setFormData] = useState({ visitorName: "", visitorEmail: "", purpose: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    if (!formData.visitorName || !formData.visitorEmail) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: formData.visitorName,
          visitorEmail: formData.visitorEmail,
          purpose: formData.purpose,
          registeredBy: email,
        }),
      });

      if (!res.ok) throw new Error("Error al registrar visita");

      setSuccess("Visitante registrado correctamente");
      setFormData({ visitorName: "", visitorEmail: "", purpose: "" });
      await fetchVisits();
    } catch (err) {
      console.error(err);
      setError("Error al registrar la visita");
    }
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Navbar */}
      <nav style={{
        background: "linear-gradient(135deg, #0F4C81 0%, #0A1C33 100%)",
        color: "white",
        padding: "16px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 20px rgba(10, 28, 51, 0.2)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "1px", color: "#2E8BFF" }}>
            SIGECVI
          </div>
          <div style={{ borderLeft: "2px solid rgba(255,255,255,0.3)", paddingLeft: "20px" }}>
            <p style={{ margin: "0", fontSize: "0.95rem", fontWeight: "600" }}>
              {name}
            </p>
            <p style={{ margin: "0", fontSize: "0.85rem", opacity: "0.9", color: "#89CFFF" }}>
              {email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "rgba(46, 139, 255, 0.2)",
            color: "#89CFFF",
            border: "2px solid #2E8BFF",
            padding: "8px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.9rem",
            transition: "all 0.3s ease",
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
          {/* Formulario de registro */}
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
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#0F4C81",
                      fontSize: "0.95rem",
                    }}>
                      Nombre del Visitante
                    </label>
                    <input
                      type="text"
                      name="visitorName"
                      value={formData.visitorName}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "2px solid #A3B1C6",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#2E8BFF"}
                      onBlur={(e) => e.target.style.borderColor = "#A3B1C6"}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#0F4C81",
                      fontSize: "0.95rem",
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="visitorEmail"
                      value={formData.visitorEmail}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "2px solid #A3B1C6",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#2E8BFF"}
                      onBlur={(e) => e.target.style.borderColor = "#A3B1C6"}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "#0F4C81",
                    fontSize: "0.95rem",
                  }}>
                    Propósito de la Visita
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="¿Cuál es el motivo de la visita?"
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "2px solid #A3B1C6",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontFamily: "inherit",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                      resize: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#2E8BFF"}
                    onBlur={(e) => e.target.style.borderColor = "#A3B1C6"}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #2E8BFF 0%, #0F4C81 100%)",
                    color: "white",
                    border: "none",
                    padding: "14px 28px",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(46, 139, 255, 0.3)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.boxShadow = "0 6px 20px rgba(46, 139, 255, 0.5)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.boxShadow = "0 4px 15px rgba(46, 139, 255, 0.3)";
                  }}
                >
                  ✓ REGISTRAR VISITANTE
                </button>

                {error && (
                  <div style={{
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    borderLeft: "4px solid #c62828",
                    fontWeight: "500",
                  }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    borderLeft: "4px solid #2e7d32",
                    fontWeight: "500",
                  }}>
                    {success}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Lista de visitas */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(15, 76, 129, 0.08)",
            overflow: "hidden",
            border: "1px solid #89CFFF",
          }}>
            <div style={{
              background: "linear-gradient(135deg, #2E8BFF 0%, #0F4C81 100%)",
              padding: "24px 30px",
              color: "white",
            }}>
              <h2 style={{ margin: "0", fontSize: "1.5rem", fontWeight: "700" }}>
                📋 Historial de Visitas ({visits.length})
              </h2>
            </div>

            <div style={{ padding: "30px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#A3B1C6" }}>
                  <p style={{ fontSize: "1.1rem" }}>⏳ Cargando visitas...</p>
                </div>
              ) : visits.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#A3B1C6" }}>
                  <p style={{ fontSize: "1.1rem" }}>📭 No hay visitantes registrados aún</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.95rem",
                  }}>
                    <thead>
                      <tr style={{
                        borderBottom: "3px solid #2E8BFF",
                        backgroundColor: "#f0f6ff",
                      }}>
                        <th style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#0F4C81",
                        }}>
                          👤 Nombre
                        </th>
                        <th style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#0F4C81",
                        }}>
                          📧 Email
                        </th>
                        <th style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#0F4C81",
                        }}>
                          🎯 Propósito
                        </th>
                        <th style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#0F4C81",
                        }}>
                          ✍️ Registrado por
                        </th>
                        <th style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#0F4C81",
                        }}>
                          🕐 Fecha y Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map((visit, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid #89CFFF",
                            transition: "background-color 0.2s ease",
                            backgroundColor: idx % 2 === 0 ? "#fafbff" : "white",
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e6f0ff"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fafbff" : "white"}
                        >
                          <td style={{ padding: "16px", color: "#0A1C33", fontWeight: "500" }}>
                            {visit.visitorName || "-"}
                          </td>
                          <td style={{ padding: "16px", color: "#0F4C81" }}>
                            {visit.visitorEmail || "-"}
                          </td>
                          <td style={{ padding: "16px", color: "#0F4C81", maxWidth: "200px" }}>
                            {visit.purpose || "-"}
                          </td>
                          <td style={{ padding: "16px", color: "#0F4C81" }}>
                            {visit.registeredBy || "-"}
                          </td>
                          <td style={{ padding: "16px", fontSize: "0.9rem", color: "#A3B1C6" }}>
                            {visit.timestamp
                              ? new Date(visit.timestamp).toLocaleString("es-ES")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
