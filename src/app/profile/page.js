"use client";

import { Suspense } from "react";
import ProfileContent from "./profile-content";

export default function Profile() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Cargando...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
