import { Footer } from "@/components/shared";
import { AppBackground } from "@/components/shared/app-background";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Single site-wide animated background layer (fixed, z-index -1) */}
      <AppBackground />
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </>
  );
}
