import { contentLanguage } from '../../constants/contentLanguage';

function ContentLanguageInput(props) {
  const { children, calendarContentLanguage } = props;

  if (calendarContentLanguage === contentLanguage.FRENCH)
    return children?.props?.children?.filter((child) => child?.key === contentLanguage.FRENCH);
  else if (calendarContentLanguage === contentLanguage.ENGLISH)
    return children?.props?.children?.filter((child) => child?.key === contentLanguage.ENGLISH);
  else if (calendarContentLanguage === contentLanguage.BILINGUAL) return children;
  else return children;
}

export default ContentLanguageInput;
