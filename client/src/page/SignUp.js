import React, { useState, useContext, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CREATE_USER } from '../queries';
import AuthContext from '../context/auth-context';
import Error from '../componets/Error';

const SignUpPage = () => {
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState("");
  const navigate = useNavigate();
  
  const authContext = useContext(AuthContext);

  const [createUser, { loading, data, error }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      setAlert('تم إنشاء الحساب بنجاح');
    },
    onError: (error) => {
      console.error('خطأ في التسجيل:', error);
      setAlert(error.message);
    }
  });
  useEffect(() => {
    if (!loading && data) {
      const { token, userId, username } = data.createUser;
      authContext.login(token, userId, username);
      navigate('/events');
    }
  }, [loading, data, authContext, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (password !== confirmPassword) {
      setAlert('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
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
      setAlert(err.message);
    }
  };

  return (
    <div className="main-content">
      <h1>تسجيل حساب جديد</h1>
      {error && <Error error={alert} />}
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

        {error && <p className="error">{error.message}</p>}
        {alert && <p className={error ? "error" : "success"}>{alert}</p>}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'جارٍ التسجيل...' : 'تسجيل'}
          </button>
        </div>
      </form>

      <button
        className="btn btn-secondary mt-3"
        onClick={() => navigate('/login')}
      >
        لديك حساب؟ تسجيل الدخول
      </button>
    </div>
  );
};

export default SignUpPage;
