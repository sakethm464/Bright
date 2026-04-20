const carouselPrev = document.getElementById("carousel-prev");
const carouselNext = document.getElementById("carousel-next");
const qaTrack = document.getElementById("qa-track");
const revealItems = document.querySelectorAll(".reveal, .reveal-step");

const qaSlides = [
  {
    question: "why this matters?",
    answer: "Students often wait too long to ask for help, and stress starts hurting focus, grades, and sleep."
  },
  {
    question: "what do students need?",
    answer: "They need quick reflection, clear feedback, and simple access to the right support."
  },
  {
    question: "so...why bright?",
    answer: "bright helps students notice warning signs early and take action before burnout gets worse."
  }
];

let currentSlide = 0;

function renderSlides() {
  qaTrack.innerHTML = "";

  qaSlides.forEach((slide) => {
    const card = document.createElement("div");
    card.className = "qa-card";
    card.innerHTML = `
      <div class="qa-grid">
        <div class="qa-side qa-question">
          <p class="qa-label">Q:</p>
          <h3>${slide.question}</h3>
        </div>
        <div class="qa-divider" aria-hidden="true"></div>
        <div class="qa-side qa-answer">
          <p class="qa-label">A:</p>
          <p>${slide.answer}</p>
        </div>
      </div>
    `;
    qaTrack.appendChild(card);
  });
}

function updateTrackPosition() {
  qaTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function goToSlide(nextIndex) {
  currentSlide = nextIndex;
  updateTrackPosition();
}

carouselPrev.addEventListener("click", () => {
  const nextIndex = (currentSlide - 1 + qaSlides.length) % qaSlides.length;
  goToSlide(nextIndex);
});

carouselNext.addEventListener("click", () => {
  const nextIndex = (currentSlide + 1) % qaSlides.length;
  goToSlide(nextIndex);
});

renderSlides();
updateTrackPosition();

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});
