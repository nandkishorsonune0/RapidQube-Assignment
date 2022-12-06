import './App.css';
import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import {useState,useEffect} from 'react';
import Register from "./Register";
import UserContext from "./UserContext";
import axios from "axios";
import Login from "./Login";
import Home from "./Home";

function App() {
  const [email,setEmail] = useState('');

  useEffect(() => {
    axios.get('localhost:4000/user', {withCredentials:true})
      .then(response => {
        
        setEmail(response.data.email);
      });
  }, []);

  function logout() {
    axios.post('localhost:4000/logout', {}, {withCredentials:true})
      .then(() => setEmail(''));
  }

  return (
    <UserContext.Provider value={{email,setEmail}}>
      <BrowserRouter>
        <nav>
          <Link to={'/'}>Home</Link>
          {!email && (
            <>
              <Link to={'/login'}>Login</Link>
              <Link to={'/register'}>Register</Link>
            </>
          )}
          {!!email && (
            <a onClick={e => {e.preventDefault();logout();}}>Logout</a>
          )}
        </nav>
        <main>
          <Routes>
            <Route exact path={'/'} element={<Home/>} />
            <Route exact path={'/register'} element={<Register/>} />
            <Route exact path={'/login'} element={<Login/>} />
          </Routes>
        </main>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
