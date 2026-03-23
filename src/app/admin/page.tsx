'use client';

import { useEffect, useState } from 'react';
import { PANode } from '@prisma/client';
import Link from 'next/link';

export default function AdminPage() {
  const [nodes, setNodes] = useState<PANode[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  const fetchNodes = async () => {
    const res = await fetch('/api/nodes');
    const data = await res.json();
    setNodes(data);
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, parentId: parentId || undefined }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Errore nella creazione');
      return;
    }

    setName('');
    setDescription('');
    setParentId('');
    fetchNodes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo nodo?')) return;
    await fetch(`/api/nodes/${id}`, { method: 'DELETE' });
    fetchNodes();
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-8">
        <h1>Amministrazione Nodi</h1>
        <Link href="/" className="btn btn-secondary">Torna alla Home</Link>
      </div>

      <div className="flex gap-6">
        <div className="card" style={{ flex: 1, height: 'fit-content' }}>
          <h2>Crea un nuovo Nodo</h2>
          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
          <form onSubmit={handleSubmit} className="flex-col gap-4">
            <div>
              <label>Nome Nodo</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label>Descrizione</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <label>Nodo Genitore</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)}>
                <option value="">Nessuno (Livello 1)</option>
                {nodes.filter(n => n.level < 5).map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} (Livello {n.level})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary mt-4">Salva</button>
          </form>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h2>Nodi Esistenti</h2>
          <ul className="flex-col gap-2" style={{ listStyle: 'none' }}>
            {nodes.map(node => (
              <li key={node.id} className="flex justify-between items-center" style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <strong>{node.name}</strong> <span className="text-sm text-gray">Liv. {node.level}</span>
                </div>
                <button onClick={() => handleDelete(node.id)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', color: 'red' }}>Elimina</button>
              </li>
            ))}
            {nodes.length === 0 && <p className="text-gray text-sm">Nessun nodo presente.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
