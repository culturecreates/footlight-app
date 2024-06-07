import { connect } from 'react-redux';
import ErrorAlert from '../../components/Error/Error';
import React from 'react';
import Cookies from 'js-cookie';
import { getUserDetails, clearUser } from '../../redux/reducer/userSlice';
import { infiniteLoopHandler } from '../../utils/infiniteLoopHandler';

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
    infiniteLoopHandler(() => {
      this.props.clearUser();
    });
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

    if (this.state.hasError) return <ErrorAlert errorType="general" />;

    if (asyncError?.isError) {
      if (asyncError.errorCode === '503') return <ErrorAlert errorType="serverDown" />;

      return <ErrorAlert errorType="failedAPI" />;
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
