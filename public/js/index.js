import {setMap} from './map'
import {authAccount, logout, updateSettings} from './auth'
import {checkout} from './booking'


// DOM
let mapObj = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutButton = document.querySelector('.nav__el--logout');
const updateUserDataBtn = document.querySelector('.form-user-data');
const updateUserPasswordBtn = document.querySelector('.form-user-password');
const bookingBtn = document.getElementById('book-tour');

// callings
if(mapObj){
    mapObj = mapObj.dataset.locations;
    const locations = JSON.parse(mapObj);
    setMap(locations);
}

if(loginForm){
    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        btn.textContent = 'Please wait..';
        btn.disabled = true;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await authAccount({email, password}, 'login');
    });
}
if(signupForm){
    signupForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('signupBtn');
        btn.textContent = 'Please wait..';
        btn.disabled = true;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        await authAccount({name, email, password, passwordConfirm}, 'signup');
    });
}

if(logoutButton)
    logoutButton.addEventListener('click', logout);

if(updateUserDataBtn)
    updateUserDataBtn.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
    })


if(updateUserPasswordBtn)
    updateUserPasswordBtn.addEventListener('submit',async e => {
        e.preventDefault();
        document.querySelector('.password-save-button').textContent = 'UPDATING...';
        document.querySelector('.password-save-button').disabled = true;
        const currentPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({currentPassword, password, passwordConfirm}, 'password');
        document.querySelector('.password-save-button').textContent = 'SAVE PASSWORD';
        document.querySelector('.password-save-button').disabled = false;
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
})


if(bookingBtn)
    bookingBtn.addEventListener('click',async e => {
        const tourId = bookingBtn.attributes.tourId.value;
        bookingBtn.textContent = 'Processing...';
        await checkout(tourId);
        bookingBtn.textContent = 'BOOK TOUR NOW!';
    })