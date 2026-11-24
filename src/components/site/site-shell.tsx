import SiteFooter from "./footer";
import SiteHeader from "./header";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-theme site-shell">
      <SiteHeader />
      <main className="flex-grow">{children}</main>
      <SiteFooter />
    </div>
  );
}
