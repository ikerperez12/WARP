import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary:${this.props.label || "unknown"}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            color: "var(--text-muted)",
            background: "var(--bg-panel)",
            border: "1px solid var(--border-soft)",
            borderRadius: "1rem",
            margin: "2rem auto",
            maxWidth: "min(600px, 90vw)",
          }}
        >
          <p>Una capa visual no pudo cargarse.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1.4rem",
              color: "var(--accent-magenta)",
              border: "1px solid var(--accent-magenta)",
              borderRadius: "999px",
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
