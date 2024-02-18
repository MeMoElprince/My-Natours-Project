// type:     success    error

export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if(el)
        el.parentElement.removeChild(el);
}

export const showAlert = (type, message, sec = 7) => {
    hideAlert();
    const markup = `<div class='alert alert--${type}'>${message}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, sec * 1000);
}