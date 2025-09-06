import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './card';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export function LoadingState({ 
  message = 'Carregando...', 
  size = 'md',
  fullPage = false 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const content = (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-bentin-pink`} />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <Card className="bentin-card">
        <CardContent className="py-12">
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

export function TableLoadingSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 bg-gray-200 rounded skeleton flex-1"
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <Card className="bentin-card">
      <CardContent className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded skeleton w-3/4" />
        <div className="h-4 bg-gray-200 rounded skeleton w-1/2" />
        <div className="h-8 bg-gray-200 rounded skeleton w-full" />
        <div className="h-4 bg-gray-200 rounded skeleton w-2/3" />
      </CardContent>
    </Card>
  );
}