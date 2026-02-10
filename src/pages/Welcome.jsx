import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        document.title = 'Dashboard - Password Less Application';
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/signin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/signin');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="container">
            <div className="card welcome-container">
                <div className="welcome-icon">🎉</div>
                <h1>Welcome, {user.name}!</h1>
                <p>You've successfully authenticated with your pattern</p>

                <div className="user-info">
                    <div className="user-info-item">
                        <span className="user-info-label">Name</span>
                        <span className="user-info-value">{user.name}</span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-label">Email</span>
                        <span className="user-info-value">{user.email}</span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-label">Username</span>
                        <span className="user-info-value">{user.username}</span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-label">Authentication</span>
                        <span className="user-info-value" style={{ color: '#00f2fe' }}>
                            ✓ Pattern Lock
                        </span>
                    </div>
                </div>

                <div className="message message-success" style={{ marginTop: '1.5rem' }}>
                    🔒 Your account is secured with passwordless authentication!
                </div>

                <button className="btn btn-primary" onClick={handleLogout} style={{ marginTop: '1.5rem' }}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Welcome;
