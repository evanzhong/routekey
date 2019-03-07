const form = document.querySelector('form');
const result = document.querySelector('.generated');

form.addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('.url');
  fetch('/new-route', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: input.value,
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
          <p id="notif">Your generated RouteKey is <strong>${body.key}</strong></p>
          <div id="notif-link">
            <span>Go to: </span>
            <a target="_blank" class="generated-url" rel="noopener" href="/${body.key}">
              ${location.origin}/${body.key}
            </a>
            <span> to use </span>
          </div>
        </div>
      `)
    })
    .catch(console.error)
});