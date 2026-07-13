const state = {
  scene: "invite",
  shyMoves: 0,
  mood: "",
  day: "",
  time: "",
  food: "",
  plan: null,
};

const shyCopy = [
  "我再装一下矜持",
  "嘴硬是吧",
  "其实你想点左边",
  "给你三秒反悔",
  "好啦，不逗你了",
];

const loadingLines = [
  "正在分析氛围、时间和食物之间的关系。",
  "正在推理怎样开场最不尴尬。",
  "正在把路线排成刚刚好的节奏。",
  "正在把你的选择写成可以发送的约会卡。",
];

const planLibrary = {
  轻松散步: {
    route: [
      ["18:30", "低压力碰面", "找一个好认的路口见面，先不要把气氛弄得太正式。"],
      ["19:00", "一起慢慢走", "选一段有橱窗和树影的路，边走边聊最近的小事。"],
      ["20:10", "甜一点收尾", "找一家甜品或咖啡店坐下，把告别留得轻一点。"],
    ],
    line: "那天见。别迟到，我会假装没有很期待。",
    hisTask: "准时出现，然后主动说一句“今天这个安排不错”。",
    myTrick: "准备一条不赶路的散步路线，让沉默也不尴尬。",
  },
  一起吃点好的: {
    route: [
      ["18:20", "先见面再决定", "把餐厅选在交通方便的地方，给他一点参与感。"],
      ["19:00", "认真吃饭", "点一两道适合分享的菜，让聊天自然发生。"],
      ["20:40", "饭后转场", "如果气氛不错，就顺路买杯喝的再走一段。"],
    ],
    line: "我今天想吃点好的，刚好也想见你。你负责出现就行。",
    hisTask: "别只顾着吃，记得夸一句“你选得还挺会”。",
    myTrick: "提前备两个餐厅选项，看起来随性，其实都不错。",
  },
  看电影不说话也行: {
    route: [
      ["17:40", "提前碰头", "电影前留 20 分钟买饮料，避免一见面就进影厅。"],
      ["18:10", "小厅电影", "选一部不太沉重的片子，结束后有话题可以接。"],
      ["20:20", "聊一幕喜欢的", "不用深聊，就从最喜欢的一幕开始。"],
    ],
    line: "我们去看个电影吧，不说话也没关系，坐在一起就算见面。",
    hisTask: "负责选爆米花口味，也负责不剧透。",
    myTrick: "选靠后但不偏的位置，让这件事舒服一点。",
  },
  找个地方慢慢聊: {
    route: [
      ["19:00", "安静入座", "找一家不吵、不催人的店，位置比菜单更重要。"],
      ["19:30", "从近况开始", "聊最近让人开心的小事，不急着聊太重的话题。"],
      ["21:00", "留一个下次话题", "结束前自然提一句“这个下次可以一起去”。"],
    ],
    line: "我想找个地方慢慢聊，不赶时间，也不装得很随便。",
    hisTask: "少看手机，多问一句“然后呢”。",
    myTrick: "准备三个轻松话题，让空气不会突然安静。",
  },
  有点暧昧: {
    route: [
      ["18:50", "刚好遇见", "把见面说得轻一点，但路线安排得认真一点。"],
      ["19:30", "共享一份东西", "点一份适合一起吃的甜品或小食，制造一点靠近。"],
      ["20:40", "夜风收尾", "走到路口再告别，留下“下次见”的空间。"],
    ],
    line: "我有一个不太普通的小计划，你要不要配合我一下？",
    hisTask: "别太紧张，但也别太淡定。",
    myTrick: "把惊喜藏得不明显，让他回去以后才反应过来。",
  },
  像第一次约会: {
    route: [
      ["16:30", "正式一点点", "选一个拍照好看但不浮夸的地方见面。"],
      ["17:20", "轻活动破冰", "一起逛展、书店或市集，让聊天有东西可以接。"],
      ["19:00", "晚餐确认心情", "吃饭时把节奏放慢，不急着定义这次见面。"],
    ],
    line: "就当是第一次约会吧，但我们可以不用表现得太像第一次。",
    hisTask: "记得准时，也记得看着我说话。",
    myTrick: "穿一件有记忆点的单品，让今天被他记住。",
  },
};

