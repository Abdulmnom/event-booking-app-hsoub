import React from 'react'
import AuthContext from '../context/auth-context';

export default function ProfilePage() {
    const authContext = React.useContext(AuthContext);
  return (
    <div className=' main-content text-center mt-4 pt-2'>
        <h1>صفحتك الشخصية</h1> <br/>
        <p>مرحبا بك يا  {authContext.username}</p>
        <p>{"لا تزال الصفحة قيد الانشاء استمتع بمزايا التطبيق"}</p>
        
      
    </div>
  )
}
