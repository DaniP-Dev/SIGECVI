import ProfileClient from "./ProfileClient";

export default function Page({ searchParams }) {
  const userParam = searchParams?.user || null;

  // Render the client component with the explicit prop to avoid useSearchParams
  return <ProfileClient userParam={userParam} />;
}
