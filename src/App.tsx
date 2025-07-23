import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KImage, Text } from 'react-konva';
import { useDropzone } from 'react-dropzone';
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
  const { bgSrc, setBg, labels, selected, select, updateLabel } = useStore();
  const [bgImg] = useImage(bgSrc);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      const url = URL.createObjectURL(files[0]);
      setBg(url);
    },
  });

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Canvas */}
      <div style={{ flexGrow: 1, position: 'relative' }} {...getRootProps()}>
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