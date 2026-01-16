import React from 'react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
    const [loginStep, setLoginStep] = React.useState('role'); // 'role' or 'credentials'
    const [selectedRole, setSelectedRole] = React.useState(null);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setLoginStep('role');
            setSelectedRole(null);
            setEmail('');
            setPassword('');
        }
    }, [isOpen]);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setLoginStep('credentials');
    };

    const handleBack = () => {
        setLoginStep('role');
        setSelectedRole(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Login attempt:", { role: selectedRole, email, password });
        // TODO: Add API call here
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <button className="modal-close" onClick={onClose}>&times;</button>

                {loginStep === 'role' ? (
                    <>
                        <h2 className="modal-title">Welcome Back</h2>
                        <p className="modal-subtitle">Select your login type</p>

                        <div className="login-options">
                            <button className="login-option" onClick={() => handleRoleSelect('Executive')}>
                                <span className="option-title">Executive</span>
                                <span className="option-desc">Access executive dashboard</span>
                            </button>

                            <button className="login-option" onClick={() => handleRoleSelect('Admin')}>
                                <span className="option-title">Admin</span>
                                <span className="option-desc">Manage platform settings</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-header-row">
                            <button className="back-btn" onClick={handleBack}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <h2 className="modal-title">Login as {selectedRole}</h2>
                        </div>
                        <p className="modal-subtitle">Enter your details to access your account</p>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="login-input"
                                    placeholder="Email or ID"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="password"
                                    className="login-input"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn">
                                Login
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginModal;
