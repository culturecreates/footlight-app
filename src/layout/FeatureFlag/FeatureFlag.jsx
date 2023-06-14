function FeatureFlag(props) {
  const { isFeatureEnabled, children } = props;
  if (isFeatureEnabled === 'true') return children;
  else return;
}

export default FeatureFlag;
