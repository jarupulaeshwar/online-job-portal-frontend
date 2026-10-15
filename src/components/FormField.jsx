import { useId } from 'react';

/** A label + input (or textarea/select) + error message, wired together for screen readers. */
export default function FormField({ label, error, hint, as = 'input', children, ...props }) {
  const id = useId();
  const Tag = as;
  return (
    <div className={`field ${error ? 'field-invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Tag id={id} aria-invalid={error ? 'true' : 'false'} aria-describedby={`${id}-msg`} {...props}>
        {children}
      </Tag>
      <p id={`${id}-msg`} className={error ? 'field-error' : 'field-hint'}>
        {error || hint || ''}
      </p>
    </div>
  );
}
