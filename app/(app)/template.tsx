/**
 * Re-mounts on every navigation inside the app shell, so each page eases in
 * (fade + slight rise) instead of snapping into place.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
