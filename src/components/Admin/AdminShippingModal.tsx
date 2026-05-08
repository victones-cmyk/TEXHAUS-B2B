import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  regions: string[];
  estimated_days: string;
  sort_order: number;
  active: boolean;
}

interface ShippingModalProps {
  onClose: () => void;
}

export function AdminShippingModal({ onClose }: ShippingModalProps) {
  const { toast } = useToast();
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [regions, setRegions] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [active, setActive] = useState(true);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const data = await api<ShippingMethod[]>('/shipping-methods?all=true');
      setMethods(data);
    } catch {
      toast('Erro ao carregar fretes', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchMethods(); }, []);

  const resetForm = () => {
    setName(''); setDescription(''); setPrice('0'); setRegions('');
    setEstimatedDays(''); setSortOrder('0'); setActive(true);
    setEditingId(null);
  };

  const startEdit = (m: ShippingMethod) => {
    setEditingId(m.id);
    setName(m.name);
    setDescription(m.description || '');
    setPrice(String(m.price));
    setRegions((m.regions || []).join(', '));
    setEstimatedDays(m.estimated_days || '');
    setSortOrder(String(m.sort_order));
    setActive(m.active);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      regions: regions.split(',').map(r => r.trim()).filter(Boolean),
      estimated_days: estimatedDays.trim(),
      sort_order: parseInt(sortOrder) || 0,
      active,
    };

    if (!payload.name) { toast('Nome é obrigatório', 'error'); return; }

    try {
      if (editingId) {
        await api(`/shipping-methods/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Frete atualizado!', 'success');
      } else {
        await api('/shipping-methods', { method: 'POST', body: JSON.stringify(payload) });
        toast('Frete criado!', 'success');
      }
      resetForm();
      fetchMethods();
    } catch (err) {
      toast('Erro ao salvar: ' + (err instanceof Error ? err.message : ''), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este frete?')) return;
    try {
      await api(`/shipping-methods/${id}`, { method: 'DELETE' });
      setMethods(prev => prev.filter(m => m.id !== id));
      if (editingId === id) resetForm();
      toast('Frete excluído', 'info');
    } catch (err) {
      toast('Erro ao excluir: ' + (err instanceof Error ? err.message : ''), 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-panel-header">
          <h2>Regras de Frete</h2>
          <button className="modal-panel-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-panel-body">
          <form onSubmit={handleSave} style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-bg-light)', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group-compact">
                <label>Nome *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Frete Fixo - Capital SP" required />
              </div>
              <div className="form-group-compact">
                <label>Descrição</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes do frete" />
              </div>
              <div className="form-group-compact">
                <label>Preço (R$)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="form-group-compact">
                <label>Prazo estimado</label>
                <input value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} placeholder="Ex: 3 a 7 dias úteis" />
              </div>
              <div className="form-group-compact">
                <label>Regiões (separadas por vírgula)</label>
                <input value={regions} onChange={e => setRegions(e.target.value)} placeholder="SP, RJ, MG" />
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
                {editingId ? 'Atualizar Frete' : 'Adicionar Frete'}
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
                  <th>Preço</th>
                  <th>Prazo</th>
                  <th>Regiões</th>
                  <th>Ordem</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
                ) : methods.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum frete cadastrado.</td></tr>
                ) : (
                  methods.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong></td>
                      <td>{m.price === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.price)}</td>
                      <td>{m.estimated_days || '—'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(m.regions || []).join(', ') || '—'}
                      </td>
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
