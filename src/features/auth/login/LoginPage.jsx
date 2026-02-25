import React from 'react';
import { LoginForm } from './LoginForm';
import Logo from '../../../components/Logo';

export function LoginPage() {
  return (
    <div className="auth-page-container">
      {/* Left side - Login Form */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="space-y-6">
            <Logo size="large" />
            <h1 className="auth-title">
              Automated <br />
              <span className="text-primary">Production Planning</span>
            </h1>
            <p className="auth-subtitle">Welcome back! Please login to your account.</p>
          </div>

          <LoginForm />

          <div className="pt-8 text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Automation System. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side  */}
      <div className="auth-illustration-side">
        <img
          className="auth-image"
          src="https://i.pinimg.com/736x/99/4e/aa/994eaae66bdc4648fa3b0ed54f040c22.jpg"
          alt="Industrial Automation"
        />
        <div className="auth-image-overlay"></div>

        <div className="auth-info-content">
          <h2 className="text-4xl font-bold mb-4">Precision & Efficiency</h2>
          <p className="auth-info-text">
            Streamline your production workflow with our intelligent, automated planning systems.
          </p>
        </div>
      </div>
    </div>
  );
}
