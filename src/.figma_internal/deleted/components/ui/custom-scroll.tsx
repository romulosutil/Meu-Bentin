import React from 'react';
import { cn } from './utils';

interface CustomScrollProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  showScrollbar?: boolean;
  fadeEdges?: boolean;
}

export function CustomScroll({
  children,
  className,
  maxHeight = "400px",
  showScrollbar = true,
  fadeEdges = false
}: CustomScrollProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        fadeEdges && "before:absolute before:top-0 before:left-0 before:right-0 before:h-4 before:bg-gradient-to-b before:from-white before:to-transparent before:z-10 before:pointer-events-none",
        fadeEdges && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-4 after:bg-gradient-to-t after:from-white after:to-transparent after:z-10 after:pointer-events-none",
        className
      )}
      style={{ maxHeight }}
    >
      <div 
        className={cn(
          "overflow-y-auto h-full bentin-scroll",
          !showScrollbar && "scrollbar-hide",
          "scroll-smooth"
        )}
        style={{
          scrollbarGutter: 'stable'
        }}
      >
        <div className={fadeEdges ? "py-4" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Variações específicas do sistema
export function ModalScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CustomScroll 
      className={cn("relative", className)}
      maxHeight="60vh"
      showScrollbar={true}
      fadeEdges={true}
    >
      {children}
    </CustomScroll>
  );
}

export function TableScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CustomScroll 
      className={className}
      maxHeight="500px"
      showScrollbar={true}
      fadeEdges={false}
    >
      {children}
    </CustomScroll>
  );
}

export function FormScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CustomScroll 
      className={className}
      maxHeight="70vh"
      showScrollbar={true}
      fadeEdges={true}
    >
      {children}
    </CustomScroll>
  );
}