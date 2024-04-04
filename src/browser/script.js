function debounce(method, delay) {
  clearTimeout(method._tId);
  method._tId = setTimeout(function () {
    method();
  }, delay);
}

function scrollTest() {
  let elem = null;
  const fixed = document.getElementById("fixed-date");
  const bubbles = [
    ...document.querySelectorAll(".date-bubble:not(#fixed-date)"),
  ];

  for (const b of bubbles) {
    const y = b.getBoundingClientRect().y;
    if (y < 0) {
      elem = b;
    }
    if (y >= 0) {
      break;
    }
  }

  if (elem) {
    fixed.textContent = elem.textContent;
  }
}

function hideFixedDate() {
  const fixed = document.getElementById("fixed-date");
  fixed.classList.add("hidden");
}

window.onload = () => {
  document.addEventListener("scroll", () => {
    const fixed = document.getElementById("fixed-date");
    fixed.classList.remove("hidden");
    scrollTest();
    debounce(hideFixedDate, 3000);
  });
};