const checklistItems = [
  "提前确认地点营业时间",
  "把路线截图，别现场手忙脚乱",
  "穿一件舒服但有记忆点的单品",
  "准备一个轻松话题",
  "结束前自然留一个下次见面的伏笔",
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
  scenes: {
    invite: $("#inviteScene"),
    confirm: $("#confirmScene"),
    mood: $("#moodScene"),
    time: $("#timeScene"),
    food: $("#foodScene"),
    generating: $("#generatingScene"),
    result: $("#resultScene"),
    checklist: $("#checklistScene"),
  },
  yesButton: $("#yesButton"),
  shyButton: $("#shyButton"),
  runawayZone: $("#runawayZone"),
  inviteHint: $("#inviteHint"),
  dealButton: $("#dealButton"),
  expectButton: $("#expectButton"),
  moodOptions: $("#moodOptions"),
  dayOptions: $("#dayOptions"),
  timeOptions: $("#timeOptions"),
  timeNextButton: $("#timeNextButton"),
  foodOptions: $("#foodOptions"),
  loadingText: $("#loadingText"),
  progressFill: $("#progressFill"),
  resultTitle: $("#resultTitle"),
  scoreBadge: $("#scoreBadge"),
  whenText: $("#whenText"),
  vibeText: $("#vibeText"),
  foodText: $("#foodText"),
  timeline: $("#timeline"),
  openingLine: $("#openingLine"),
  hisTask: $("#hisTask"),
  myTrick: $("#myTrick"),
  copyButton: $("#copyButton"),
  sendButton: $("#sendButton"),
  checklistButton: $("#checklistButton"),
  againButton: $("#againButton"),
  checklist: $("#checklist"),
  doneCount: $("#doneCount"),
  backResultButton: $("#backResultButton"),
  toast: $("#toast"),
  railSteps: $$(".app-rail span"),
  reasoningText: $("#reasoningText"),
};

function getApiUrl(path) {
  const backendPort = "4173";
  const backendOrigin = `${window.location.protocol}//${window.location.hostname}:${backendPort}`;
  const sameBackend = window.location.port === backendPort || !window.location.port;
  return sameBackend ? path : `${backendOrigin}${path}`;
}

function showScene(scene) {
  state.scene = scene;
  Object.entries(elements.scenes).forEach(([name, element]) => {
    element.classList.toggle("is-active", name === scene);
  });
  updateRail(scene);
}

function updateRail(scene) {
  const current = scene === "confirm" ? "invite" : scene === "time" || scene === "food" ? "mood" : scene;
  elements.railSteps.forEach((step) => {
    step.classList.toggle("is-current", step.dataset.step === current);
  });
}

function moveShyButton() {
  const compact = window.matchMedia("(max-width: 520px)").matches;
  const positions = compact
    ? [
        { left: 176, top: 0, rotate: 0 },
        { left: 72, top: 62, rotate: -3 },
        { left: 18, top: 8, rotate: 4 },
        { left: 166, top: 58, rotate: 3 },
        { left: 98, top: 28, rotate: -4 },
      ]
    : [
        { left: 196, top: 0, rotate: 0 },
        { left: 92, top: 62, rotate: -3 },
        { left: 12, top: 8, rotate: 4 },
        { left: 196, top: 58, rotate: 3 },
        { left: 122, top: 28, rotate: -4 },
      ];

  state.shyMoves += 1;
  const position = positions[state.shyMoves % positions.length];
  elements.shyButton.style.left = `${position.left}px`;
  elements.shyButton.style.top = `${position.top}px`;
  elements.shyButton.style.transform = `rotate(${position.rotate}deg)`;
  elements.shyButton.textContent = shyCopy[state.shyMoves % shyCopy.length];

  if (state.shyMoves >= 4) {
    elements.inviteHint.textContent = "好吧，嘴硬也算一种期待。";
  }
}

function selectOption(container, button) {
  container.querySelectorAll("button").forEach((item) => {
    item.classList.toggle("is-selected", item === button);
  });
}

function updateTimeButton() {
  elements.timeNextButton.disabled = !state.day || !state.time;
}

