(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header ---------- */
  const header = document.getElementById("header");
  const toTop = document.getElementById("toTop");

  const onScroll = () => {
    const scrolled = window.scrollY > 12;
    header.classList.toggle("is-scrolled", scrolled);
    header.style.boxShadow = scrolled ? "0 24px 60px -50px rgba(20, 20, 19, 0.5)" : "none";
    toTop.classList.toggle("is-visible", window.scrollY > 900);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger.addEventListener("click", () => {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-inview"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Accordions ---------- */
  document.querySelectorAll(".acc__head").forEach((head) => {
    head.addEventListener("click", () => {
      const item = head.closest(".acc");
      const group = item.parentElement;
      const isOpen = item.classList.contains("acc--open");

      group.querySelectorAll(".acc").forEach((other) => {
        other.classList.remove("acc--open");
        other.querySelector(".acc__head").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("acc--open");
        head.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll("[data-count]");

  const animateCounter = (el) => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = `${prefix}${value.toLocaleString("ru-RU")}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    if (reduceMotion) {
      el.textContent = `${prefix}${target.toLocaleString("ru-RU")}${suffix}`;
      return;
    }
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Terminal animation ---------- */
  const terminal = document.getElementById("terminalBody");

  if (terminal) {
    const commandEl = document.getElementById("typedCommand");
    const lines = terminal.querySelectorAll(".t-line");
    const command = "claude";

    const showAll = () => {
      terminal.querySelector(".terminal__line").classList.add("is-visible");
      lines.forEach((line) => line.classList.add("is-visible"));
      commandEl.textContent = command;
    };

    if (reduceMotion) {
      showAll();
    } else {
      const timeouts = [];
      const wait = (fn, ms) => timeouts.push(setTimeout(fn, ms));

      wait(() => terminal.querySelector(".terminal__line").classList.add("is-visible"), 300);

      let index = 0;
      const typeNext = () => {
        if (index <= command.length) {
          commandEl.textContent = command.slice(0, index);
          index += 1;
          wait(typeNext, 90);
        } else {
          lines.forEach((line, i) => {
            wait(() => line.classList.add("is-visible"), 300 + i * 520);
          });
        }
      };
      wait(typeNext, 800);
    }
  }

  /* ---------- Billing toggle ---------- */
  const billingButtons = document.querySelectorAll(".billing__btn");
  const priceNodes = document.querySelectorAll(".tariff__now");
  const noteNodes = document.querySelectorAll(".tariff__note");

  billingButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.billing;

      billingButtons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });

      priceNodes.forEach((node) => {
        node.textContent = node.dataset[mode];
      });

      noteNodes.forEach((node) => {
        node.textContent = node.dataset[mode];
      });
    });
  });

  /* ---------- Tariff CTA -> preselect in form ---------- */
  const tariffSelect = document.getElementById("formTariff");
  const signup = document.getElementById("signup");

  document.querySelectorAll("[data-tariff]").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.dataset.tariff;
      if (!tariffSelect) return;
      const option = [...tariffSelect.options].find((opt) => opt.value === value);
      if (option) tariffSelect.value = option.value;
    });
  });

  document.querySelectorAll('a[href="#signup"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!signup) return;
      const target = signup.querySelector("input, select, button");
      if (target && !reduceMotion) {
        event.preventDefault();
        signup.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => target.focus({ preventScroll: true }), 650);
      }
    });
  });

  /* ---------- Form ---------- */
  const form = document.getElementById("signupForm");
  const success = document.getElementById("formSuccess");
  const again = document.getElementById("formAgain");

  if (form && success) {
    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const emailInput = form.querySelector('[name="email"]');
    const consentInput = form.querySelector('[name="consent"]');

    const setError = (input, hasError) => {
      const wrapper = input.closest(".field") || input.closest(".consent");
      if (wrapper) wrapper.classList.toggle("is-error", hasError);
    };

    const validName = () => nameInput.value.trim().length >= 2;
    const validPhone = () => phoneInput.value.replace(/\D/g, "").length >= 10;
    const validEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim());
    const validConsent = () => consentInput.checked;

    const validate = () => {
      const checks = [
        [nameInput, validName()],
        [phoneInput, validPhone()],
        [emailInput, validEmail()],
        [consentInput, validConsent()],
      ];
      checks.forEach(([input, valid]) => setError(input, !valid));
      return checks.every(([, valid]) => valid);
    };

    [nameInput, phoneInput, emailInput].forEach((input) => {
      input.addEventListener("input", () => setError(input, false));
    });
    consentInput.addEventListener("change", () => setError(consentInput, false));

    phoneInput.addEventListener("input", () => {
      const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      if (!digits) {
        phoneInput.value = "";
        return;
      }
      let result = "+7";
      if (digits.length > 1) result += ` (${digits.slice(1, 4)}`;
      if (digits.length >= 5) result += `) ${digits.slice(4, 7)}`;
      if (digits.length >= 8) result += `-${digits.slice(7, 9)}`;
      if (digits.length >= 10) result += `-${digits.slice(9, 11)}`;
      phoneInput.value = result;
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate()) {
        const firstError = form.querySelector(".is-error input");
        if (firstError) firstError.focus();
        return;
      }
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });

    if (again) {
      again.addEventListener("click", () => {
        form.reset();
        form.querySelectorAll(".is-error").forEach((el) => el.classList.remove("is-error"));
        success.hidden = true;
        form.hidden = false;
        nameInput.focus();
      });
    }
  }
})();
