"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
  // fetch the public users.json
  const res = await fetch("/users.json");
      if (!res.ok) throw new Error("No se pudo cargar la lista de usuarios");
      const users = await res.json();

      // compare email case-insensitively, but password case-sensitively
      const normalizedEmail = String(email).trim().toLowerCase();
      const pass = String(password).trim();
      // debug: show what's being compared (remove in production)
      console.debug("login: normalizedEmail=", normalizedEmail, "pass=", pass);
      console.debug("login: users=", users.map(u => ({ email: String(u?.email||"").trim().toLowerCase(), password: String(u?.password||"").trim() })));

      const user = users.find((u) => {
        const uEmail = String(u?.email || "").trim().toLowerCase();
        const uPass = String(u?.password || "").trim();
        return uEmail === normalizedEmail && uPass === pass;
      });

      if (!user) {
        // Short message when user not found or credentials wrong
        setError("No existe");
        return;
      }

      // redirect to profile page with username in query string
  router.push(`/profile?email=${encodeURIComponent(user.email)}`);
    } catch (err) {
      console.error(err);
      setError("Error al procesar el login");
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logoCircle}>
              {/* logo removed as requested */}
            </div>
            <div className={styles.brandTitle}>SIGECVI</div>
            <div className={styles.brandSlogan}>
              (Sistema Integral de Gestión y Control de Visitas Ciudadanas)
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formField}>
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formField}>
              <input
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.helperRow}>
              <div className={styles.remember}>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Recordarme</label>
              </div>
            </div>

            <div>
              <button className={styles.loginBtn} type="submit">
                ENTRAR
              </button>
            </div>

            {error && (
                <p style={{ color: "#ffffff", marginTop: 12, fontWeight: 600 }}>{error}</p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
