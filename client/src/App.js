
import './App.css';
import {BrowserRouter , Route , Routes , Navigate } from 'react-router-dom';
import LoginPage from './page/SignIn';
import SignUpPage from './page/SignUp';
import EventPage from './page/Event';
import BookingPage from './page/Booking';
import Navbar from './componets/Navbar';

function App() {
  return (
    <BrowserRouter>
    <div className='main-content'>
         <Navbar />
        <Routes >
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/events" element={  <EventPage />} />
            <Route path="/bookings" element={<BookingPage />} />
            <Route path="/" element={<Navigate replace to="/events" />} />
        </Routes>
    </div>
     
    </BrowserRouter>
  );
}

export default App;
