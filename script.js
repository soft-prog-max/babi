/* ==================================
   ROMANTIC PHOTO ALBUM - SCRIPT
   Connected to index.html + style.css
================================== */

const slidesBox   = document.getElementById("slides");
const counterEl   = document.getElementById("slideCounter");
const dotsBox     = document.getElementById("slideDots");
const slideshowEl = document.getElementById("slideshow");
const uploadInput = document.getElementById("photoUpload");
const gallery     = document.getElementById("gallery");
const uploadedSec = document.getElementById("uploadedSection");

const AUTO_DELAY = 4000; // 4 seconds
let current = 0;
let timer = null;

const getSlides = () => Array.from(slidesBox.querySelectorAll(".slide"));

/* Blurred background behind each photo (used by CSS --photo) */
function applyBackdrop(slide) {
    const img = slide.querySelector("img");
    if (img) slide.style.setProperty("--photo", `url("${img.getAttribute("src")}")`);
}

/* ---------- Dots ---------- */
function buildDots() {
    dotsBox.innerHTML = "";
    getSlides().forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "dot";
        dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
        dot.addEventListener("click", () => {
            showSlide(i);
            restartAuto();
        });
        dotsBox.appendChild(dot);
    });
}

/* ---------- Show a slide ---------- */
function showSlide(index) {
    const slides = getSlides();
    if (!slides.length) {
        counterEl.textContent = "0 / 0";
        return;
    }
    current = (index + slides.length) % slides.length;

    slides.forEach((s, i) => s.classList.toggle("active", i === current));
    dotsBox.querySelectorAll(".dot").forEach((d, i) =>
        d.classList.toggle("active", i === current)
    );
    counterEl.textContent = `${current + 1} / ${slides.length}`;
}

/* Called by the Prev / Next buttons in index.html */
function changeSlide(step) {
    showSlide(current + step);
    restartAuto();
}

/* ---------- Auto play ---------- */
function startAuto() {
    stopAuto();
    timer = setInterval(() => showSlide(current + 1), AUTO_DELAY);
}
function stopAuto() {
    clearInterval(timer);
    timer = null;
}
function restartAuto() { startAuto(); }

slideshowEl.addEventListener("mouseenter", stopAuto);
slideshowEl.addEventListener("mouseleave", startAuto);

/* ---------- Keyboard + swipe ---------- */
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowLeft")  changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
});

let touchX = null;
slideshowEl.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
    stopAuto();
}, { passive: true });

slideshowEl.addEventListener("touchend", (e) => {
    if (touchX !== null) {
        const diff = e.changedTouches[0].clientX - touchX;
        if (Math.abs(diff) > 50) changeSlide(diff < 0 ? 1 : -1);
        else startAuto();
    }
    touchX = null;
}, { passive: true });

/* ---------- Upload photos ---------- */
uploadInput.addEventListener("change", () => {
    const files = Array.from(uploadInput.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    const firstNewIndex = getSlides().length;

    files.forEach((file) => {
        const url = URL.createObjectURL(file);
        const defaultCaption = "A new memory with you. ♡";

        // Slide
        const slide = document.createElement("div");
        slide.className = "slide";
        slide.innerHTML = `<img alt="Uploaded photo"><div class="caption"></div>`;
        slide.querySelector("img").src = url;
        slide.querySelector(".caption").textContent = defaultCaption;
        applyBackdrop(slide);
        slidesBox.appendChild(slide);

        // Gallery card
        const card = document.createElement("div");
        card.className = "photo-card";
        card.innerHTML = `
            <img alt="Uploaded photo">
            <input type="text" aria-label="Photo caption" placeholder="Write a caption">
            <button type="button" class="delete-btn">Remove</button>`;
        card.querySelector("img").src = url;

        const input = card.querySelector("input");
        input.value = defaultCaption;
        input.addEventListener("input", () => {
            slide.querySelector(".caption").textContent = input.value || " ";
        });

        card.querySelector(".delete-btn").addEventListener("click", () => {
            slide.remove();
            card.remove();
            URL.revokeObjectURL(url);
            if (!gallery.children.length) uploadedSec.hidden = true;
            buildDots();
            showSlide(Math.min(current, getSlides().length - 1));
        });

        gallery.appendChild(card);
    });

    uploadedSec.hidden = false;
    buildDots();
    showSlide(firstNewIndex);
    restartAuto();
    uploadInput.value = ""; // allow choosing the same file again
});

/* ---------- Floating hearts ---------- */
const heartsBox = document.getElementById("hearts");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function spawnHeart() {
    if (document.hidden) return;
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = Math.random() > 0.3 ? "♡" : "♥";
    h.style.left = Math.random() * 100 + "vw";
    h.style.fontSize = 14 + Math.random() * 22 + "px";
    h.style.animationDuration = 7 + Math.random() * 6 + "s";
    heartsBox.appendChild(h);
    setTimeout(() => h.remove(), 14000);
}
if (!reduceMotion) setInterval(spawnHeart, 1100);

/* ---------- Start ---------- */
getSlides().forEach(applyBackdrop);
buildDots();
showSlide(0);
startAuto();