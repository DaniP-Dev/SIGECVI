import ProfileClient from "./ProfileClient";

// Ensure this page is rendered dynamically on the server (avoid prerender)
export const dynamic = "force-dynamic";

export default function Page({ searchParams }) {
  const userParam = searchParams?.user || null;

  // Render the client component with the explicit prop to avoid useSearchParams
  return <ProfileClient userParam={userParam} />;
}
