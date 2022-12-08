function FormatDate(props) {
  const date = new Date(props.date);
  const lang = props.lang;
  let compDate;
  if (lang === 'en') {
    // This is non-standard custom format 6-JAN-2022
    const day = date.getDay();
    const month = date.toLocaleDateString('en', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    compDate = `${day}-${month}-${year}`;
  } else {
    // This is for standard format in most locales
    compDate = date.toLocaleDateString(lang, { dateStyle: 'short' });
  }

  return <span style={{ whiteSpace: 'nowrap' }}>{compDate}</span>;
}

export default FormatDate;
