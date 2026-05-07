import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  customer_name: string;
  customer_email: string;
  customer_company: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'pending' },
  confirmed: { label: 'Confirmado', className: 'approved' },
  shipped: { label: 'Enviado', className: 'approved' },
  delivered: { label: 'Entregue', className: 'approved' },
  cancelled: { label: 'Cancelado', className: 'rejected' },
};

const statusActions: Record<string, { next: string; label: string; color: string }[]> = {
  pending: [
    { next: 'confirmed', label: 'Confirmar', color: '#28a745' },
    { next: 'cancelled', label: 'Cancelar', color: '#dc3545' },
  ],
  confirmed: [
    { next: 'shipped', label: 'Marcar como Enviado', color: '#007bff' },
    { next: 'cancelled', label: 'Cancelar', color: '#dc3545' },
  ],
  shipped: [
    { next: 'delivered', label: 'Marcar como Entregue', color: '#28a745' },
  ],
  delivered: [],
  cancelled: [],
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<string, OrderItem[]>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
  };

  const toggleExpand = async (orderId: string) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(orderId);

    if (!itemsMap[orderId]) {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (!error && data) {
        setItemsMap(prev => ({ ...prev, [orderId]: data }));
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
    } else {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;

  return (
    <>
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Pedidos</h2>
          <p>Gerencie os pedidos dos parceiros B2B.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {pendingCount > 0 && (
            <span className="status-badge pending" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
          {confirmedCount > 0 && (
            <span className="status-badge approved" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              {confirmedCount} confirmado{confirmedCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      <div className="admin-content">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Carregando pedidos...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum pedido encontrado.</td>
                </tr>
              ) : (
                orders.map(order => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  const actions = statusActions[order.status] || [];
                  const isExpanded = expandedId === order.id;

                  return (
                    <tr key={order.id}>
                      <td style={{ cursor: 'pointer' }} onClick={() => toggleExpand(order.id)}>
                        <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : '' }}>
                          ▶
                        </span>
                      </td>
                      <td><strong>#{order.id.slice(0, 8)}</strong></td>
                      <td>{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.customer_company || '—'}</td>
                      <td>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                      </td>
                      <td>
                        <span className={`status-badge ${config.className}`} style={{ fontSize: '0.8rem' }}>
                          {config.label}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ flexWrap: 'wrap', gap: '0.3rem' }}>
                          {actions.map(action => (
                            <button
                              key={action.next}
                              className="btn-approve"
                              style={{ backgroundColor: action.color, fontSize: '0.7rem', padding: '5px 10px', whiteSpace: 'nowrap' }}
                              onClick={() => handleStatusChange(order.id, action.next)}
                            >
                              {action.label}
                            </button>
                          ))}
                          {actions.length === 0 && <span className="action-done">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Expandable order items */}
        {expandedId && itemsMap[expandedId] && (
          <div style={{ marginTop: '1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table className="admin-table" style={{ minWidth: 'auto' }}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>SKU</th>
                  <th>Qtd</th>
                  <th>Preço Un.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {itemsMap[expandedId].map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.product_sku || '—'}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                    </td>
                    <td>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
