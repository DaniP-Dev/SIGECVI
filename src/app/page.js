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
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(email).trim(), password: String(password) }),
      });

      if (res.status === 401) {
        setError('Credenciales inválidas');
        return;
      }

      if (!res.ok) {
        // try to extract error message from response
        let msg = 'Error al procesar el login';
        try {
          const errBody = await res.json();
          if (errBody?.error) msg = errBody.error;
        } catch (e) {
          // ignore json parse errors
        }
        setError(msg);
        return;
      }

      const data = await res.json();
      const user = data?.user;
      if (!user) {
        setError('Respuesta inválida del servidor');
        return;
      }

      const queryParams = new URLSearchParams({
        email: user.email,
        name: user.name || 'Usuario',
      }).toString();
      router.push(`/profile?${queryParams}`);
    } catch (err) {
      console.error(err);
      setError('Error al procesar el login');
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
