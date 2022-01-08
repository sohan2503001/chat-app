const socket = io();

socket.on('message', (message) => {
    console.log(message);
});

document.querySelector('#myForm').addEventListener('submit', (e) =>{
    e.preventDefault();
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message);
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const location = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
        socket.emit('sendLocation', location)
    })
})