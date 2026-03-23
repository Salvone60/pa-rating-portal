'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
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
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Errore durante la registrazione');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  if (success) {
    return (
      <div className="container p-6" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="card">
          <h1 style={{ color: 'var(--primary)' }}>Registrazione Completata!</h1>
          <p>Sei stato autenticato con successo. Verrai reindirizzato alla Home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h1 className="text-center">Crea un Account</h1>
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <label>Nome</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1 }}>
              <label>Cognome</label>
              <input name="surname" value={formData.surname} onChange={handleChange} required />
            </div>
          </div>
          
          <div>
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div>
            <label>Username</label>
            <input name="username" value={formData.username} onChange={handleChange} required />
          </div>
          
          <div>
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%', padding: '0.75rem' }}>
            Registrati
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray">
          Hai già un account? <Link href="/login" style={{ color: 'var(--primary)' }}>Accedi qui</Link>
        </p>
      </div>
    </div>
  );
}
