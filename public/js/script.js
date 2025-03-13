
const timeNow = document.getElementById('timeNow');
const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const minute = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours - 12;
    hours12 < 10 ? timeNow.textContent = `0${hours12}:${minute}` : timeNow.textContent = `${hours12}:${minutes}`;

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

