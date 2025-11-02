import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Las peticiones a /api/* serán proxy a http://localhost:8000/api/*
    axios.get('/api/users/')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lista de Usuarios</h1>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <strong>{user.username}</strong> - {user.email}
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;