import { AdminPaymentsModal } from './AdminPaymentsModal';
import { useNavigate } from 'react-router-dom';

export function AdminPayments() {
  const navigate = useNavigate();
  return <AdminPaymentsModal onClose={() => navigate('/admin')} />;
}
