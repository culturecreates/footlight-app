import { contentLanguage } from '../../constants/contentLanguage';

function LanguageFilter(props) {
  const { children, calendarContentLanguage } = props;
  if (calendarContentLanguage === contentLanguage.FRENCH && children?.key === contentLanguage.FRENCH) return children;
  else if (calendarContentLanguage === contentLanguage.ENGLISH && children?.key === contentLanguage.ENGLISH)
    return children;
  else if (calendarContentLanguage === contentLanguage.BILINGUAL) return children;
  else return <></>;
}

export default LanguageFilter;
