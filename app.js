const $ = (s) => document.querySelector(s),
  esc = (x) =>
    String(x ?? "").replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
const iso = (d) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10),
  todayISO = () => iso(new Date());
const blankTasks = () => ({ student: [], general: [] }),
  sampleTasks = () => ({
    student: [
      { id: 1, text: "مرور درس‌های امروز", done: true },
      { id: 2, text: "حل تمرین ریاضی", done: false },
    ],
    general: [
      { id: 1, text: "مرور اولویت‌های امروز", done: true },
      { id: 2, text: "انجام مهم‌ترین کار", done: false },
    ],
  }),
  emptyDay = () => ({
    tasks: blankTasks(),
    times: [],
    note: "",
    habits: [0, 0, 0],
  });
const quotes = [
  "هر روز، یک قدم رو به جلو.",
  "نظم یعنی مهربانی امروز با خودِ فردا.",
  "پیشرفت آرام هم پیشرفت است؛ ادامه بده.",
];
const state = {
  profile: localStorage.getItem("rg-profile") || "",
  mode: null,
  quote: 0,
  ad: true,
  panel: null,
  currentDate: todayISO(),
  calendarDate: new Date(),
  days: {},
  tasks: blankTasks(),
  times: [],
  note: "",
  habits: [0, 0, 0],
};
const userKey = (name) => "rg-user-" + encodeURIComponent(name);
function loadProfile(name) {
  state.profile = name;
  localStorage.setItem("rg-profile", name);
  const data = JSON.parse(localStorage.getItem(userKey(name)) || "null");
  state.mode = data?.mode || null;
  state.days = data?.days || {};
  if (!state.days[todayISO()])
    state.days[todayISO()] = {
      tasks: Object.keys(state.days).length
        ? blankTasks()
        : JSON.parse(localStorage.getItem("rg-tasks") || "null") ||
          sampleTasks(),
      times: [],
      note: Object.keys(state.days).length
        ? ""
        : localStorage.getItem("rg-note") || "",
      habits: Object.keys(state.days).length ? [0, 0, 0] : [4, 0, 7],
    };
  state.currentDate = todayISO();
  loadDay(state.currentDate);
}
function chooseProfile() {
  const name = prompt("نام پروفایل را وارد کنید؛ مثال: محمد");
  if (!name?.trim()) return;
  loadProfile(name.trim());
  saveDay();
  render();
}
function loadDay(date) {
  state.currentDate = date;
  const day = state.days[date] || emptyDay();
  state.tasks = day.tasks || blankTasks();
  state.times = day.times || [];
  state.note = day.note || "";
  state.habits = day.habits || [0, 0, 0];
}
function saveDay() {
  if (!state.profile) return;
  state.days[state.currentDate] = {
    tasks: state.tasks,
    times: state.times,
    note: state.note,
    habits: state.habits,
  };
  localStorage.setItem(
    userKey(state.profile),
    JSON.stringify({ mode: state.mode, days: state.days }),
  );
}
function openDay(date) {
  saveDay();
  loadDay(date);
  state.panel = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
if (state.profile) loadProfile(state.profile);
function profileScreen() {
  return '<main class="start profile-start"><div class="mark">♙</div><h1>پروفایل خود را انتخاب کنید</h1><p>هر کاربر پرونده‌ها، تکالیف و برنامه‌های روزانه جداگانه خواهد داشت.</p><button id="choose-profile" class="profile-button">ورود یا ساخت پروفایل</button><small class="profile-note">اطلاعات هر پروفایل فقط روی همین دستگاه و مرورگر ذخیره می‌شود.</small></main>';
}
function startScreen() {
  return '<main class="start"><div class="mark">✓</div><h1>برنامه‌ریزی را برای خودت بساز</h1><p>فضایی را انتخاب کن که به زندگی امروزت نزدیک‌تر است.</p><div class="choices"><button data-mode="student"><i>✎</i><strong>من دانش‌آموز هستم</strong><span>درس‌ها، تکالیف و زمان مطالعه</span><em>شروع ←</em></button><button data-mode="general"><i>◎</i><strong>برنامه‌ریزی عمومی</strong><span>کارها، عادت‌ها و اهداف شخصی</span><em>شروع ←</em></button></div></main>';
}
function dateTitle() {
  return new Intl.DateTimeFormat(currentLocale(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(state.currentDate + "T12:00:00"));
}
function calendarPanel() {
  const b = state.calendarDate,
    y = b.getFullYear(),
    m = b.getMonth(),
    count = new Date(y, m + 1, 0).getDate(),
    offset = (new Date(y, m, 1).getDay() + 1) % 7,
    cells = Array(offset)
      .fill('<span class="empty"></span>')
      .concat(
        Array.from({ length: count }, (_, i) => {
          const date = iso(new Date(y, m, i + 1)),
            saved = !!state.days[date],
            selected = date === state.currentDate;
          return (
            '<button data-date="' +
            date +
            '" class="' +
            (saved ? "saved " : "") +
            (selected ? "selected" : "") +
            '"><b>' +
            (i + 1) +
            "</b>" +
            (saved ? "<i>پرونده دارد</i>" : "") +
            "</button>"
          );
        }),
      );
  return (
    '<section class="panel calendar-panel"><button id="close-panel">×</button><div class="calendar-head"><button id="next-month">→</button><h2>' +
    new Intl.DateTimeFormat(currentLocale(), {
      month: "long",
      year: "numeric",
    }).format(b) +
    '</h2><button id="prev-month">←</button></div><div class="week">' +
    weekLabels()
      .map((x) => "<span>" + x + "</span>")
      .join("") +
    '</div><div class="calendar">' +
    cells.join("") +
    '</div><p class="calendar-help"><i></i> روزهای علامت‌دار دارای پرونده ذخیره‌شده هستند.</p></section>'
  );
}
function reportPanel(list, done) {
  return (
    '<section class="panel"><button id="close-panel">×</button><h2>گزارش ' +
    dateTitle() +
    "</h2><p>" +
    done +
    " کار از " +
    list.length +
    " کار انجام شده است.</p><p>" +
    state.times.length +
    " برنامه زمانی و " +
    (state.note ? "یک یادداشت" : "بدون یادداشت") +
    " ثبت شده است.</p></section>"
  );
}
function render() {
  if (!state.profile) {
    $("#app").innerHTML = profileScreen();
    $("#choose-profile").onclick = chooseProfile;
    return;
  }
  if (!state.mode) {
    $("#app").innerHTML = startScreen();
    document.querySelectorAll("[data-mode]").forEach(
      (b) =>
        (b.onclick = () => {
          state.mode = b.dataset.mode;
          saveDay();
          render();
        }),
    );
    return;
  }
  const student = state.mode === "student",
    list = state.tasks[state.mode] || [],
    done = list.filter((x) => x.done).length,
    isToday = state.currentDate === todayISO(),
    panel =
      state.panel === "calendar"
        ? calendarPanel()
        : state.panel === "report"
          ? reportPanel(list, done)
          : "";
  $("#app").innerHTML =
    '<main class="app ' +
    (student ? "notebook" : "") +
    '"><header><button class="logo"><i>✓</i> روزنگار</button><button id="change-profile" class="profile-chip">♙ ' +
    esc(state.profile) +
    "</button><span>" +
    dateTitle() +
    '</span><button class="switch">' +
    (student ? "حالت عمومی" : "حالت دانش‌آموزی") +
    '</button></header><section class="welcome" id="today"><small>' +
    (student ? "دفتر برنامه‌ریزی من" : "برنامه روزانه من") +
    "</small><h1>" +
    (isToday ? "امروز را چطور می‌سازی؟" : "پرونده " + dateTitle()) +
    "</h1>" +
    (isToday
      ? ""
      : '<button id="back-today" class="back-today">بازگشت به امروز</button>') +
    '</section><section class="quote"><b>“</b><span>' +
    quotes[state.quote] +
    '</span><button id="quote">↻</button></section>' +
    panel +
    '<div class="grid"><section class="card" id="schedule"><div class="title"><div><small>زمان‌بندی</small><h2>برنامه این روز</h2></div></div>' +
    state.times
      .map((x) => {
        let v = x;
        try {
          v = JSON.parse(x);
        } catch {}
        return typeof v === "object"
          ? '<div class="time"><time>' +
              esc(v.time) +
              "</time><b>" +
              esc(v.title) +
              "</b></div>"
          : '<div class="time"><time>—</time><b>' + esc(v) + "</b></div>";
      })
      .join("") +
    (state.times.length
      ? ""
      : '<p class="empty-note">برنامه‌ای برای این روز ثبت نشده است.</p>') +
    '<button class="soft" id="add-time">＋ افزودن زمان</button></section><section class="card" id="tasks"><div class="title"><div><small>فهرست من</small><h2>کارهای این روز</h2></div><b>' +
    done +
    "/" +
    list.length +
    '</b></div><div class="bar"><i style="width:' +
    (list.length ? (done / list.length) * 100 : 0) +
    '%"></i></div><div class="tasks">' +
    list
      .map(
        (x) =>
          '<label class="' +
          (x.done ? "done" : "") +
          '"><input type="checkbox" data-task="' +
          x.id +
          '" ' +
          (x.done ? "checked" : "") +
          "><span>" +
          esc(x.text) +
          "</span></label>",
      )
      .join("") +
    '</div><div class="add"><input id="new-task" placeholder="یک کار تازه بنویس…"><button id="add-task">＋</button></div></section>' +
    (state.ad
      ? '<aside class="ad"><small>تبلیغ</small><div><b>فضای پیشنهادی برای برندها</b><span>۳۲۰ × ۱۰۰</span></div><button id="close-ad">×</button></aside>'
      : "") +
    '<section class="card"><h2>عادت‌های این روز</h2><div class="habits"><button data-habit="0">💧<b>آب</b><small>' +
    state.habits[0] +
    ' از ۸</small></button><button data-habit="1">' +
    (student ? "📚" : "🚶") +
    "<b>" +
    (student ? "مطالعه" : "پیاده‌روی") +
    "</b><small>" +
    state.habits[1] +
    ' دقیقه</small></button><button data-habit="2">☾<b>خواب</b><small>' +
    state.habits[2] +
    ' ساعت</small></button></div></section><section class="card"><div class="title"><h2>یادداشت این روز</h2><button class="save" id="save-note">ذخیره پرونده</button></div><textarea id="note">' +
    esc(state.note) +
    '</textarea></section></div><nav><button data-nav="today">⌂ <span>امروز</span></button><button data-nav="calendar">▣ <span>تقویم</span></button><button data-nav="tasks">✓ <span>کارها</span></button><button data-nav="report">◒ <span>گزارش</span></button></nav></main>';
  wire();
}
function wire() {
  $(".logo").onclick = () => {
    saveDay();
    state.mode = null;
    render();
  };
  $("#change-profile").onclick = () => {
    saveDay();
    localStorage.removeItem("rg-profile");
    state.profile = "";
    state.mode = null;
    state.days = {};
    render();
  };
  $(".switch").onclick = () => {
    saveDay();
    state.mode = state.mode === "student" ? "general" : "student";
    saveDay();
    render();
  };
  $("#quote").onclick = () => {
    state.quote = (state.quote + 1) % quotes.length;
    render();
  };
  $("#add-time").onclick = () => {
    const time = prompt("ساعت برنامه را وارد کنید؛ مثال: ۱۶:۳۰");
    if (!time) return;
    const title = prompt("عنوان برنامه را وارد کنید");
    if (!title) return;
    state.times.push(
      JSON.stringify({ time: time.trim(), title: title.trim() }),
    );
    saveDay();
    render();
  };
  $("#add-task").onclick = () => {
    const text = $("#new-task").value.trim();
    if (text) {
      state.tasks[state.mode].push({ id: Date.now(), text, done: false });
      saveDay();
      render();
    }
  };
  document.querySelectorAll("[data-task]").forEach(
    (x) =>
      (x.onchange = () => {
        state.tasks[state.mode].find((t) => t.id == x.dataset.task).done =
          x.checked;
        saveDay();
        render();
      }),
  );
  if ($("#close-ad"))
    $("#close-ad").onclick = () => {
      state.ad = false;
      render();
    };
  document.querySelectorAll("[data-habit]").forEach(
    (x) =>
      (x.onclick = () => {
        const i = +x.dataset.habit;
        if (i === 0) state.habits[0] = Math.min(8, state.habits[0] + 1);
        if (i === 1) state.habits[1] += 10;
        if (i === 2)
          state.habits[2] = +(
            prompt("چند ساعت خوابیدید؟", state.habits[2]) || state.habits[2]
          );
        saveDay();
        render();
      }),
  );
  $("#save-note").onclick = () => {
    state.note = $("#note").value;
    saveDay();
    alert("پرونده این روز ذخیره شد");
  };
  $("#note").oninput = (e) => {
    state.note = e.target.value;
    saveDay();
  };
  document.querySelectorAll("[data-nav]").forEach(
    (x) =>
      (x.onclick = () => {
        const n = x.dataset.nav;
        if (n === "calendar" || n === "report") {
          state.panel = n;
          render();
        } else if (n === "today") openDay(todayISO());
        else document.getElementById(n).scrollIntoView({ behavior: "smooth" });
      }),
  );
  document
    .querySelectorAll("[data-date]")
    .forEach((x) => (x.onclick = () => openDay(x.dataset.date)));
  if ($("#close-panel"))
    $("#close-panel").onclick = () => {
      state.panel = null;
      render();
    };
  if ($("#prev-month"))
    $("#prev-month").onclick = () => {
      state.calendarDate = new Date(
        state.calendarDate.getFullYear(),
        state.calendarDate.getMonth() + 1,
        1,
      );
      render();
    };
  if ($("#next-month"))
    $("#next-month").onclick = () => {
      state.calendarDate = new Date(
        state.calendarDate.getFullYear(),
        state.calendarDate.getMonth() - 1,
        1,
      );
      render();
    };
  if ($("#back-today")) $("#back-today").onclick = () => openDay(todayISO());
}
render();
