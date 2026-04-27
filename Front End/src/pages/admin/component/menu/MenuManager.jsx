import React, { useState, useEffect, useRef } from 'react';
import { Tree } from 'react-arborist';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import { MdEdit, MdDelete, MdAdd, MdSave, MdDragIndicator } from 'react-icons/md';
import { getMenu, updateMenu } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import './MenuManager.css';

const MenuManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', url: '' });
  
  const treeRef = useRef(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await getMenu();
      setData(res || []);
    } catch (error) {
      console.error('Failed to load menu:', error);
      Alert.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newData) => {
    setLoading(true);
    try {
      await updateMenu(newData || data);
      Alert.success('Menu updated successfully');
      if (newData) setData(newData);
    } catch (error) {
      Alert.error('Failed to save menu');
    } finally {
      setLoading(false);
    }
  };

  const onMove = ({ dragIds, parentId, index }) => {
    const dragId = dragIds[0];
    let nodeToMove = null;
    let newTree = JSON.parse(JSON.stringify(data)); // deep clone

    // 1. Remove node from old location
    const removeNode = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === dragId) {
          nodeToMove = nodes.splice(i, 1)[0];
          return true;
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
          if (removeNode(nodes[i].children)) return true;
        }
      }
      return false;
    };
    removeNode(newTree);

    if (!nodeToMove) return;

    // 2. Insert node at new location
    if (parentId === null) {
      // Move to root
      newTree.splice(index, 0, nodeToMove);
    } else {
      const insertNode = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === parentId) {
            nodes[i].children = nodes[i].children || [];
            nodes[i].children.splice(index, 0, nodeToMove);
            return true;
          }
          if (nodes[i].children && nodes[i].children.length > 0) {
            if (insertNode(nodes[i].children)) return true;
          }
        }
        return false;
      };
      insertNode(newTree);
    }
    
    setData(newTree);
  };

  const handleOpenDialog = (nodeData = null) => {
    if (nodeData) {
      setEditItem(nodeData);
      setFormData({ title: nodeData.title, url: nodeData.url });
    } else {
      setEditItem(null);
      setFormData({ title: '', url: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
  };

  const handleFormSubmit = () => {
    if (!formData.title) {
      Alert.error('Title is required');
      return;
    }

    if (editItem) {
      // Update existing item
      const updateNode = (nodes) => {
        return nodes.map(node => {
          if (node.id === editItem.id) {
            return { ...node, title: formData.title, url: formData.url };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      setData(updateNode(data));
    } else {
      // Add new root item
      const newItem = {
        id: Date.now().toString(),
        title: formData.title,
        url: formData.url || '#',
        children: []
      };
      setData([...data, newItem]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item and all its children?')) return;
    
    const deleteNode = (nodes) => {
      return nodes.filter(node => {
        if (node.id === id) return false;
        if (node.children) {
          node.children = deleteNode(node.children);
        }
        return true;
      });
    };
    
    setData(deleteNode([...data]));
  };

  // Custom Node Renderer for React-Arborist
  const Node = ({ node, style, dragHandle }) => {
    return (
      <div style={style} className={`tree-node ${node.state.isSelected ? 'selected' : ''}`}>
        <div className="node-content" ref={dragHandle}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
            <MdDragIndicator style={{ cursor: 'grab', color: '#94a3b8', marginRight: '8px' }} />
            
            {node.children && node.children.length > 0 && (
              <Box 
                onClick={() => node.toggle()} 
                sx={{ mr: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {node.isOpen ? '▼' : '▶'}
              </Box>
            )}
            {!node.children || node.children.length === 0 ? <Box sx={{ width: '20px', mr: 1 }} /> : null}

            <Typography variant="body1" sx={{ fontWeight: 500, flexGrow: 1 }}>
              {node.data.title}
              <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                {node.data.url}
              </Typography>
            </Typography>

            <Box className="node-actions" sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(node.data); }}>
                <MdEdit size={16} />
              </IconButton>
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(node.data.id); }}>
                <MdDelete size={16} />
              </IconButton>
            </Box>
          </Box>
        </div>
      </div>
    );
  };

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2,
        mb: 4
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-text, #1e293b)' }}>
            Menu Manager
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Drag and drop to reorder menu items or nest them as submenus.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <Button 
            variant="outlined" 
            startIcon={<MdAdd />} 
            onClick={() => handleOpenDialog()}
            disabled={loading}
            sx={{ flex: { xs: 1, md: 'none' } }}
          >
            Add Item
          </Button>
          <Button 
            variant="contained" 
            startIcon={<MdSave />} 
            onClick={() => handleSave(data)}
            disabled={loading}
            sx={{ 
              bgcolor: 'var(--color-primary, #4f46e5)', 
              '&:hover': { bgcolor: 'var(--color-primary-hover, #4338ca)' },
              flex: { xs: 1, md: 'none' }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: '12px',
          bgcolor: 'var(--color-primary-ultra-light, #f8fafc)',
          p: 2,
          minHeight: '400px'
        }}
      >
        <Tree
          ref={treeRef}
          data={data}
          openByDefault={true}
          width="100%"
          height={600}
          indent={30}
          rowHeight={48}
          paddingTop={10}
          paddingBottom={10}
          onMove={onMove}
        >
          {Node}
        </Tree>
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Menu Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Home, Men, Women"
              required
            />
            <TextField
              label="Page URL"
              fullWidth
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="e.g. /products, /productMen"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" sx={{ bgcolor: 'var(--color-primary, #4f46e5)', '&:hover': { bgcolor: 'var(--color-primary-hover, #4338ca)' } }}>
            {editItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuManager;
