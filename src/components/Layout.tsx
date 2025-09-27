import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-20">
        {children}
      </main>
      <Navigation />
    </div>
  );
};