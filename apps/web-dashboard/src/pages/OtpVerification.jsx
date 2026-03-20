import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function OtpVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, login } = useAuth(); // Destructure login
    const [otp, setOtp] = useState('');
    const [email] = useState(location.state?.email || user?.email || '');
    // Ref to track if we have already auto-sent OTP to prevent double sends in StrictMode
    const hasSentOtp = useRef(false);

    useEffect(() => {

        if (!email && !token) {
            navigate('/login');
            return;
        }

        if (email && !hasSentOtp.current && (!user || !user.isVerified)) {
            hasSentOtp.current = true;
            const sendOtpPromise = axios.post(`${API_URL}/api/auth/send-otp`, { email });
            toast.promise(sendOtpPromise, {
                loading: 'Sending OTP...',
                success: 'OTP sent to your email!',
                error: 'Failed to send OTP'
            });
        }
    }, [email, token, navigate, user]);

    const handleVerify = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Verifying OTP...');
        try {
            const res = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
            toast.dismiss(loadingToast);
            toast.success('Email verified successfully!');

            if (res.data.token) {
                const updatedUser = { ...user, isVerified: true };
                login(updatedUser, res.data.token);
            }
            navigate('/dashboard');
        } catch {
            toast.dismiss(loadingToast);
            toast.error('Verification failed');
        }
    };

    const handleResend = async () => {
        const loadingToast = toast.loading('Resending OTP...');
        try {
            await axios.post(`${API_URL}/api/auth/send-otp`, { email });
            toast.dismiss(loadingToast);
            toast.success('OTP sent successfully!');
        } catch {
            toast.dismiss(loadingToast);
            toast.error('Failed to send OTP');
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    const handleChange = (e) => {
        setOtp(e.target.value);
    };

    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--color-bg-main)',
        color: 'var(--color-text-main)',
    };

    const cardStyle = {
        backgroundColor: 'var(--color-bg-secondary)',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        margin: '20px 0',
        borderRadius: '4px',
        border: '1px solid #444',
        backgroundColor: '#222',
        color: '#fff',
        fontSize: '1.2rem',
        textAlign: 'center',
        letterSpacing: '5px'
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: 'var(--color-primary, #007bff)',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginBottom: '10px'
    };

    const skipButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        border: '1px solid #555',
        color: '#aaa'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2>Verify Your Email</h2>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px' }}>
                    Enter the code sent to {email}
                </p>

                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="000000"
                        required
                    />

                    <button type="submit" style={buttonStyle}>Verify</button>
                </form>

                <button onClick={handleSkip} style={skipButtonStyle}>Skip for now</button>

                <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                    Didn't receive code?{' '}
                    <button
                        onClick={handleResend}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary, #007bff)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Resend
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OtpVerification;
