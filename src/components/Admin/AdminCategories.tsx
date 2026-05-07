import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api<Category[]>('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const rootCategories = categories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    const payload = { name: name.trim(), slug: slug.trim().toLowerCase().replace(/\s+/g, '-'), parent_id: parentId || null };

    try {
      if (editingId) {
        await api(`/categories/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Categoria atualizada!', 'success');
      } else {
        await api('/categories', { method: 'POST', body: JSON.stringify(payload) });
        toast('Categoria criada!', 'success');
      }
      setName(''); setSlug(''); setParentId(''); setEditingId(null);
      fetchCategories();
    } catch { toast('Erro ao salvar categoria', 'error'); }
  };

  const handleEdit = (cat: Category) => {
    setName(cat.name); setSlug(cat.slug); setParentId(cat.parent_id || ''); setEditingId(cat.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta categoria?')) return;
    const children = getChildren(id);
    if (children.length > 0) {
      toast('Exclua as subcategorias primeiro.', 'error');
      return;
    }
    try {
      await api(`/categories/${id}`, { method: 'DELETE' });
      toast('Categoria excluída.', 'info');
      fetchCategories();
    } catch {
      toast('Erro ao excluir.', 'error');
    }
  };

  return (
    <>
      <header className="admin-header">
        <h2>Categorias</h2>
        <p>Gerencie as categorias e subcategorias dos produtos.</p>
      </header>

      <div className="admin-content">
        <div className="table-container" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Nome</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Slug</label>
              <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} placeholder="ex: tecidos" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Subcategoria de</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: '#fff' }}>
                <option value="">(Categoria raiz)</option>
                {rootCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-approve" style={{ padding: '8px 20px' }}>
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            {editingId && <button type="button" className="btn-reject" style={{ padding: '8px 20px' }} onClick={() => { setName(''); setSlug(''); setParentId(''); setEditingId(null); }}>Cancelar</button>}
          </form>

          {loading ? <p>Carregando...</p> : (
            <table className="admin-table" style={{ minWidth: 'auto' }}>
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Categoria</th>
                  <th>Slug</th>
                  <th>Subcategorias</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rootCategories.map(cat => (
                  <CategoryRow key={cat.id} cat={cat} children={getChildren(cat.id)} onEdit={handleEdit} onDelete={handleDelete} depth={0} />
                ))}
                {rootCategories.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Nenhuma categoria. Adicione acima.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function CategoryRow({ cat, children, onEdit, onDelete, depth }: { cat: Category; children: Category[]; onEdit: (c: Category) => void; onDelete: (id: string) => void; depth: number }) {
  return (
    <>
      <tr>
        <td>{cat.sort_order}</td>
        <td><strong style={{ marginLeft: `${depth * 1.5}rem` }}>{cat.name}</strong></td>
        <td style={{ color: '#999', fontSize: '0.85rem' }}>{cat.slug}</td>
        <td>{children.length > 0 ? `${children.length} subcategorias` : '—'}</td>
        <td>
          <div className="action-buttons">
            <button className="btn-approve" style={{ backgroundColor: '#007bff', fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => onEdit(cat)}>Editar</button>
            <button className="btn-reject" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => onDelete(cat.id)}>Excluir</button>
          </div>
        </td>
      </tr>
      {children.map(child => (
        <CategoryRow key={child.id} cat={child} children={[]} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
      ))}
    </>
  );
}
