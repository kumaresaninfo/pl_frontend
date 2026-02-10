import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatternLock from '../components/PatternLock';

const ForgotPattern = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: verify, 2: new pattern, 3: confirm
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });
    const [newPattern, setNewPattern] = useState('');
    const [confirmPattern, setConfirmPattern] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        username: '',
        email: ''
    });
    const [touched, setTouched] = useState({
        username: false,
        email: false
    });

    useEffect(() => {
        document.title = 'Reset Pattern - Password Less Application';
    }, []);

    // Validation functions
    const validateUsername = (username) => {
        if (!username.trim()) {
            return 'Username is required';
        }
        if (username.length < 3) {
            return 'Username must be at least 3 characters';
        }
        return '';
    };

    const validateEmail = (email) => {
        if (!email.trim()) {
            return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Real-time validation
        if (touched[name]) {
            let error = '';
            if (name === 'username') error = validateUsername(value);
            if (name === 'email') error = validateEmail(value);

            setErrors({
                ...errors,
                [name]: error
            });
        }
    };

    const handleBlur = (field) => {
        setTouched({
            ...touched,
            [field]: true
        });

        // Validate on blur
        let error = '';
        if (field === 'username') error = validateUsername(formData.username);
        if (field === 'email') error = validateEmail(formData.email);

        setErrors({
            ...errors,
            [field]: error
        });
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            username: true,
            email: true
        });

        // Validate all fields
        const usernameError = validateUsername(formData.username);
        const emailError = validateEmail(formData.email);

        setErrors({
            username: usernameError,
            email: emailError
        });

        // Check if there are any errors
        if (usernameError || emailError) {
            setMessage({ type: 'error', text: 'Please fix the errors below' });
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/auth/verify-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'User verified! Create your new pattern' });
                setTimeout(() => {
                    setStep(2);
                    setMessage({ type: '', text: '' });
                }, 1000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Verification failed' });
            }
            setLoading(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again.' });
            setLoading(false);
        }
    };

    const handlePatternComplete = (patternString) => {
        if (step === 2) {
            setNewPattern(patternString);
            setMessage({ type: 'success', text: 'Pattern set! Now confirm your new pattern' });
            setTimeout(() => {
                setStep(3);
                setMessage({ type: '', text: '' });
            }, 1000);
        } else if (step === 3) {
            setConfirmPattern(patternString);
            if (patternString === newPattern) {
                handlePatternReset(patternString);
            } else {
                setMessage({ type: 'error', text: 'Patterns do not match! Try again' });
                setTimeout(() => {
                    setNewPattern('');
                    setConfirmPattern('');
                    setStep(2);
                    setMessage({ type: '', text: '' });
                }, 1500);
            }
        }
    };

    const handlePatternReset = async (patternString) => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/auth/reset-pattern`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    newPattern: patternString
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Pattern reset successful! Redirecting to login...' });
                setTimeout(() => {
                    navigate('/signin');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Pattern reset failed' });
                setLoading(false);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again.' });
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>🔑 Reset Pattern</h1>
                <p>Forgot your pattern? Let's reset it!</p>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleVerifySubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('username')}
                                placeholder="kumaresan"
                                className={errors.username && touched.username ? 'input-error' : ''}
                            />
                            {errors.username && touched.username && (
                                <span className="error-text">{errors.username}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('email')}
                                placeholder="kumaresanpvi23@gmail.com"
                                className={errors.email && touched.email ? 'input-error' : ''}
                            />
                            {errors.email && touched.email && (
                                <span className="error-text">{errors.email}</span>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Identity'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div>
                        <PatternLock
                            onPatternComplete={handlePatternComplete}
                            title="Draw Your New Pattern"
                        />
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <PatternLock
                            onPatternComplete={handlePatternComplete}
                            title="Confirm Your New Pattern"
                        />
                    </div>
                )}

                {step > 1 && !loading && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setStep(1);
                            setNewPattern('');
                            setConfirmPattern('');
                            setMessage({ type: '', text: '' });
                        }}
                    >
                        Back to Verification
                    </button>
                )}

                <p style={{ marginTop: '1.5rem' }}>
                    Remember your pattern?{' '}
                    <a href="/signin" className="link">Sign In</a>
                </p>
            </div>
        </div>
    );
};

export default ForgotPattern;
