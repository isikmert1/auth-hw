
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 auth-container">
      <div className="auth-card">
        <h1 className="auth-heading">{title}</h1>
        <p className="auth-subheading">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
