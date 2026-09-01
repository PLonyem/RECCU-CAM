import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col flex-1">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
