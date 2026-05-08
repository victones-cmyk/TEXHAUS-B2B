import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  discount_text: string | null;
  sort_order: number;
  active: boolean;
}

interface PaymentsModalProps {
  onClose: () => void;
}

export function AdminPaymentsModal({ onClose }: PaymentsModalProps) {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [active, setActive] = useState(true);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const data = await api<PaymentMethod[]>('/payment-methods?all=true');
      setMethods(data);
    } catch {
      toast('Erro ao carregar pagamentos', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchMethods(); }, []);

  const resetForm = () => {
    setName(''); setDescription(''); setIcon(''); setDiscountText('');
    setSortOrder('0'); setActive(true);
    setEditingId(null);
  };

  const startEdit = (m: PaymentMethod) => {
    setEditingId(m.id);
    setName(m.name);
    setDescription(m.description || '');
    setIcon(m.icon || '');
    setDiscountText(m.discount_text || '');
    setSortOrder(String(m.sort_order));
    setActive(m.active);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim(),
      discount_text: discountText.trim() || null,
      sort_order: parseInt(sortOrder) || 0,
      active,
    };

    if (!payload.name) { toast('Nome é obrigatório', 'error'); return; }

    try {
      if (editingId) {
        await api(`/payment-methods/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Pagamento atualizado!', 'success');
      } else {
        await api('/payment-methods', { method: 'POST', body: JSON.stringify(payload) });
        toast('Pagamento criado!', 'success');
      }
      resetForm();
      fetchMethods();
    } catch (err) {
      toast('Erro ao salvar: ' + (err instanceof Error ? err.message : ''), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta forma de pagamento?')) return;
    try {
      await api(`/payment-methods/${id}`, { method: 'DELETE' });
      setMethods(prev => prev.filter(m => m.id !== id));
      if (editingId === id) resetForm();
      toast('Pagamento excluído', 'info');
    } catch (err) {
      toast('Erro ao excluir: ' + (err instanceof Error ? err.message : ''), 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-panel-header">
          <h2>Formas de Pagamento</h2>
          <button className="modal-panel-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-panel-body">
          <form onSubmit={handleSave} style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-bg-light)', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group-compact">
                <label>Nome *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pix" required />
              </div>
              <div className="form-group-compact">
                <label>Descrição</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes da forma de pagamento" />
              </div>
              <div className="form-group-compact">
                <label>Ícone</label>
                <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="pix | credit-card | boleto" />
              </div>
              <div className="form-group-compact">
                <label>Texto de desconto</label>
                <input value={discountText} onChange={e => setDiscountText(e.target.value)} placeholder="Ex: 5% de desconto" />
              </div>
              <div className="form-group-compact">
                <label>Ordem</label>
                <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
              </div>
              <div className="form-group-compact" style={{ justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                  Ativo
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-save" style={{ flex: 1 }}>
                {editingId ? 'Atualizar Pagamento' : 'Adicionar Pagamento'}
              </button>
              {editingId && (
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancelar</button>
              )}
            </div>
          </form>

          <div className="table-container">
            <table className="admin-table" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Desconto</th>
                  <th>Ordem</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
                ) : methods.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum pagamento cadastrado.</td></tr>
                ) : (
                  methods.map(m => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.name}</strong>
                        {m.icon && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>({m.icon})</span>}
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.description || '—'}
                      </td>
                      <td>{m.discount_text || '—'}</td>
                      <td>{m.sort_order}</td>
                      <td>
                        <span className={`status-badge ${m.active ? 'approved' : 'rejected'}`}>
                          {m.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-approve" style={{ backgroundColor: '#007bff' }} onClick={() => startEdit(m)}>Editar</button>
                          <button className="btn-reject" onClick={() => handleDelete(m.id)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-panel-footer">
          <button className="btn-cancel" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
