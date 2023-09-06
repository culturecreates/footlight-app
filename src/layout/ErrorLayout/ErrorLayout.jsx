import { getErrorDetails } from '../../redux/reducer/ErrorSlice';
import { useSelector } from 'react-redux';
import ErrorAlert from '../../components/Error/Error';
import { useEffect, useState } from 'react';

function ErrorLayout({ children }) {
  const errorDetails = useSelector(getErrorDetails);
  const [errorComponent, setErrorComponent] = useState(<></>);

  useEffect(() => {
    if (errorDetails.isError) {
      if (errorDetails.errorCode === '503') {
        setErrorComponent(<ErrorAlert errorType="serverDown" />);
      } else if (
        errorDetails.errorCode === '403' ||
        errorDetails.errorCode === '500' ||
        errorDetails.errorCode === '400' ||
        errorDetails.errorCode === 'FETCH_ERROR'
      ) {
        setErrorComponent(<ErrorAlert errorType="failedAPI" />);
      }
    }
  }, [errorDetails]);

  return <>{errorDetails.isError ? errorComponent : children}</>;
}

export default ErrorLayout;
