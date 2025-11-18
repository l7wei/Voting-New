import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-xl transition-shadow duration-300' : '';
  
  return (
    <div className={`card ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
