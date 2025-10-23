"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../page.module.css";
import LogoutButton from "./LogoutButton";

export default function Page() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");

  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userParam) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/users.json");
        if (!res.ok) throw new Error("No se pudo cargar usuarios");
        const users = await res.json();
        const user = users.find((u) => u.username === userParam);
        if (user) setName(user.name);
        else setName(null);
      } catch (err) {
        console.error(err);
        setName(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userParam]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          {loading ? (
            <h1>Cargando...</h1>
          ) : name ? (
            <>
              <h1>Bienvenido, {name}!</h1>
              <p>Has ingresado correctamente con el usuario "{userParam}".</p>
              <div style={{ marginTop: 20 }}>
                <LogoutButton>Cerrar sesión</LogoutButton>
              </div>
            </>
          ) : (
            <>
              <h1>Usuario no encontrado</h1>
              <p>No se encontró el usuario especificado. Vuelve e intenta de nuevo.</p>
              <div style={{ marginTop: 20 }}>
                <LogoutButton>Volver al login</LogoutButton>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
