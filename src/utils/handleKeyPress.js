export const handleKeyPress = ({ e, selectedItemIndex, data, setSelectedItemIndex, setItem, form, popOverHandler }) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const newIndex = Math.min(selectedItemIndex + 1, data.length - 1);
    setSelectedItemIndex(newIndex);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const newIndex = Math.max(selectedItemIndex - 1, -1);
    setSelectedItemIndex(newIndex);
  } else if (e.key === 'Enter' && selectedItemIndex !== -1) {
    console.log(e, 'e');
    e.preventDefault();
    const selectedPlace = data[selectedItemIndex];
    setItem(selectedPlace);
    form.setFieldValue('locationPlace', selectedPlace?.value);
    popOverHandler();
  }
};
