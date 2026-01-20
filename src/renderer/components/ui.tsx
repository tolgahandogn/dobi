import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = ({ variant = 'primary', className, ...props }: ButtonProps) => {
  const styles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: '#0f172a',
      color: '#fff',
      border: '1px solid #0f172a'
    },
    secondary: {
      background: '#f1f5f9',
      color: '#0f172a',
      border: '1px solid #cbd5f5'
    },
    ghost: {
      background: 'transparent',
      color: '#0f172a',
      border: '1px dashed #94a3b8'
    }
  };

  return (
    <button
      {...props}
      className={className}
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        cursor: 'pointer',
        ...styles[variant],
        ...props.style
      }}
    />
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, ...props }: InputProps) => (
  <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
    {label ? <span>{label}</span> : null}
    <input
      {...props}
      style={{
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid #cbd5e1'
      }}
    />
  </label>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = ({ label, children, ...props }: SelectProps) => (
  <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
    {label ? <span>{label}</span> : null}
    <select
      {...props}
      style={{
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid #cbd5e1'
      }}
    >
      {children}
    </select>
  </label>
);

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ open, title, onClose, children }: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          width: 'min(720px, 90vw)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    </div>
  );
};
