"use strict";

const cards = document.querySelectorAll(".hero-card");
const dialog = document.querySelector(".card-dialog");
const dialogCard = document.querySelector("#dialog-card");
const closeButton = document.querySelector(".dialog-close");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

let activeCard = null;

function openCard(card) {
  if (!dialog || !dialogCard || dialog.open) return;

  activeCard = card;
  const clone = card.cloneNode(true);
  clone.removeAttribute("tabindex");
  clone.removeAttribute("aria-label");
  clone.style.removeProperty("--rx");
  clone.style.removeProperty("--ry");
  dialogCard.replaceChildren(clone);
  dialog.showModal();
  closeButton?.focus();
}

function closeCard() {
  if (dialog?.open) dialog.close();
}

cards.forEach((card) => {
  card.addEventListener("click", () => openCard(card));

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCard(card);
    }
  });

  if (precisePointer.matches && !reduceMotion.matches) {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
      card.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  }
});

closeButton?.addEventListener("click", closeCard);

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) closeCard();
});

dialog?.addEventListener("close", () => {
  dialogCard?.replaceChildren();
  activeCard?.focus();
  activeCard = null;
});
