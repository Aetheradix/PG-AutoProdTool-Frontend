import React from 'react';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  return (
    <div className="auth-page-container">
      {/* Left side - Login Form */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="space-y-4">
            <div className="auth-header-logo">
              P&G
            </div>
            <h1 className="auth-title">
              Automated <br />
              <span className="text-primary">Production Planning</span>
            </h1>
            <p className="auth-subtitle">Welcome back! Please login to your account.</p>
          </div>

          <LoginForm />

          <div className="pt-4 text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Automation System. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Illustration/Decoration */}
      <div className="auth-illustration-side">
        <div className="auth-bg-gradient"></div>
        {/* Decorative Circle */}
        <div className="auth-deco-circle"></div>

        <div className="relative z-10 max-w-lg text-center p-8">
          <p className="auth-info-text">
            Streamline your production workflow with intelligent automation.
          </p>
        </div>
      </div>
    </div>

  );
}
