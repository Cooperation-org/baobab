// The gallery page's Copy buttons.
document.addEventListener('click', function (e) {
  var b = e.target.closest('.copy');
  if (!b) return;
  navigator.clipboard.writeText(b.parentNode.querySelector('pre').textContent).then(function () {
    b.textContent = 'Copied';
    setTimeout(function () { b.textContent = 'Copy'; }, 1500);
  });
});
