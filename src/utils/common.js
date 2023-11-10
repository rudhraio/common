function convertToAlphanumeric(inputString) {
    let alphanumericString = inputString.replace(/ /g, '_');
    alphanumericString = alphanumericString.replace(/[^a-zA-Z0-9\-_.(){}[\]<>]/g, '');
    return alphanumericString;
}

export { convertToAlphanumeric };