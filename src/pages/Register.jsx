import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatternLock from '../components/PatternLock';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: ''
    });
    const [pattern, setPattern] = useState('');
    const [confirmPattern, setConfirmPattern] = useState('');
    const [step, setStep] = useState(1); // 1: form, 2: pattern, 3: confirm
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        username: ''
    });
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        username: false
    });

    useEffect(() => {
        document.title = 'Register - Password Less Application';
    }, []);

    // Validation functions
    const validateName = (name) => {
        if (!name.trim()) {
            return 'Name is required';
        }
        if (name.trim().length < 2) {
            return 'Name must be at least 2 characters';
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Name can only contain letters and spaces';
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

    const validateUsername = (username) => {
        if (!username.trim()) {
            return 'Username is required';
        }
        if (username.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (username.length > 20) {
            return 'Username must be less than 20 characters';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return 'Username can only contain letters, numbers, and underscores';
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
            if (name === 'name') error = validateName(value);
            if (name === 'email') error = validateEmail(value);
            if (name === 'username') error = validateUsername(value);

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
        if (field === 'name') error = validateName(formData.name);
        if (field === 'email') error = validateEmail(formData.email);
        if (field === 'username') error = validateUsername(formData.username);

        setErrors({
            ...errors,
            [field]: error
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            username: true
        });

        // Validate all fields
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        const usernameError = validateUsername(formData.username);

        setErrors({
            name: nameError,
            email: emailError,
            username: usernameError
        });

        // Check if there are any errors
        if (nameError || emailError || usernameError) {
            setMessage({ type: 'error', text: 'Please fix the errors below' });
            return;
        }

        setMessage({ type: '', text: '' });
        setStep(2);
    };

    const handlePatternComplete = (patternString) => {
        if (step === 2) {
            setPattern(patternString);
            setMessage({ type: 'success', text: 'Pattern set! Now confirm your pattern' });
            setTimeout(() => {
                setStep(3);
                setMessage({ type: '', text: '' });
            }, 1000);
        } else if (step === 3) {
            setConfirmPattern(patternString);
            if (patternString === pattern) {
                handleRegistration(patternString);
            } else {
                setMessage({ type: 'error', text: 'Patterns do not match! Try again' });
                setTimeout(() => {
                    setPattern('');
                    setConfirmPattern('');
                    setStep(2);
                    setMessage({ type: '', text: '' });
                }, 1500);
            }
        }
    };

    const handleRegistration = async (patternString) => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    pattern: patternString
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
                setTimeout(() => {
                    navigate('/signin');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Registration failed' });
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
                <h1>🎨 Create Account</h1>
                <p>Join with pattern-based authentication</p>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleFormSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('name')}
                                placeholder="Kumaresan Rajendran"
                                className={errors.name && touched.name ? 'input-error' : ''}
                            />
                            {errors.name && touched.name && (
                                <span className="error-text">{errors.name}</span>
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

                        <button type="submit" className="btn btn-primary">
                            Continue to Pattern Setup
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div>
                        <PatternLock
                            onPatternComplete={handlePatternComplete}
                            title="Create Your Pattern"
                        />
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <PatternLock
                            onPatternComplete={handlePatternComplete}
                            title="Confirm Your Pattern"
                        />
                    </div>
                )}

                {step > 1 && !loading && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setStep(1);
                            setPattern('');
                            setConfirmPattern('');
                            setMessage({ type: '', text: '' });
                        }}
                    >
                        Back to Form
                    </button>
                )}

                <p style={{ marginTop: '1.5rem' }}>
                    Already have an account?{' '}
                    <a href="/signin" className="link">Sign In</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
