"use client";

import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function LogoutButton({ children }) {
  const router = useRouter();

  function handleClick() {
    router.push("/");
  }

  return (
    <button className={styles.secondaryBtn} onClick={handleClick}>
      {children || "Cerrar sesión"}
    </button>
  );
}
