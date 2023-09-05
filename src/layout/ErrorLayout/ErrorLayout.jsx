import { getErrorDetails } from '../../redux/reducer/ErrorSlice';
import { useSelector } from 'react-redux';
import ErrorAlert from '../../components/Error/Error';

function ErrorLayout({ children }) {
  const errorDetails = useSelector(getErrorDetails);

  return <>{errorDetails.isServerDown ? <ErrorAlert errorType="serverDown" /> : children}</>;
}

export default ErrorLayout;
