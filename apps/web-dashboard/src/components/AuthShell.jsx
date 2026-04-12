import { Link } from 'react-router-dom';

function AuthShell({
  modeLabel,
  title,
  subtitle,
  alternateLabel,
  alternateTo,
  alternateText,
  children,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__ambient auth-shell__ambient--one" />
      <div className="auth-shell__ambient auth-shell__ambient--two" />

      <div className="auth-shell__content">
        <div className="auth-form-card">
          <div className="auth-form-card__header">
            <span className="auth-form-card__mode">{modeLabel}</span>
            {title ? <h1>{title}</h1> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          {children}

          <div className="auth-form-card__footer">
            <span>{alternateText}</span>
            <Link to={alternateTo}>{alternateLabel}</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthShell;
