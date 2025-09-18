import React from "react";
import type { ReactNode } from "react";
// import { useAppSelector } from "../redux";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
}) => {
  // const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeader && <Header />}

      <main className="flex-1">
        <div className="mobile-container sm:tablet-container lg:desktop-container">
          {children}
        </div>
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
