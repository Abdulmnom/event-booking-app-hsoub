import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CREATE_USER } from '../queries';

const SignUpPage = () => {
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      setAlert('تم إنشاء الحساب بنجاح');
      localStorage.setItem('token', data.createUser.token);
      localStorage.setItem('userId', data.createUser.userId);
      navigate('/events');
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAlert(null);

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    try {
      await createUser({
        variables: {
          userInput: {
            username,
            email,
            password,
          },
        },
      });
    } catch (err) {
      console.error('خطأ في التسجيل:', err);
      setError(err.message);
    }
  };

  return (
    <div className="main-content">
      <h1>تسجيل حساب جديد</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="name">الاسم</label>
          <input
            type="text"
            id="name"
            value={username}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="email">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}
        {alert && <p className="success">{alert}</p>}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'جارٍ التسجيل...' : 'تسجيل'}
          </button>
        </div>
      </form>

      <button
        className="btn btn-secondary"
        onClick={() => navigate('/login')}
        style={{ marginTop: '10px' }}
      >
        لديك حساب؟ تسجيل الدخول
      </button>
    </div>
  );
};

export default SignUpPage;
