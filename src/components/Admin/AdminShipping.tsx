import { AdminShippingModal } from './AdminShippingModal';
import { useNavigate } from 'react-router-dom';

export function AdminShipping() {
  const navigate = useNavigate();
  return <AdminShippingModal onClose={() => navigate('/admin')} />;
}
