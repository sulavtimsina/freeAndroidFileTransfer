import React, { useState } from 'react';

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
}

interface SidebarProps {
  tree: TreeNode | null;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const TreeItem: React.FC<{
  node: TreeNode;
  depth: number;
  currentPath: string;
  onNavigate: (path: string) => void;
}> = ({ node, depth, currentPath, onNavigate }) => {
  const [expanded, setExpanded] = useState(
    currentPath === node.path || currentPath.startsWith(node.path + '/')
  );
  const isActive = currentPath === node.path;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        onClick={() => { onNavigate(node.path); setExpanded(!expanded); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 8px', paddingLeft: 8 + depth * 16,
          cursor: 'pointer', fontSize: 13, borderRadius: 4,
          background: isActive ? '#007aff15' : 'transparent',
          color: isActive ? '#007aff' : '#333',
          fontWeight: isActive ? 600 : 400,
        }}
      >
        <span style={{ width: 16, textAlign: 'center', fontSize: 10, color: '#999' }}>
          {hasChildren ? (expanded ? '▼' : '▶') : ''}
        </span>
        <span>📁</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeItem key={child.path} node={child} depth={depth + 1} currentPath={currentPath} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ tree, currentPath, onNavigate }) => {
  if (!tree) return <div style={{ padding: 16, color: '#999' }}>No device</div>;

  return (
    <div style={{
      width: 220, minWidth: 180, borderRight: '1px solid #e8e8e8',
      padding: '8px 0', overflowY: 'auto', background: '#f8f8f8',
    }}>
      <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>
        Folders
      </div>
      <TreeItem node={tree} depth={0} currentPath={currentPath} onNavigate={onNavigate} />
    </div>
  );
};
