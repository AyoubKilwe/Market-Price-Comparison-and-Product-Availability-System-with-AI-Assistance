import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('MarketEye page error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-screen">
          <div>
            <strong>MarketEye</strong>
            <h1>Page could not open</h1>
            <p>Please reopen the page. If the problem continues, clear the browser cache and try again.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