function buildPlan() {
  const base = planLibrary[state.mood] || planLibrary["轻松散步"];
  const food = state.food === "让 AI 猜" ? suggestFood(state.mood) : state.food;
  const score = 91 + ((state.mood.length + state.time.length + food.length) % 7);

  return {
    title: "好了，这是我们的见面计划。",
    score,
    when: `${state.day} · ${state.time}`,
    vibe: state.mood,
    food,
    route: tuneRouteTimes(base.route, state.time),
    line: base.line,
    hisTask: base.hisTask,
    myTrick: food === "甜品" ? "把薯片当成暗号，再用甜品把气氛收住。" : base.myTrick,
    reasoning:
      "本地备用方案：先降低见面压力，再把聊天和转场安排成自然递进，最后留一个可以延续到下次见面的收尾。",
  };
}

function suggestFood(mood) {
  const map = {
    轻松散步: "咖啡",
    一起吃点好的: "烤肉",
    看电影不说话也行: "甜品",
    找个地方慢慢聊: "日料",
    有点暧昧: "甜品",
    像第一次约会: "咖啡",
  };
  return map[mood] || "甜品";
}

function tuneRouteTimes(route, time) {
  const starts = {
    午后: ["14:30", "15:20", "16:30"],
    傍晚: ["18:20", "19:00", "20:10"],
    晚饭后: ["19:40", "20:20", "21:20"],
    夜一点也行: ["21:00", "21:40", "22:30"],
  };
  const selectedTimes = starts[time] || starts["傍晚"];
  return route.map((item, index) => [selectedTimes[index], item[1], item[2]]);
}

