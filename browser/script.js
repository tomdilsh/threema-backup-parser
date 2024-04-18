function debounce(method, delay) {
  clearTimeout(method._tId);
  method._tId = setTimeout(function () {
    method();
  }, delay);
}

function hideFixedDate() {
  const fixed = document.getElementById("fixed-date");
  fixed.classList.add("hidden");
}

const round10 = (x) => Math.ceil(x / 10) * 10;

window.onload = () => {
  const heights = new Map();
  const bubbles = [
    ...document.querySelectorAll(".date-bubble:not(#fixed-date)"),
  ];
  let offset = 0;
  let first = 0;
  for (let i = 0; i < bubbles.length; i++) {
    const y = bubbles[i].getBoundingClientRect().y;
    if (i === 0) {
      offset = Math.abs(y);
      first = Math.max(0, y * 2);
    }
    heights.set(round10(y + offset - first), bubbles[i].textContent);
  }

  const body = document.querySelector("body");
  const fixed = document.querySelector("#fixed-date");

  const updateFixedDate = () => {
    const scroll = round10(body.scrollTop);
    for (let i = scroll; i >= 0; i -= 10) {
      const msg = heights.get(i);
      if (msg) {
        fixed.textContent = msg;
        break;
      }
    }
  };
  updateFixedDate();

  document.addEventListener("scroll", () => {
    fixed.classList.remove("hidden");
    debounce(hideFixedDate, 3000);
    debounce(updateFixedDate, 50);
  });
};
