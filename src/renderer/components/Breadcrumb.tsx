import React from 'react';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate }) => {
  const parts = path.split('/').filter(Boolean);
  const crumbs = [{ label: 'Device', path: '/' }];
  let cumulative = '';
  for (const part of parts) {
    cumulative += `/${part}`;
    crumbs.push({ label: part, path: cumulative });
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px',
      fontSize: 13, color: '#666', borderBottom: '1px solid #e8e8e8',
    }}>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.path}>
          {i > 0 && <span style={{ color: '#ccc' }}>/</span>}
          <button
            onClick={() => onNavigate(crumb.path)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
              borderRadius: 4, color: i === crumbs.length - 1 ? '#333' : '#007aff',
              fontWeight: i === crumbs.length - 1 ? 600 : 400, fontSize: 13,
            }}
          >
            {crumb.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
