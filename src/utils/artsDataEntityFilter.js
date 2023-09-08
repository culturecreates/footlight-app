export const artsDataDuplicateFilter = ({ artsData, data }) => {
  const idsInURI = data?.map((item) => {
    const uri = item?.uri;
    const match = uri?.match(/\/([^/]+)$/);
    return match ? match[1] : null;
  });

  let filteredArtsData = artsData;
  if (artsData.length > 0 && data.length > 0) {
    filteredArtsData = artsData.filter((item) => {
      return !idsInURI?.includes(item?.id);
    });
  }
  return filteredArtsData;
};
