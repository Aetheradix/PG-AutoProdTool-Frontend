import { SignupForm } from './SignupForm';
import Logo from '../../../components/Logo';

export function SignupPage() {
  return (
    <div className="auth-page-container">
      {/* Left side - Signup Form */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="space-y-6">
            <Logo size="large" />
            <h1 className="auth-title">
              Join Our <br />
              <span className="text-primary">Production Platform</span>
            </h1>
            <p className="auth-subtitle">Create your account to start planning.</p>
          </div>

          <SignupForm />

          <div className="pt-8 text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Automation System. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Illustration/Decoration */}
      <div className="auth-illustration-side">
        <img
          className="auth-image"
          src="https://i.pinimg.com/736x/99/4e/aa/994eaae66bdc4648fa3b0ed54f040c22.jpg"
          alt="Engineering"
        />
        <div className="auth-image-overlay"></div>

        <div className="auth-info-content">
          <h2 className="text-4xl font-bold mb-4">Scale Your Production</h2>
          <p className="auth-info-text">
            Experience the next generation of supply chain planning with our intelligent, automated platform.
          </p>
        </div>
      </div>
    </div>
  );
}
