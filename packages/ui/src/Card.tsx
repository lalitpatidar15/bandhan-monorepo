import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  padding?: "none" | "md" | "lg";
  hover?: boolean;
  children: ReactNode;
}

export function Card({ padded = true, padding = "md", hover = false, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={[
        "bhn-card",
        hover ? "bhn-card-hover" : "",
        padded ? (padding === "lg" ? "bhn-card-pad-lg" : "bhn-card-pad") : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}

export function CardHeader({ title, sub, actions, className = "", children, ...rest }: CardHeaderProps) {
  return (
    <div className={["bhn-card-header", className].filter(Boolean).join(" ")} {...rest}>
      <div>
        {title ? <h3 className="bhn-card-title">{title}</h3> : null}
        {sub ? <p className="bhn-card-sub">{sub}</p> : null}
        {children}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}

export function CardBody({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["bhn-card-body", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={["bhn-card-title", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </h3>
  );
}

export function CardSub({ className = "", children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={["bhn-card-sub", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </p>
  );
}