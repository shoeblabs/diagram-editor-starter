declare module 'react-konva-to-svg' {
  export function exportStageSVG(
    stage: any, 
    includeBackground: boolean, 
    options?: {
      onBefore?: ([stage, layer]: [any, any]) => void;
      onAfter?: ([stage, layer]: [any, any]) => void;
    }
  ): Promise<string>;
} 