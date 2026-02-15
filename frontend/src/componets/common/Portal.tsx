import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a div element if it doesn't exist
    if (!elementRef.current) {
      elementRef.current = document.createElement('div');
    }

    const el = elementRef.current;

    // Find or create the portal root
    let portalRoot = document.getElementById('portal-root');
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = 'portal-root';
      document.body.appendChild(portalRoot);
    }

    portalRoot.appendChild(el);

    return () => {
      if (el && portalRoot && portalRoot.contains(el)) {
        portalRoot.removeChild(el);
      }
    };
  }, []);

  if (!elementRef.current) {
    return null;
  }

  return createPortal(children, elementRef.current);
};