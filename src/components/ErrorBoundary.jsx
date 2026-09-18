import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', margin: '2rem', border: '1px solid red', backgroundColor: '#fee2e2' }}>
          <h1 style={{ color: 'red' }}>Algo deu errado na tela!</h1>
          <p style={{ fontWeight: 'bold' }}>Por favor, tire um print dessa tela e mostre para a inteligência artificial:</p>
          <pre style={{ backgroundColor: 'white', padding: '1rem', overflowX: 'auto', marginTop: '1rem' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
