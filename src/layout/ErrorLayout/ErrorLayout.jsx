import ErrorAlert from '../../components/Error/Error';
import React from 'react';
class ErrorLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    console.log(error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render() {
    const asyncError = this.props?.asycErrorDetails;

    if (this.state.hasError || asyncError?.isError) {
      if (asyncError.errorCode === '503') return <ErrorAlert errorType="serverDown" />;

      return <ErrorAlert errorType="failedAPI" />;
    }

    return this.props.children;
  }
}
export default ErrorLayout;
