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
    .then(data => {
      while (result.hasChildNodes()) {
        result.removeChild(result.lastChild);
      }
      result.insertAdjacentHTML('afterbegin', `
        <div class="generated-wrapper">
          <a target="_blank" class="generated-url" rel="noopener" href="/${data.key}">
            ${location.origin}/${data.key}
          </a>
        </div>
      `)
    })
    .catch(console.error)
});