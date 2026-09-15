import ProfilePanel from '../../components/common/ProfilePanel';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Profile() {
  useDocumentTitle('My profile');
  return <ProfilePanel />;
}
