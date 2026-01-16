import React from 'react';
import { SignupForm } from './SignupForm';

export function SignupPage() {
  return (
    <div className="auth-page-container">
      {/* Left side - Signup Form */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="space-y-4">
            <div className="auth-header-logo">P&G</div>
            <h1 className="auth-title">
              Join Our <br />
              <span className="text-primary">Production Platform</span>
            </h1>
            <p className="auth-subtitle">Create your account to start planning.</p>
          </div>

          <SignupForm />

          <div className="pt-4 text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Automation System. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Illustration/Decoration */}
      <div className="auth-illustration-side">
        <div className="auth-bg-gradient"></div>
        <div className="auth-deco-circle"></div>

        <div className="relative z-10 max-w-lg text-center p-8">
          <p className="auth-info-text">
            Join thousands of professionals streamlining their production workflow.
          </p>
        </div>
      </div>
    </div>
  );
}
