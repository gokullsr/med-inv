import React, { useState } from 'react';
import API_BASE_URL from '../config/api';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loginTime', new Date().toISOString());
                localStorage.setItem('adminEmail', data.admin.email);
                localStorage.setItem('adminName', data.admin.name);
                onLogin();
            } else {
                setError(data.error || 'Invalid email or password. Please try again.');
                setShake(true);
                setTimeout(() => setShake(false), 600);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to server. Please try again.');
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }

        setIsLoading(false);
    };

    return (
        <div className="login-page">
            {/* Animated background elements */}
            <div className="login-bg-decoration">
                <div className="login-bg-circle login-bg-circle-1"></div>
                <div className="login-bg-circle login-bg-circle-2"></div>
                <div className="login-bg-circle login-bg-circle-3"></div>
                <div className="login-bg-pulse login-bg-pulse-1"></div>
                <div className="login-bg-pulse login-bg-pulse-2"></div>
            </div>

            <div className={`login-card ${shake ? 'login-shake' : ''}`}>
                {/* Top accent bar */}
                <div className="login-card-accent"></div>

                {/* Logo / Header */}
                <div className="login-header">
                    <div className="login-logo-container">
                        <div className="login-logo-icon">
                            <span className="login-logo-emoji">💊</span>
                            <div className="login-logo-ring"></div>
                        </div>
                    </div>
                    <h1 className="login-title">JYO Medical Centre</h1>
                    <p className="login-subtitle">Admin Portal</p>
                    <div className="login-divider">
                        <span className="login-divider-dot"></span>
                        <span className="login-divider-line"></span>
                        <span className="login-divider-dot"></span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="login-error">
                        <span className="login-error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="login-email" className="login-label">
                            <span className="login-label-icon">📧</span>
                            Email Address
                        </label>
                        <div className="login-input-wrapper">
                            <input
                                id="login-email"
                                type="email"
                                placeholder="Enter your admin email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="login-input"
                            />
                            <div className="login-input-focus-ring"></div>
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password" className="login-label">
                            <span className="login-label-icon">🔒</span>
                            Password
                        </label>
                        <div className="login-input-wrapper">
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="login-input"
                            />
                            <button
                                type="button"
                                className="login-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                            <div className="login-input-focus-ring"></div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`login-submit-btn ${isLoading ? 'login-loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="login-spinner-wrapper">
                                <span className="login-spinner"></span>
                                <span>Authenticating...</span>
                            </span>
                        ) : (
                            <span className="login-btn-content">
                                <span>Sign In</span>
                                <span className="login-btn-arrow">→</span>
                            </span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p className="login-footer-text">
                        🔐 Secure Admin Access Only
                    </p>
                    <p className="login-copyright">
                        © 2026 JYO Medical Centre. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
