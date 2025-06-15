import React, { useState , useContext , useEffect } from 'react';
import { useMutation } from '@apollo/client';
import {  useNavigate } from 'react-router-dom';
import { LOGIN } from '../queries';
import AuthContext from '../context/auth-context';


const LoginPage = () => {

    const value = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    const [login, { loading, error , data}] = useMutation(LOGIN, {
        onCompleted: (data) => {
            
            navigate('/events');
        },
        onError: (error) => {
            console.error('Login error:', error);
        }
    });
    
    useEffect(() => {
        if(!loading && data) {
            const token = data.login.token;
            const userId = data.login.userId;
            const username = data.login.username;
            value.login(token, userId, username);
        }
    }, [loading, data  , value]);

    if (loading) return <p className="loading">جار التحميل...</p>;
    if (error) return <p className="error">حدث خطأ: {error.message}</p>;
  

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({
                variables: { email, password }
            });
        } catch (err) {
            console.error('Login submission error:', err);
        }
    };

    return (
        <div className="main-content">
            <h1>تسجيل الدخول</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-control">
                    <label htmlFor="email">البريد الإلكتروني</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="password">كلمة المرور</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-actions">
                    <button type="submit">تسجيل الدخول</button>
                </div>
                   <button className="btn btn-secondary" onClick={() => navigate('/signup')}>
                  ليس لديك حساب؟ سجل الآن
                  </button>
            </form>
          
        </div>
    );
};

export default LoginPage;