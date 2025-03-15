
const timeNow = document.getElementById('timeNow');
const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const minute = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours;
    let hours12Hour = hours12 < 12 ? hours12 + 12 : hours
    hours12Hour < 10 ? timeNow.textContent = `0${hours12Hour}:${minute}` : timeNow.textContent = `${hours12Hour}:${minutes}`;

    ;
}
// updateTime();
setInterval(updateTime, 1000);

// light in every 2 seconds backgroundcolor green 
const light = document.querySelector('.light');
setInterval(() => {
    light.style.backgroundColor = light.style.backgroundColor === 'green' ? 'black' : 'green';
}, 1000);


const phoneButton = document.querySelector('#loginWithPhone');
const emailButton = document.querySelector('#loginWithEmail');
const phoneInput = document.getElementById('phoneInput');
const emailInput = document.getElementById('emailInput');

function toggleLogin(selectedButton, otherButton, showInput, hideInput) {
    selectedButton.classList.add('active');
    otherButton.classList.remove('active');
    showInput.style.display = 'block';
    hideInput.style.display = 'none';
}

phoneButton.addEventListener('click', () => {
    toggleLogin(phoneButton, emailButton, phoneInput, emailInput);
});

emailButton.addEventListener('click', () => {
    toggleLogin(emailButton, phoneButton, emailInput, phoneInput);
});

// password visibility toggle

const passwordToggle = document.querySelector('.passwordToggle');
const passwordInput = document.getElementById('password');

passwordToggle.addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
});

// profile image upload

function uploadProfileImage() {
    const fileupload = document.getElementById('changeProfile');
    fileupload.click();
}
