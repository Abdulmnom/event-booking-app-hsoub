import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../context/auth-context";

export default function Navbar() {
    const auth = useContext(AuthContext);

    return (
        <nav className="navbar navbar-expand-md navbar-light main-navigation">
            <div className="container-fluid">
                <NavLink to="/events" className="navbar-brand">
                    <h1>مناسباتنا يا زينها</h1>
                </NavLink>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent" 
                    aria-controls="navbarContent"
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse main-navigation-items" id="navbarContent">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink to='/events' className={({ isActive }) => 
                                isActive ? "nav-link active" : "nav-link"
                            }>
                                المناسبات
                            </NavLink>
                        </li>
                        
                        {auth.token && (
                            <li className="nav-item">
                                <NavLink to='/bookings' className={({ isActive }) => 
                                    isActive ? "nav-link active" : "nav-link"
                                }>
                                    حجوزاتي
                                </NavLink>
                            </li>
                        )}
                        
                        {!auth.token && (
                            <li className="nav-item">
                                <NavLink to='/login' className={({ isActive }) => 
                                    isActive ? "nav-link active" : "nav-link"
                                }>
                                    تسجيل الدخول
                                </NavLink>
                            </li>
                        )}
                    </ul>
                    
                    {auth.token && (
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <NavLink to='#' className="nav-link">
                                    {auth.username}
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className="btn btn-link nav-link" 
                                    onClick={() => auth.logout()}
                                >
                                    تسجيل الخروج
                                </button>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
}
