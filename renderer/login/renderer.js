function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });
}

const loginBtn = document.getElementById('loginBtn');
const confirmBtn = document.getElementById('confirmBtn');
const progressBar = document.getElementById('progress-bar');

loginBtn.addEventListener('click', (event) => {
  event.preventDefault();

  ipcRenderer.send('logIn:create', {})
  ipcRenderer.on('logIn:done', (json) => {
    const url = Process.generateAuthUrl(json.id);
    shell.openExternal(url)
  })

  loginBtn.classList.add('hide')
  confirmBtn.classList.remove('hide')
})

confirmBtn.addEventListener('click', (event) => {
  event.preventDefault();
  confirmBtn.classList.add('hide');
  progressBar.classList.remove('hide');

  setTimeout(() => {
    ipcRenderer.send('logIn:check')
    ipcRenderer.on('logIn:error', (json) => {
      Toastify.toast({
        text: json.errorMsg,
        duration: 5000,
        close: false,
        style: {
          background: 'red',
          color: 'white',
          textAlign: 'center',
        },
        className: 'toast',
        gravity: 'bottom'
      });
    })

    progressBar.classList.add('hide');
    loginBtn.classList.remove('hide');
  }, 1500);
})