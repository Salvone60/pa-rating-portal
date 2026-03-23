'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Errore durante il login');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  if (success) {
    return (
      <div className="container p-6" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card">
          <h1 style={{ color: 'var(--primary)' }}>Accesso Effettuato!</h1>
          <p>Verrai reindirizzato alla Home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6" style={{ maxWidth: '500px' }}>
      <div className="card">
        <h1 className="text-center">Accedi</h1>
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div>
            <label>Username</label>
            <input name="username" value={formData.username} onChange={handleChange} required />
          </div>
          
          <div>
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%', padding: '0.75rem' }}>
            Accedi
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray">
          Non hai ancora un account? <Link href="/register" style={{ color: 'var(--primary)' }}>Registrati qui</Link>
        </p>
      </div>
    </div>
  );
}
