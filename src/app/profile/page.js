"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../page.module.css";

export default function Profile() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const nameParam = searchParams.get("name");
    const emailParam = searchParams.get("email");
    setName(nameParam || "Usuario");
    setEmail(emailParam || "");
  }, [searchParams]);

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logoCircle}>
              {/* logo */}
            </div>
            <div className={styles.brandTitle}>SIGECVI</div>
            <div className={styles.brandSlogan}>
              (Sistema Integral de Gestión y Control de Visitas Ciudadanas)
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "20px", color: "#333" }}>
              Bienvenido
            </h1>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#000", marginBottom: "10px" }}>
              {name}
            </p>
            {email && (
              <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "30px" }}>
                {email}
              </p>
            )}
            <button
              onClick={handleLogout}
              className={styles.loginBtn}
              style={{ marginTop: "20px" }}
            >
              SALIR
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
