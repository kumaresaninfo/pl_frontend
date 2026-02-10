import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatternLock from '../components/PatternLock';

const SignIn = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [showPattern, setShowPattern] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        document.title = 'Login - Password Less Application';
    }, []);

    // Validation function
    const validateUsername = (username) => {
        if (!username.trim()) {
            return 'Username is required';
        }
        if (username.length < 3) {
            return 'Username must be at least 3 characters';
        }
        return '';
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);

        // Real-time validation
        if (touched) {
            setUsernameError(validateUsername(value));
        }
    };

    const handleBlur = () => {
        setTouched(true);
        setUsernameError(validateUsername(username));
    };

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        setTouched(true);

        const error = validateUsername(username);
        setUsernameError(error);

        if (error) {
            setMessage({ type: 'error', text: 'Please fix the error below' });
            return;
        }

        setMessage({ type: '', text: '' });
        setShowPattern(true);
    };

    const handlePatternComplete = async (patternString) => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    pattern: patternString
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Authentication successful!' });
                localStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => {
                    navigate('/welcome');
                }, 1000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Authentication failed' });
                setTimeout(() => {
                    setShowPattern(false);
                    setMessage({ type: '', text: '' });
                }, 1500);
                setLoading(false);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again.' });
            setShowPattern(false);
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>🔐 Welcome Back</h1>
                <p>Sign in with your pattern</p>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {!showPattern ? (
                    <form onSubmit={handleUsernameSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={handleUsernameChange}
                                onBlur={handleBlur}
                                placeholder="Enter your username"
                                className={usernameError && touched ? 'input-error' : ''}
                            />
                            {usernameError && touched && (
                                <span className="error-text">{usernameError}</span>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Continue to Pattern
                        </button>
                    </form>
                ) : (
                    <div>
                        <div className="message message-info" style={{ marginBottom: '1.5rem' }}>
                            Welcome back, <strong>{username}</strong>! Draw your pattern
                        </div>
                        <PatternLock
                            onPatternComplete={handlePatternComplete}
                            title="Draw Your Pattern"
                        />
                        {!loading && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowPattern(false);
                                    setMessage({ type: '', text: '' });
                                }}
                            >
                                Change Username
                            </button>
                        )}
                    </div>
                )}

                <p style={{ marginTop: '1.5rem' }}>
                    Don't have an account?{' '}
                    <a href="/register" className="link">Register</a>
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                    <a href="/forgot-pattern" className="link">Forgot Pattern?</a>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
