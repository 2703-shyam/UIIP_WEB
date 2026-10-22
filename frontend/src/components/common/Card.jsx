import React from 'react';

export const Card = ({ as: Element = 'section', className = '', children, ...props }) => (
  <Element className={`ui-card ${className}`.trim()} {...props}>
    {children}
  </Element>
);
