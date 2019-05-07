const form = document.querySelector('form');
const result = document.querySelector('.generated');

form.addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('.url');
  const expireSelected = document.querySelector('.expire');
  fetch('/new-route', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: input.value,
      expireTime: expireSelected.options[expireSelected.selectedIndex].value,
    })
  })
    .then(response => response.json())
    .then(body => {
      while (result.hasChildNodes()) {
        result.removeChild(result.lastChild);
      }
      console.log(JSON.stringify(body));
      result.insertAdjacentHTML('afterbegin', `
        <div class="generated-wrapper">
          <p id="notif">Your generated RouteKey is: <b>${body.key}</b></p>
          <div id="notif-link">
            <span>Go to: </span>
            <a target="_blank" class="generated-url" rel="noopener" href="/${body.key}">
              ${location.origin}/${body.key}
            </a>
            <span> to use </span>
          </div>
        </div>
      `)
      if (body.morris){
        document.querySelector('#notif-link').insertAdjacentHTML('afterend', `
          <div id="morrisism-congrats">
            <img src="images/parrot.gif" style="height: 35px;width: 35px;">
              Congrats! You've found a MORRISISM!
            <img src="images/parrot.gif" style="height: 35px;width: 35px;">
          </div>
        `)
      }
    })
    .catch(console.error)
});