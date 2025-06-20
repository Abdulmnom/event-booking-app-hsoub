
import './App.css';
import {BrowserRouter , Route , Routes , Navigate } from 'react-router-dom';
import LoginPage from './page/SignIn';
import SignUpPage from './page/SignUp';
import EventPage from './page/Event';
import BookingPage from './page/Booking';
import Navbar from './componets/Navbar';
import AuthContext from './context/auth-context';
import { useState } from 'react';
import ProfilePage from './page/Profile';
import PrivateRoute from './componets/PrivateRoute';

function App() {
  let [token , setToken] = useState(localStorage.getItem('token') || '');
  let [userId , setUserId] = useState(localStorage.getItem('userId') || '');
  let [username , setUsername] = useState(localStorage.getItem('username') || '');

  const login = (userToken, loginUserId, username) => {
    if(userToken) {
      setToken(userToken);
      localStorage.setItem('token',userToken);
    }

    if(loginUserId) {
      setUserId(loginUserId);
      localStorage.setItem('userId',loginUserId);
    }

    if(username) {
      setUsername(username);
      localStorage.setItem('username',username);
    }
    
  }

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUsername(null);

    // localStorage.removeItem('token');
    // localStorage.removeItem('userId');
    // localStorage.removeItem('username');

    // OR 

    localStorage.clear();
  }
  
  return (
    <BrowserRouter>
    {/* value  تمرير البيانات عبر كال التطبيق  */}
    <AuthContext.Provider  value={{ token, userId, username, login, logout }}>
      
         <Navbar />
        <Routes >
          {token && <Route path='/login' element={<Navigate replace to="/events" />} />}
          { token && <Route path='/signup' element={<Navigate replace to="/events" />} />}

            {!token && <Route path="/login" element={<LoginPage />} exact />}
            {!token && <Route path="/signup" element={<SignUpPage />} exact />}
            <Route path="/events" element={  <EventPage />} exact />
            <Route path="/bookings" element={<PrivateRoute><BookingPage /></PrivateRoute>} exact />
          
            <Route path="/" element={<Navigate replace to="/events" />} exact />
            <Route path="/profile" element={<ProfilePage />} exact />
            
        </Routes>
   
    </AuthContext.Provider>
   
     
    </BrowserRouter>
  );
}


export default App;
