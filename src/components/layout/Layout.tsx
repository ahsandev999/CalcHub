import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  isHome?: boolean;
}

export default function Layout({ children, isHome = false }: LayoutProps) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!isHome && <Footer />}
    </>
  );
}
