import { HTMLAttributes } from 'react';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export default function Heading({ children, className, ...props }: HeadingProps) {
  return (
    <h1 className={`text-2xl ${className || ''}`} {...props}>
      {children}
    </h1>
  );
}
