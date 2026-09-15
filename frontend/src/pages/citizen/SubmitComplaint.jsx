import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatTicket } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function SubmitComplaint() {
  useDocumentTitle('Report an issue');
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      const created = await api.complaints.create(form);
      toast.success(`Complaint ${formatTicket(created.id, created.createdAt)} submitted successfully.`);
      navigate(`/citizen/complaints/${created.id}`);
    } catch (err) {
      toast.error(err.message || 'Could not submit your complaint. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <PageHeader
        eyebrow="New complaint"
        title="Report a civic issue"
        subtitle="Give us the details and we’ll route it to the right department automatically."
      />
      <div className="alert d-flex gap-2 align-items-center" style={{ background: 'var(--cp-surface-2)', border: '1px solid var(--cp-border)' }}>
        <i className="bi bi-info-circle-fill text-primary fs-5" />
        <small className="mb-0">Clear photos and an accurate location help officers resolve issues faster. Your contact details are taken from your profile.</small>
      </div>
      <div className="card card-body p-4">
        <ComplaintForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
