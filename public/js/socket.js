window.addEventListener('load', () => {
    const API_HOST = 'https://bfbot.mosin.jp/';
    const socket = io();
    const logTable = document.querySelector('#logs > tbody');

    const appendLog = passedMessage => {
        passedMessage.split('\n').map(message => {
            if(!message) return;
            const messages = message.match(/^(.*?) - (.*?)$/i);
            const tr = document.createElement('tr');
            const ts = document.createElement('th');
            ts.innerText = messages[1] || 'No timestamp';
            const msg = document.createElement('th');
            msg.setAttribute('style', 'text-align: left;');
            msg.innerText = messages[2] || 'No message';
            tr.appendChild(ts);
            tr.appendChild(msg);

            logTable.insertBefore(tr, logTable.firstChild);
        });
    };
    socket.on('log.update', message => appendLog(message));
});
