import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
     <nav className="navbar navbar-expand-md navbar-light main-navigation">
            <div className="container-fluid">
                <NavLink to="/events" className="navbar-brand">
                    <h1>مناسباتنا يا زينها</h1>
                </NavLink>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse main-navigation-items" id="navbarContent">
                    <ul className="navbar-nav me-auto">
                       
                       
                        <li className="nav-item">
                            <NavLink to='/events'>المناسبات</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to='/bookings'>حجوزاتي</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to='/login'>تسجيل الدخول</NavLink>
                        </li>
                    </ul>
                   
                </div>
            </div>
        </nav>
  );
}
