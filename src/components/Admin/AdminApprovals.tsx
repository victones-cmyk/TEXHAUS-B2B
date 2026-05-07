import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Profile } from '../../contexts/AuthContext';

export function AdminApprovals() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshProfile } = useAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api<Profile[]>('/profiles');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api(`/profiles/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: 'b2b_approved' }),
      });
      setUsers(users.map(u => u.id === id ? { ...u, role: 'b2b_approved' } : u));
      refreshProfile();
      toast('Parceiro aprovado com sucesso!', 'success');
    } catch (err) {
      toast('Erro ao aprovar: ' + (err instanceof Error ? err.message : ''), 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api(`/profiles/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: 'b2b_rejected' }),
      });
      setUsers(users.map(u => u.id === id ? { ...u, role: 'b2b_rejected' } : u));
      refreshProfile();
      toast('Parceiro rejeitado.', 'info');
    } catch (err) {
      toast('Erro ao rejeitar: ' + (err instanceof Error ? err.message : ''), 'error');
    }
  };

  const pendingCount = users.filter(u => u.role === 'b2b_pending').length;

  return (
    <>
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Gestão de Parceiros B2B</h2>
          <p>Aprove ou rejeite solicitações de acesso ao catálogo de preços.</p>
        </div>
        {pendingCount > 0 && (
          <span className="status-badge pending" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </header>

      <div className="admin-content">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Empresa / Cliente</th>
                <th>CNPJ</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum cadastro encontrado.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <strong>{user.company_name}</strong><br/>
                      <small>{user.full_name}</small>
                    </td>
                    <td>{user.cnpj}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.role === 'b2b_pending' ? 'pending' : user.role === 'b2b_approved' ? 'approved' : 'rejected'}`}>
                        {user.role === 'b2b_pending' ? 'Aguardando' : user.role === 'b2b_approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </td>
                    <td>
                      {user.role === 'b2b_pending' && (
                        <div className="action-buttons">
                          <button className="btn-approve" onClick={() => handleApprove(user.id)}>Aprovar</button>
                          <button className="btn-reject" onClick={() => handleReject(user.id)}>Recusar</button>
                        </div>
                      )}
                      {user.role !== 'b2b_pending' && <span className="action-done">—</span>}
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
