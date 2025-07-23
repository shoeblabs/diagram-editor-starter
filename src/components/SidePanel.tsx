import React, { useState } from 'react';
    import { useStore } from '../store';
    import { Button, TextField, Slider, Stack } from '@mui/material';
    import downloadSVG from 'react-konva-utils/lib/downloadSVG';

    const download = (uri: string, filename: string) => {
      const a = document.createElement('a');
      a.href = uri;
      a.download = filename;
      a.click();
    };

    interface Props {
      stageRef: React.RefObject<any>;
    }

    const ReplaceAllForm: React.FC<{ onReplace: (m: Record<string, string>) => void }> = ({ onReplace }) => {
      const [raw, setRaw] = useState('{
  "label1": "α",
  "label2": "β"
}');
      return (
        <Stack spacing={1}>
          <TextField
            label="Bulk replace (JSON)"
            multiline
            minRows={4}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => {
              try {
                const map = JSON.parse(raw);
                onReplace(map);
              } catch {
                alert('Invalid JSON');
              }
            }}
          >
            Replace
          </Button>
        </Stack>
      );
    };

    const SidePanel: React.FC<Props> = ({ stageRef }) => {
      const { selected, labels, addLabel, updateLabel, bulkReplace } = useStore();
      const label = labels.find((l) => l.id === selected);

      return (
        <div style={{ width: 320, padding: 16, borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Button variant="contained" fullWidth onClick={addLabel}>
            + Add Label
          </Button>

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

          <ReplaceAllForm onReplace={bulkReplace} />

          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              const uri = stageRef.current?.toDataURL({ pixelRatio: 3 });
              if (uri) download(uri, 'diagram.png');
            }}
          >
            Export PNG
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              if (stageRef.current) downloadSVG(stageRef.current, 'diagram.svg');
            }}
          >
            Export SVG
          </Button>
        </div>
      );
    };

    export default SidePanel;