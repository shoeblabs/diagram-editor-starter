import EditIcon from '@mui/icons-material/Edit';
import { Button, IconButton, List, ListItem, ListItemText, Slider, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';
import { exportStageSVG } from 'react-konva-to-svg';
import { useStore } from '../store';

const download = (uri: string, filename: string) => {
  const a = document.createElement('a');
  a.href = uri;
  a.download = filename;
  a.click();
};

// Convert image to base64 data URL
const imageToDataURL = (img: HTMLImageElement): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx?.drawImage(img, 0, 0);
    resolve(canvas.toDataURL('image/png'));
  });
};

// Custom SVG export with background image

interface Props {
  stageRef: React.RefObject<any>;
}

const SidePanel: React.FC<Props> = ({ stageRef }) => {
  const { selected, labels, addLabel, updateLabel, bgSrc } = useStore();
  const label = labels.find((l) => l.id === selected);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditClick = (labelId: string, currentText: string) => {
    setEditingLabel(labelId);
    setEditText(currentText);
  };

  const handleSaveEdit = () => {
    if (editingLabel && editText.trim()) {
      updateLabel(editingLabel, { text: editText.trim() });
      setEditingLabel(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingLabel(null);
    setEditText('');
  };

  const exportSVGWithBackground = async (bgSrc: string | null): Promise<string | null> => {
    if (!stageRef.current) return null;
  
    try {
      let modifiedStageSVG: string;
  
      if (bgSrc) {
        // Create a temporary image to convert blob URL to base64
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = bgSrc;
        });
  
        // Convert to base64 data URL
        const dataURL = await imageToDataURL(img);
        
        // Temporarily replace the blob URL with base64 data URL in the Konva image
        const layer = stageRef.current.findOne('Layer');
        const konvaImage = layer?.findOne('Image');
        
        if (konvaImage) {
          const originalSrc = konvaImage.image().src;
          konvaImage.image().src = dataURL;
  
          
          // Export with the data URL
          modifiedStageSVG = await exportStageSVG(stageRef.current, true);
          
          // Restore original src
          konvaImage.image().src = originalSrc;
        } else {
          modifiedStageSVG = await exportStageSVG(stageRef.current, false);
        }
      } else {
        modifiedStageSVG = await exportStageSVG(stageRef.current, false);
      }
  
      return modifiedStageSVG;
    } catch (error) {
      console.error('Error in custom SVG export:', error);
      return null;
    }
  };

  return (
    <div style={{ width: 320, padding: 16, borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Button variant="contained" fullWidth onClick={addLabel}>
        + Add Label
      </Button>

      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Labels</h3>
        <List dense style={{ padding: 0 }}>
          {labels.map((l) => (
            <ListItem
              key={l.id}
              style={{
                padding: '8px 0',
                backgroundColor: selected === l.id ? '#f3f4f6' : 'transparent',
                borderRadius: '4px',
                marginBottom: '4px'
              }}
            >
              {editingLabel === l.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <TextField
                    size="small"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button size="small" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button size="small" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <ListItemText
                    primary={l.text || 'Untitled Label'}
                    secondary={`Font size: ${l.fontSize}px`}
                    style={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(l.id, l.text)}
                    style={{ marginLeft: '8px' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </ListItem>
          ))}
        </List>
        {labels.length === 0 && (
          <p style={{ fontStyle: 'italic', color: '#6b7280', margin: '8px 0' }}>
            No labels yet. Click "Add Label" to create one.
          </p>
        )}
      </div>

      {label ? (
        <Stack spacing={2}>
          <TextField
            label="Text"
            value={label.text}
            onChange={(e) => updateLabel(label.id, { text: e.target.value })}
            fullWidth
          />
          <Slider
            value={label.fontSize}
            min={8}
            max={72}
            onChange={(_, v) => updateLabel(label.id, { fontSize: v as number })}
          />
        </Stack>
      ) : (
        <p style={{ fontStyle: 'italic' }}>Select a label to edit it.</p>
      )}

      <Button
        variant="outlined"
        fullWidth
        onClick={() => {
          try {
            if (stageRef.current) {
              const uri = stageRef.current.toDataURL({
                pixelRatio: 2,
                mimeType: 'image/png',
                quality: 1,
                width: stageRef.current.width(),
                height: stageRef.current.height()
              });
              if (uri) {
                download(uri, 'diagram.png');
              } else {
                console.error('Failed to generate PNG data URL');
                alert('Failed to export PNG. Please try again.');
              }
            } else {
              console.error('Stage reference is not available');
              alert('Stage reference is not available. Please try again.');
            }
          } catch (error) {
            console.error('Error exporting PNG:', error);
            alert('Error exporting PNG. Please try again.');
          }
        }}
      >
        Export PNG
      </Button>

      <Button
        variant="outlined"
        fullWidth
        onClick={async () => {
          try {
            if (stageRef.current) {
              const svgString = await exportSVGWithBackground(bgSrc);
              if (svgString) {
                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                download(url, 'diagram.svg');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              } else {
                console.error('Failed to generate SVG');
                alert('Failed to export SVG. Please try again.');
              }
            } else {
              console.error('Stage reference is not available');
              alert('Stage reference is not available. Please try again.');
            }
          } catch (error) {
            console.error('Error exporting SVG:', error);
            alert('Error exporting SVG. Please try again.');
          }
        }}
      >
        Export SVG
      </Button>
    </div>
  );
};

export default SidePanel;