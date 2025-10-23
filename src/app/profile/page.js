import fs from "fs/promises";
import path from "path";
import styles from "../page.module.css";
import LogoutButton from "./LogoutButton";

export default async function Page({ searchParams }) {
  const userParam = searchParams?.user || null;

  let name = null;

  if (userParam) {
    try {
      const file = path.join(process.cwd(), "public", "users.json");
      const data = await fs.readFile(file, "utf8");
      const users = JSON.parse(data);
      const user = users.find((u) => u.username === userParam);
      if (user) name = user.name;
    } catch (err) {
      console.error("Error reading users.json:", err);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          {name ? (
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
