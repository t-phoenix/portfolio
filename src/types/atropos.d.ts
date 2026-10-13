declare module 'atropos/css' {
  const content: string;
  export default content;
}

declare module 'atropos/react' {
  import { ComponentType, ReactNode } from 'react';
  
  interface AtroposProps {
    className?: string;
    children?: ReactNode;
    shadow?: boolean;
    highlight?: boolean;
    rotateXMax?: number;
    rotateYMax?: number;
    activeOffset?: number;
    shadowScale?: number;
    onEnter?: () => void;
    onLeave?: () => void;
    onRotate?: (x: number, y: number) => void;
  }
  
  const Atropos: ComponentType<AtroposProps>;
  export default Atropos;
}
