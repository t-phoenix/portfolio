import type { ReactNode } from 'react';
import Atropos from 'atropos/react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  shadow?: boolean;
  highlight?: boolean;
  rotateXMax?: number;
  rotateYMax?: number;
  activeOffset?: number;
  shadowScale?: number;
}

const TiltCard = ({
  children,
  className = '',
  shadow = true,
  highlight = true,
  rotateXMax = 15,
  rotateYMax = 15,
  activeOffset = 50,
  shadowScale = 1.05,
}: TiltCardProps) => {
  return (
    <Atropos
      className={`atropos-wrapper ${className}`}
      shadow={shadow}
      highlight={highlight}
      rotateXMax={rotateXMax}
      rotateYMax={rotateYMax}
      activeOffset={activeOffset}
      shadowScale={shadowScale}
      onEnter={() => {}}
      onLeave={() => {}}
      onRotate={() => {}}
    >
      <div className="atropos-scale">
        <div className="atropos-rotate">
          <div className="atropos-inner">
            {children}
          </div>
        </div>
      </div>
    </Atropos>
  );
};

interface TiltCardLayerProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export const TiltCardLayer = ({ children, offset = 0, className = '' }: TiltCardLayerProps) => {
  return (
    <div data-atropos-offset={offset} className={className}>
      {children}
    </div>
  );
};

export default TiltCard;
