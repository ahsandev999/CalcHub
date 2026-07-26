import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  isHome?: boolean;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <main className="main-content" style={{ minHeight: 'calc(100vh - 140px)', paddingBottom: 40 }}>{children}</main>
      <Footer />
    </>
  );
}
