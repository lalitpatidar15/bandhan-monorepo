import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'button' | 'section';
  type?: 'button' | 'submit' | 'reset';
}

const Card = forwardRef<HTMLElement, CardProps>(
  ({ as = "div", ...props }, ref) => {
    if (as === 'button') {
      return (
        <button ref={ref as React.Ref<HTMLButtonElement>} {...props} />
      );
    }
    if (as === 'section') {
      return (
        <section ref={ref as React.Ref<HTMLElement>} {...props} />
      );
    }
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} {...props} />
    );
  }
);

Card.displayName = 'Card';

export default Card;