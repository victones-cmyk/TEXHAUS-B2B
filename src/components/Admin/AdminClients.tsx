import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';
import type { Profile, UserRole } from '../../contexts/AuthContext';

type FilterType = 'all' | UserRole;

const roleLabel: Record<UserRole, string> = {
  b2b_pending: 'Pendente',
  b2b_approved: 'Aprovado',
  b2b_rejected: 'Rejeitado',
  admin: 'Administrador',
};

const roleBadge: Record<UserRole, string> = {
  b2b_pending: 'pending',
  b2b_approved: 'approved',
  b2b_rejected: 'rejected',
  admin: 'admin',
};

export function AdminClients() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await api<Profile[]>('/profiles');
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      toast('Erro ao carregar clientes', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleUpdateRole = async (id: string, role: UserRole) => {
    try {
      await api(`/profiles/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      setClients(prev => prev.map(c => c.id === id ? { ...c, role: role as UserRole } : c));
      toast(role === 'b2b_approved' ? 'Cliente aprovado!' : 'Cliente rejeitado.', role === 'b2b_approved' ? 'success' : 'info');
    } catch (err) {
      toast('Erro: ' + (err instanceof Error ? err.message : ''), 'error');
    }
  };

  const filtered = filter === 'all' ? clients : clients.filter(c => c.role === filter);

  const countAll = clients.length;
  const countPending = clients.filter(c => c.role === 'b2b_pending').length;
  const countApproved = clients.filter(c => c.role === 'b2b_approved').length;
  const countRejected = clients.filter(c => c.role === 'b2b_rejected').length;

  return (
    <>
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Clientes</h2>
          <p>Todos os parceiros B2B cadastrados.</p>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          className="btn-approve"
          style={{ background: filter === 'all' ? 'var(--color-primary)' : '#e0e0e0', color: filter === 'all' ? '#fff' : '#333', fontSize: '0.8rem', padding: '8px 16px' }}
        >
          Todos ({countAll})
        </button>
        <button
          onClick={() => setFilter('b2b_pending')}
          className="btn-approve"
          style={{ background: filter === 'b2b_pending' ? '#856404' : '#fff3cd', color: filter === 'b2b_pending' ? '#fff' : '#856404', fontSize: '0.8rem', padding: '8px 16px' }}
        >
          Pendentes ({countPending})
        </button>
        <button
          onClick={() => setFilter('b2b_approved')}
          className="btn-approve"
          style={{ background: filter === 'b2b_approved' ? '#155724' : '#d4edda', color: filter === 'b2b_approved' ? '#fff' : '#155724', fontSize: '0.8rem', padding: '8px 16px' }}
        >
          Aprovados ({countApproved})
        </button>
        <button
          onClick={() => setFilter('b2b_rejected')}
          className="btn-approve"
          style={{ background: filter === 'b2b_rejected' ? '#721c24' : '#f8d7da', color: filter === 'b2b_rejected' ? '#fff' : '#721c24', fontSize: '0.8rem', padding: '8px 16px' }}
        >
          Rejeitados ({countRejected})
        </button>
      </div>

      <div className="admin-content">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Empresa / Cliente</th>
                <th>CNPJ</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Cidade/UF</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Carregando clientes...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    {filter === 'all' ? 'Nenhum cliente cadastrado.' : `Nenhum cliente com status "${roleLabel[filter] || filter}".`}
                  </td>
                </tr>
              ) : (
                filtered.map(client => (
                  <tr key={client.id}>
                    <td>{new Date(client.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <strong>{client.company_name || '—'}</strong><br />
                      <small>{client.full_name}</small>
                    </td>
                    <td>{client.cnpj || '—'}</td>
                    <td>{client.email}</td>
                    <td>{client.phone || '—'}</td>
                    <td>{client.city || client.state ? `${client.city || ''}${client.city && client.state ? '/' : ''}${client.state || ''}` : '—'}</td>
                    <td>
                      <span className={`status-badge ${roleBadge[client.role] || 'pending'}`}>
                        {roleLabel[client.role] || client.role}
                      </span>
                    </td>
                    <td>
                      {client.role === 'b2b_pending' ? (
                        <div className="action-buttons">
                          <button className="btn-approve" onClick={() => handleUpdateRole(client.id, 'b2b_approved')}>Aprovar</button>
                          <button className="btn-reject" onClick={() => handleUpdateRole(client.id, 'b2b_rejected')}>Recusar</button>
                        </div>
                      ) : client.role === 'b2b_rejected' ? (
                        <button className="btn-approve" style={{ backgroundColor: '#28a745' }} onClick={() => handleUpdateRole(client.id, 'b2b_approved')}>
                          Reaprovar
                        </button>
                      ) : (
                        <div className="action-buttons">
                          <button className="btn-reject" onClick={() => handleUpdateRole(client.id, 'b2b_rejected')}>Revogar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
