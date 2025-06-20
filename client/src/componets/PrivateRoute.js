import React from 'react'
import AuthContext from '../context/auth-context';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
     
    const value = React.useContext(AuthContext);
  return (!value.token ? <Navigate to="/login" /> : children);
  
}
