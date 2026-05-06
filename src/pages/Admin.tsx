import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface B2BUser {
  id: string;
  full_name: string;
  company_name: string;
  cnpj: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function Admin() {
  const [users, setUsers] = useState<B2BUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('b2b_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('b2b_registrations')
      .update({ status: 'approved' })
      .eq('id', id);

    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'approved' } : u));
    } else {
      alert('Erro ao aprovar: ' + error.message);
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('b2b_registrations')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'rejected' } : u));
    } else {
      alert('Erro ao rejeitar: ' + error.message);
    }
  };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          TEXHAUS<span>.</span> <span className="admin-badge">ADMIN</span>
        </div>
        <nav className="admin-nav">
          <a href="#" className="active">Aprovação B2B</a>
          <a href="#">Produtos</a>
          <a href="#">Pedidos</a>
          <a href="#">Configurações</a>
        </nav>
        <Link to="/" className="btn-logout-admin">
          ← Voltar para a Loja
        </Link>
      </aside>
      
      <main className="admin-main">
        <header className="admin-header">
          <h2>Gestão de Parceiros B2B</h2>
          <p>Aprove ou rejeite solicitações de acesso ao catálogo de preços.</p>
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
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados reais do Supabase...</td>
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
                        <span className={`status-badge ${user.status}`}>
                          {user.status === 'pending' ? 'Aguardando' : user.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                      </td>
                      <td>
                        {user.status === 'pending' && (
                          <div className="action-buttons">
                            <button className="btn-approve" onClick={() => handleApprove(user.id)}>Aprovar</button>
                            <button className="btn-reject" onClick={() => handleReject(user.id)}>Recusar</button>
                          </div>
                        )}
                        {user.status !== 'pending' && <span className="action-done">—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
