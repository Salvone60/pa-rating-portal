'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PANode } from '@prisma/client';

type NodeWithChildren = PANode & { children?: NodeWithChildren[], reviews?: { rating: number }[] };

const getNodeAverage = (node: NodeWithChildren) => {
  if (!node.reviews || node.reviews.length === 0) return null;
  const sum = node.reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    avg: (sum / node.reviews.length).toFixed(1),
    count: node.reviews.length
  };
};

const getSubtreeAverage = (node: NodeWithChildren) => {
  const allRatings: number[] = [];
  
  const collectDescendantRatings = (n: NodeWithChildren) => {
    if (n.children) {
      n.children.forEach(child => {
        if (child.reviews) {
          child.reviews.forEach(r => allRatings.push(r.rating));
        }
        collectDescendantRatings(child);
      });
    }
  };
  
  collectDescendantRatings(node);
  
  if (allRatings.length === 0) return null;
  const sum = allRatings.reduce((acc, val) => acc + val, 0);
  return {
    avg: (sum / allRatings.length).toFixed(1),
    count: allRatings.length
  };
};

export default function Home() {
  const [nodes, setNodes] = useState<NodeWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (e) {
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  useEffect(() => {
    checkSession();
    fetch('/api/nodes')
      .then((res) => res.json())
      .then((data) => {
        // Build tree from flat list
        const nodeMap = new Map<string, NodeWithChildren>();
        const roots: NodeWithChildren[] = [];

        data.forEach((node: NodeWithChildren) => {
          node.children = [];
          nodeMap.set(node.id, node);
        });

        data.forEach((node: NodeWithChildren) => {
          if (node.parentId) {
            const parent = nodeMap.get(node.parentId);
            if (parent) {
              parent.children!.push(node);
            }
          } else {
            roots.push(node);
          }
        });

        setNodes(roots);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderTree = (nodesToRender: NodeWithChildren[]) => {
    if (nodesToRender.length === 0) return null;
    return (
      <ul style={{ paddingLeft: '80px', listStyleType: 'none', marginTop: '10px' }}>
        {nodesToRender.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedNodes.has(node.id);
          
          return (
            <li key={node.id} style={{ marginBottom: '10px' }}>
              <div className="card" style={{ padding: '15px' }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {hasChildren ? (
                      <button 
                        onClick={() => toggleNode(node.id)}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', 
                          fontSize: '1.2rem', color: 'var(--primary)', width: '20px',
                          display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}
                        aria-label={isExpanded ? "Comprimi" : "Espandi"}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    ) : (
                      <div style={{ width: '20px' }}></div>
                    )}
                    <div>
                      <h3 style={{ margin: 0 }}>
                        <Link href={`/node/${node.id}`}>{node.name}</Link>
                      </h3>
                      {node.description && <p className="text-sm text-gray">{node.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const nodeStats = getNodeAverage(node);
                      return nodeStats ? (
                        <div className="badge" style={{ background: '#f59e0b', color: '#fff' }}>
                          ★ Nodo: {nodeStats.avg} ({nodeStats.count} {nodeStats.count === 1 ? 'voto' : 'voti'})
                        </div>
                      ) : null;
                    })()}
                    {(() => {
                      const subStats = getSubtreeAverage(node);
                      return subStats ? (
                        <div className="badge" style={{ background: '#10b981', color: '#fff' }}>
                          ★ Sottolivelli: {subStats.avg} ({subStats.count} {subStats.count === 1 ? 'voto' : 'voti'})
                        </div>
                      ) : null;
                    })()}
                    <div className="badge">Livello {node.level}</div>
                  </div>
                </div>
              </div>
              {hasChildren && isExpanded && renderTree(node.children!)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-8">
        <h1>Portale PA Rating</h1>
        <div className="flex gap-4 items-center">
          {currentUser ? (
            <>
              <span className="text-sm">Ciao, <strong>{currentUser.name} {currentUser.surname}</strong>!</span>
              <button onClick={handleLogout} className="btn btn-secondary text-sm">Esci</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Accedi</Link>
              <Link href="/register" className="btn btn-primary">Registrati</Link>
            </>
          )}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 8px' }}></div>
          <Link href="/admin" className="btn btn-secondary" style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            Amministrazione
          </Link>
        </div>
      </div>
      
      {loading ? (
        <p>Caricamento struttura PA...</p>
      ) : nodes.length === 0 ? (
        <div className="card text-center p-6">
          <p>Nessun nodo presente nella PA.</p>
          <Link href="/admin" className="btn btn-secondary mt-4">Crea il primo nodo</Link>
        </div>
      ) : (
        renderTree(nodes)
      )}
    </div>
  );
}
