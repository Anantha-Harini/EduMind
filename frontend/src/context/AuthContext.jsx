import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const id = localStorage.getItem('userId');
    const fullName = localStorage.getItem('fullName');
    
    if (token && role && email) {
      setUser({ token, role, email, id: id ? parseInt(id) : null, fullName: fullName || email.split('@')[0] });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      
      // Parse JWT payload (naive approach for demo)
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      
      const loggedUser = {
        token: data.access_token,
        role: payload.role,
        email: payload.sub,
        id: payload.id || payload.user_id || null,
        fullName: payload.full_name || payload.name || payload.sub.split('@')[0]
      };

      localStorage.setItem('token', loggedUser.token);
      localStorage.setItem('role', loggedUser.role);
      localStorage.setItem('email', loggedUser.email);
      if (loggedUser.id) localStorage.setItem('userId', loggedUser.id);
      localStorage.setItem('fullName', loggedUser.fullName);
      
      setUser(loggedUser);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
