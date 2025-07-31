import { connect } from 'react-redux';
import ErrorAlert from '../../components/Error/Error';
import React from 'react';
import Cookies from 'js-cookie';
import { getUserDetails, clearUser } from '../../redux/reducer/userSlice';
import { infiniteLoopHandler } from '../../utils/infiniteLoopHandler';
import { errorTypes } from '../../constants/errors';

class ErrorLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error) {
    console.error(error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.logError({ info: { error, errorInfo } });

    const isLoopDetected = infiniteLoopHandler();
    if (isLoopDetected) {
      this.props.clearUser(); // Only logout if loop is confirmed
    }
  }

  componentDidMount() {
    if (!this.state.hasError) Cookies.remove('error');
  }

  logError({ info }) {
    const errorLog = JSON.stringify({
      data: JSON.stringify(info),
      message: info?.error?.message,
      component: info?.error?.stack,
      level: 'error',
    });

    const token = this.getToken();

    fetch(`${process.env.REACT_APP_API_URL}/log/cms-app`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: errorLog,
    })
      .then((response) => response.json())
      .then((data) => console.log('Error logged successfully:', data))
      .catch((error) => console.error('Error logging failed:', error));
  }

  getToken() {
    const { userDetails } = this.props;
    const { accessToken } = userDetails || {};

    if (accessToken) {
      return accessToken;
    }
    return Cookies.get('accessToken');
  }

  render() {
    const asyncError = this.props?.asycErrorDetails;

    if (this.state.hasError) return <ErrorAlert errorType={errorTypes.GENERAL} />;

    if (asyncError?.isError) {
      switch (asyncError.errorCode) {
        case '503':
          return <ErrorAlert errorType={errorTypes.SERVER_DOWN} />;
        case '409':
          return <ErrorAlert errorType={errorTypes.CONFLICT} />;
        default:
          return <ErrorAlert errorType={errorTypes.FAILED_API} />;
      }
    }

    return this.props.children;
  }
}

ErrorLayout.displayName = 'ErrorLayout';

const mapStateToProps = (state) => ({
  userDetails: getUserDetails(state),
});

const mapDispatchToProps = {
  clearUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(ErrorLayout);
