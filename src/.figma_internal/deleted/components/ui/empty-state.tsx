import React from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  secondaryAction 
}: EmptyStateProps) {
  return (
    <Card className="bentin-card">
      <CardContent className="text-center py-16">
        <div className="h-20 w-20 mx-auto mb-6 text-gray-300">
          {icon}
        </div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
          {title}
        </h3>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button 
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className={action.variant === 'default' ? 'bentin-button-primary' : ''}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}