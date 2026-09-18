const CONTACT_EMAIL = "furuta.ideas@gmail.com";

const plans = {
  "smart-city": {
    kicker: "スマートシティ入門コース",
    title: "柏の葉スマートシティの全体像を短時間でつかむ",
    description: "初めて柏の葉を訪れる方向けに、街の成り立ち、産学公民連携、主要拠点、実証の考え方を横断的にご案内します。",
    points: ["街全体のコンセプトと推進体制を把握", "代表的な拠点や取り組みを効率よく視察", "新規事業や研究テーマの入口づくりに最適"]
  },
  environment: {
    kicker: "環境・エネルギーコース",
    title: "脱炭素とエネルギーマネジメントの実装を学ぶ",
    description: "環境配慮型のまちづくり、エネルギー利用、地域での実装に関する取り組みをテーマに視察を組み立てます。",
    points: ["脱炭素・省エネの街区視点を確認", "環境価値と生活者体験の両立を学習", "自治体施策や企業のESG検討に活用"]
  },
  mobility: {
    kicker: "まちづくり・モビリティコース",
    title: "都市デザインと移動体験を現地で考える",
    description: "歩行者目線の街区、回遊性、交通・モビリティの実証や住民体験を、現地観察と対話で深掘りします。",
    points: ["都市空間と移動導線を現地で観察", "生活者視点の課題設定を支援", "モビリティ実証の検討材料を整理"]
  },
  healthcare: {
    kicker: "ヘルスケア・ウェルビーイングコース",
    title: "健康・医療・暮らしの質を支える街の仕組みを見る",
    description: "ウェルビーイング、ヘルスケア、住民参加の観点から、未来の暮らしを支える仕組みを体験します。",
    points: ["健康を支えるまちづくりの視点を整理", "医療・生活・データ活用の接点を確認", "住民参加型サービスの設計に活用"]
  },
  innovation: {
    kicker: "イノベーションコース",
    title: "共創と新規事業が生まれる場を体感する",
    description: "企業、大学、自治体、スタートアップが交わる共創の場を巡り、事業アイデアを検討する材料を集めます。",
    points: ["共創拠点や実証フィールドの考え方を理解", "新規事業テーマの仮説づくりを支援", "ワークショップとの組み合わせも相談可能"]
  },
  dx: {
    kicker: "イノベーション・DXコース",
    title: "DX・データ活用・技術実装の最前線を学ぶ",
    description: "街の実証や企業連携を題材に、データ活用、DX、現場実装のポイントをわかりやすく整理します。",
    points: ["DX推進担当者向けの論点を整理", "データ活用と現場体験の接点を確認", "技術を事業に接続する対話を設計"]
  }
};

const body = document.body;
const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuButton = document.querySelector("[data-menu-button]");
const planModal = document.querySelector("[data-plan-modal]");
const contactModal = document.querySelector("[data-contact-modal]");
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}, { passive: true });

menuButton?.addEventListener("click", () => {
  const isOpen = menu?.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll("[data-faq-list] .faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const nextState = !item.classList.contains("is-open");
    item.classList.toggle("is-open", nextState);
    button.setAttribute("aria-expanded", String(nextState));
  });
});

function openModal(modal) {
  modal.hidden = false;
  body.classList.add("modal-open");
  window.setTimeout(() => modal.querySelector("[role='dialog']")?.focus(), 0);
}

function closeModal(modal) {
  modal.hidden = true;
  body.classList.remove("modal-open");
}

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    const plan = plans[button.dataset.plan];
    if (!plan) return;

    planModal.querySelector("[data-plan-kicker]").textContent = plan.kicker;
    planModal.querySelector("[data-plan-title]").textContent = plan.title;
    planModal.querySelector("[data-plan-description]").textContent = plan.description;

    const points = planModal.querySelector("[data-plan-points]");
    points.innerHTML = "";
    plan.points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      points.append(li);
    });

    openModal(planModal);
  });
});

planModal?.querySelectorAll("[data-modal-close]").forEach((element) => {
  element.addEventListener("click", () => closeModal(planModal));
});

document.querySelectorAll("[data-contact-open]").forEach((button) => {
  button.addEventListener("click", () => {
    if (planModal && !planModal.hidden) closeModal(planModal);
    openModal(contactModal);
  });
});

contactModal?.querySelectorAll("[data-contact-close]").forEach((element) => {
  element.addEventListener("click", () => closeModal(contactModal));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (planModal && !planModal.hidden) closeModal(planModal);
  if (contactModal && !contactModal.hidden) closeModal(contactModal);
});

document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = data.get("name");
  const company = data.get("company");
  const email = data.get("email");
  const theme = data.get("theme");
  const message = data.get("message") || "未記入";
  const subject = `柏の葉スマートシティツアー相談: ${company}`;
  const bodyText = [
    "柏の葉スマートシティツアーについて相談します。",
    "",
    `お名前: ${name}`,
    `会社・団体名: ${company}`,
    `メールアドレス: ${email}`,
    `関心のあるテーマ: ${theme}`,
    "",
    "ご相談内容:",
    message
  ].join("\n");
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  const result = document.querySelector("[data-form-result]");

  result.hidden = false;
  result.innerHTML = `入力内容をメール文面にしました。<br><a href="${mailto}">メールアプリを開く</a>`;
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealTargets = document.querySelectorAll(
  ".intro-visual, .stat-card, .process-box, .audience-grid article, .journey li, .plan-card, .profile-person, .profile-history, .faq-item"
);

if (!reduceMotion && "IntersectionObserver" in window) {
  const siblingIndex = new Map();
  revealTargets.forEach((element) => {
    element.classList.add("rv");
    const group = element.parentElement;
    const index = siblingIndex.get(group) ?? 0;
    siblingIndex.set(group, index + 1);
    element.style.transitionDelay = `${Math.min(index, 5) * 90}ms`;
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

function runCounter(element) {
  const target = Number(element.dataset.countTo);
  const decimals = Number(element.dataset.countDecimals || 0);
  const duration = 1500;
  let startTime;

  function tick(now) {
    startTime ??= now;
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = (target * eased).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counters = document.querySelectorAll("[data-count-to]");

if (!reduceMotion && "IntersectionObserver" in window && counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((element) => counterObserver.observe(element));
}
