export const markFormDirty = (changedValue, showDialog, setShowDialog) => {
  if (changedValue?.length > 0 && !showDialog) {
    if (changedValue?.filter((field) => field?.touched).length > 0) {
      setShowDialog(true);
    }
  }
};

export const createOnFieldsChange = (showDialog, setShowDialog) => (changedValue) =>
  markFormDirty(changedValue, showDialog, setShowDialog);