function renderPlan(plan) {
  elements.resultTitle.textContent = plan.title;
  elements.scoreBadge.textContent = `${plan.score}%`;
  elements.whenText.textContent = plan.when;
  elements.vibeText.textContent = plan.vibe;
  elements.foodText.textContent = plan.food;
  elements.openingLine.textContent = plan.line;
  elements.hisTask.textContent = plan.hisTask;
  elements.myTrick.textContent = plan.myTrick;
  elements.reasoningText.textContent = plan.reasoning || "AI 已根据你的选择完成推理。";

  elements.timeline.innerHTML = plan.route
    .map(
      ([time, title, detail]) => `
        <article class="timeline-item">
          <time>${time}</time>
          <div>
            <strong>${title}</strong>
            <p>${detail}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

async function requestAiPlan() {
  const response = await fetch(getApiUrl("/api/plan"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      mood: state.mood,
      day: state.day,
      time: state.time,
      food: state.food,
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok || !data.plan) {
    throw new Error(data.error || "AI 推理失败");
  }

  return data.plan;
}

function startGenerating() {
  showScene("generating");
  elements.progressFill.style.width = "0%";
  let index = 0;
  elements.loadingText.textContent = loadingLines[index];

  const interval = window.setInterval(() => {
    index += 1;
    elements.loadingText.textContent = loadingLines[index % loadingLines.length];
    elements.progressFill.style.width = `${Math.min(100, index * 28)}%`;
  }, 520);

  const fallbackTimeout = window.setTimeout(() => {
    window.clearInterval(interval);
    state.plan = buildPlan();
    renderPlan(state.plan);
    showToast("AI 暂时没接上，已生成本地方案");
    showScene("result");
  }, 12000);

  requestAiPlan()
    .then((plan) => {
      window.clearInterval(interval);
      window.clearTimeout(fallbackTimeout);
      elements.progressFill.style.width = "100%";
      state.plan = normalizePlan(plan);
      renderPlan(state.plan);
      showScene("result");
    })
    .catch((error) => {
      window.clearInterval(interval);
      window.clearTimeout(fallbackTimeout);
      state.plan = buildPlan();
      renderPlan(state.plan);
      showToast(error.message || "AI 暂时没接上，已生成本地方案");
      showScene("result");
    });
}

function normalizePlan(plan) {
  const fallback = buildPlan();
  return {
    title: plan.title || fallback.title,
    score: Number(plan.score) || fallback.score,
    when: plan.when || fallback.when,
    vibe: plan.vibe || fallback.vibe,
    food: plan.food || fallback.food,
    route: Array.isArray(plan.route) && plan.route.length ? plan.route.slice(0, 3) : fallback.route,
    line: plan.line || fallback.line,
    hisTask: plan.hisTask || fallback.hisTask,
    myTrick: plan.myTrick || fallback.myTrick,
    reasoning: plan.reasoning || fallback.reasoning,
  };
}

function renderChecklist() {
  elements.checklist.innerHTML = checklistItems
    .map(
      (item, index) => `
        <label class="check-item">
          <input type="checkbox" data-check="${index}" />
          <span>${item}</span>
        </label>
      `,
    )
    .join("");
  updateDoneCount();
}

function updateDoneCount() {
  const checked = $$("#checklist input:checked").length;
  elements.doneCount.textContent = `${checked}/${checklistItems.length}`;
}

function showToast(text) {
  elements.toast.textContent = text;
  elements.toast.classList.add("is-visible");
  window.setTimeout(() => elements.toast.classList.remove("is-visible"), 1300);
}

async function sendSelection() {
  if (!state.plan) return;

  elements.sendButton.disabled = true;
  elements.sendButton.textContent = "正在发送...";

  try {
    const response = await fetch(getApiUrl("/api/submit"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        mood: state.mood,
        day: state.day,
        time: state.time,
        food: state.plan.food,
        line: state.plan.line,
        score: state.plan.score,
        plan: state.plan,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "发送失败");
    }

    elements.sendButton.textContent = "已经发到邮箱";
    showToast("已发送到 2045083228@qq.com");
  } catch (error) {
    elements.sendButton.disabled = false;
    elements.sendButton.textContent = "把我的选择发给你";
    showToast(error.message || "发送失败");
  }
}

function resetFlow() {
  state.shyMoves = 0;
  state.mood = "";
  state.day = "";
  state.time = "";
  state.food = "";
  state.plan = null;
  elements.shyButton.style.left = "";
  elements.shyButton.style.top = "";
  elements.shyButton.style.transform = "";
  elements.shyButton.textContent = shyCopy[0];
  elements.inviteHint.textContent = "偷偷提示：右边那个按钮有点嘴硬。";
  $$(".is-selected").forEach((item) => item.classList.remove("is-selected"));
  updateTimeButton();
  showScene("invite");
}

elements.yesButton.addEventListener("click", () => showScene("confirm"));
elements.dealButton.addEventListener("click", () => showScene("mood"));
elements.expectButton.addEventListener("click", () => {
  showToast("没关系，我来安排。");
  showScene("mood");
});

elements.shyButton.addEventListener("pointerenter", moveShyButton);
elements.shyButton.addEventListener("click", (event) => {
  event.preventDefault();
  moveShyButton();
});

elements.moodOptions.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mood]");
  if (!button) return;
  state.mood = button.dataset.mood;
  selectOption(elements.moodOptions, button);
  window.setTimeout(() => showScene("time"), 240);
});

elements.dayOptions.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-day]");
  if (!button) return;
  state.day = button.dataset.day;
  selectOption(elements.dayOptions, button);
  updateTimeButton();
});

elements.timeOptions.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-time]");
  if (!button) return;
  state.time = button.dataset.time;
  selectOption(elements.timeOptions, button);
  updateTimeButton();
});

elements.timeNextButton.addEventListener("click", () => {
  if (!state.day || !state.time) return;
  showScene("food");
});

elements.foodOptions.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-food]");
  if (!button) return;
  state.food = button.dataset.food;
  selectOption(elements.foodOptions, button);
  window.setTimeout(startGenerating, 260);
});

elements.copyButton.addEventListener("click", async () => {
  const text = elements.openingLine.textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast("已复制这句话");
  } catch {
    showToast(text);
  }
});

elements.sendButton.addEventListener("click", sendSelection);
elements.checklistButton.addEventListener("click", () => showScene("checklist"));
elements.backResultButton.addEventListener("click", () => showScene("result"));
elements.againButton.addEventListener("click", resetFlow);
elements.checklist.addEventListener("change", updateDoneCount);

renderChecklist();
showScene("invite");
