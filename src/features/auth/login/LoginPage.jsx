import React from 'react';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 lg:px-20 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-6">
              P&G
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-secondary">
              Automated <br />
              <span className="text-primary">Production Planning</span>
            </h1>
            <p className="text-text-muted text-lg">Welcome back! Please login to your account.</p>
          </div>

          <LoginForm />

          <div className="pt-4 text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Automation System. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Illustration/Decoration */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-blue-100 z-0"></div>
        {/* Decorative Circle */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary rounded-full opacity-5 blur-3xl"></div>

        <div className="relative z-10 max-w-lg text-center p-8">
          {/* Placeholder for illustration */}
          {/* <div className="aspect-square bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex items-center justify-center p-10">
            <div className="text-primary/20 font-bold text-6xl rotate-12 select-none">
              Factory
              <br />
              Illustration
            </div>
          </div> */}
          <p className="mt-8 text-secondary/70 font-medium">
            Streamline your production workflow with intelligent automation.
          </p>
        </div>

        {/* Curvy shape divider simulation (simplified via CSS or SVG) */}
        {/* In a real scenario, this would be an SVG background image */}
      </div>
    </div>
  );
}
