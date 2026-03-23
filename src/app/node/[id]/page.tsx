'use client';

import { useEffect, useState } from 'react';
import { PANode, Review, User } from '@prisma/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type NodeWithReviews = PANode & {
  children: PANode[];
  parent: PANode | null;
  reviews: (Review & { user: User })[];
};

export default function NodePage() {
  const params = useParams();
  const id = params.id as string;

  const [node, setNode] = useState<NodeWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const fetchNode = async () => {
    try {
      const res = await fetch(`/api/nodes/${id}`);
      if (res.ok) {
        setNode(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (e) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNode();
      checkSession();
    }
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Devi effettuare l\'accesso per poter recensire.');
      return;
    }

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        comment,
        nodeId: id,
        userId: currentUser.id
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Errore nell\'inserimento della recensione');
      return;
    }

    setRating(5);
    setComment('');
    fetchNode();
  };

  if (loading) return <div className="container p-6">Caricamento...</div>;
  if (!node) return <div className="container p-6">Nodo non trovato</div>;

  const avgRating = node.reviews.length > 0 
    ? (node.reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / node.reviews.length).toFixed(1)
    : 'Nessun voto';

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/" className="text-sm text-gray mb-2 inline-block">← Torna alla Home</Link>
          <h1>{node.name}</h1>
          <div className="badge">Livello {node.level}</div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-col gap-6" style={{ flex: 2 }}>
          <div className="card">
            <h2>Dettagli</h2>
            {node.description ? <p>{node.description}</p> : <p className="text-gray">Nessuna descrizione.</p>}
            {node.parent && (
              <p className="mt-4 text-sm text-gray">
                Nodo Genitore: <Link href={`/node/${node.parent.id}`}>{node.parent.name}</Link>
              </p>
            )}
            {node.children && node.children.length > 0 && (
              <div className="mt-4">
                <strong>Sottonodi:</strong>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  {node.children.map((child: PANode) => (
                    <li key={child.id} style={{ marginBottom: '0.25rem' }}>
                      <Link href={`/node/${child.id}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{child.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2>Recensioni</h2>
              <div className="badge" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>
                ⭐ {avgRating} ({node.reviews.length} voti)
              </div>
            </div>

            {node.reviews.length === 0 ? (
              <p className="text-gray">Ancora nessuna recensione. Sii il primo a votare!</p>
            ) : (
              <div className="flex-col gap-4">
                {node.reviews.map((review: Review & { user: User }) => (
                  <div key={review.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <strong>{review.user?.name || 'Utente Anonimo'}</strong>
                      <span className="text-sm text-gray">{new Date(review.createdAt).toLocaleDateString()}</span>
                      <span className="badge" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                        ⭐ {review.rating}/5
                      </span>
                    </div>
                    {review.comment && <p>{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ flex: 1, height: 'fit-content' }}>
          <h2>Lascia un voto</h2>
          {currentUser ? (
            <>
              {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
              <form onSubmit={handleSubmitReview} className="flex-col gap-4">
                <div>
                  <label>Voto (1-5)</label>
                  <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                    <option value={5}>5 - Eccellente</option>
                    <option value={4}>4 - Molto Buono</option>
                    <option value={3}>3 - Buono</option>
                    <option value={2}>2 - Sufficiente</option>
                    <option value={1}>1 - Pessimo</option>
                  </select>
                </div>
                <div>
                  <label>Commento (opzionale)</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Scrivi la tua esperienza..." />
                </div>
                <button type="submit" className="btn btn-primary mt-4">Invia Recensione</button>
              </form>
            </>
          ) : (
            <div className="text-center p-4">
              <p className="mb-4">Per poter recensire i nodi della PA devi accedere con un account.</p>
              <div className="flex justify-center gap-4">
                <Link href="/login" className="btn btn-primary">Accedi</Link>
                <Link href="/register" className="btn btn-secondary">Registrati</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
