/** Sidebar navigation, grouped per role. Order defines display order. */
import { ROLES } from '../../utils/constants';

export const NAV = {
  [ROLES.CITIZEN]: [
    { section: 'Overview' },
    { to: '/citizen/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { section: 'Complaints' },
    { to: '/citizen/submit', label: 'Report an Issue', icon: 'bi-plus-circle' },
    { to: '/citizen/complaints', label: 'My Complaints', icon: 'bi-card-list' },
    { section: 'Account' },
    { to: '/citizen/profile', label: 'My Profile', icon: 'bi-person' },
  ],
  [ROLES.OFFICER]: [
    { section: 'Overview' },
    { to: '/officer/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { section: 'Work' },
    { to: '/officer/complaints', label: 'Assigned Complaints', icon: 'bi-inboxes' },
    { section: 'Account' },
    { to: '/officer/profile', label: 'My Profile', icon: 'bi-person' },
  ],
  [ROLES.ADMIN]: [
    { section: 'Overview' },
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'bi-graph-up-arrow' },
    { section: 'Operations' },
    { to: '/admin/complaints', label: 'All Complaints', icon: 'bi-card-list' },
    { to: '/admin/reports', label: 'Reports', icon: 'bi-file-earmark-bar-graph' },
    { section: 'Administration' },
    { to: '/admin/departments', label: 'Departments', icon: 'bi-building' },
    { to: '/admin/officers', label: 'Officers', icon: 'bi-person-badge' },
    { to: '/admin/citizens', label: 'Citizens', icon: 'bi-people' },
    { section: 'System' },
    { to: '/admin/settings', label: 'Settings', icon: 'bi-gear' },
  ],
};
