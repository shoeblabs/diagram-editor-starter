import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as KImage, Layer, Stage, Text } from 'react-konva';
import SidePanel from './components/SidePanel';
import { useStore } from './store';

function useImage(src: string | null): [HTMLImageElement | null] {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const i = new Image();
    i.src = src;
    i.onload = () => setImg(i);
  }, [src]);
  return [img];
}

const App: React.FC = () => {
  const stageRef = useRef<any>(null);
  const { bgSrc, setBg, removeBg, labels, selected, select, updateLabel } = useStore();
  const [bgImg] = useImage(bgSrc);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      const url = URL.createObjectURL(files[0]);
      setBg(url);
    },
    disabled: !!bgSrc, // Disable dropzone when image is already present
  });

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Canvas */}
      <div style={{ flexGrow: 1, position: 'relative' }} {...(bgSrc ? {} : getRootProps())}>
        <input {...getInputProps()} />
        <Stage
          ref={stageRef}
          width={window.innerWidth - 320}
          height={window.innerHeight}
          onMouseDown={(e) => {
            if (!(e.target as any)?.attrs?.isLabel) select(null);
          }}
        >
          <Layer>
            {bgImg && <KImage image={bgImg} />}
            {labels.map((l) => (
              <Text
                key={l.id}
                {...l}
                draggable
                isLabel
                onClick={() => select(l.id)}
                onDragEnd={(e) => updateLabel(l.id, { x: e.target.x(), y: e.target.y() })}
              />
            ))}
          </Layer>
        </Stage>

        {!bgSrc && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            margin: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            <div style={{
              textAlign: 'center',
              color: '#64748b',
              fontSize: '18px',
              fontWeight: '500',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <ImageIcon style={{ fontSize: '48px', color: '#64748b' }} />
              </div>
              <div>Click or drag & drop to add image</div>
              <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                Supports: JPG, PNG, GIF, WebP
              </div>
            </div>
          </div>
        )}

        {bgSrc && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
          }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={removeBg}
              size="small"
            >
              Remove Image
            </Button>
          </div>
        )}

        {isDragActive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            color: 'white',
            fontSize: 24,
            zIndex: 10,
          }}>
            Drop image here…
          </div>
        )}
      </div>

      {/* Side panel */}
      <SidePanel stageRef={stageRef} />
    </div>
  );
};

export default App;