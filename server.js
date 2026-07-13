const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");
const tls = require("node:tls");
const crypto = require("node:crypto");

const root = __dirname;
loadEnvFile(path.join(root, ".env"));

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const recipientEmail = process.env.RECIPIENT_EMAIL || "2045083228@qq.com";
const moonshotApiKey = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY || "";
const moonshotBaseUrl = process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1/chat/completions";
const moonshotModel = process.env.KIMI_MODEL || "moonshot-v1-8k";

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

const systemPrompt = `
你是 Oops, It's a Date 的专属约会策划 AI。
你的任务是根据用户选择的氛围、日期、时间段和食物，推理出一张可以直接发送给对方的约会卡。

输出必须是严格 JSON，不要 Markdown，不要解释，不要代码块。字段如下：
{
  "title": "不超过 18 个中文字符的计划标题",
  "score": 91 到 98 的整数，代表心动匹配度",
  "when": "日期 · 时间段",
  "vibe": "用户选择的氛围",
  "food": "如果用户选择让 AI 猜，给出一个具体食物；否则沿用用户选择",
  "route": [
    ["HH:mm", "短标题", "一句具体行动建议"],
    ["HH:mm", "短标题", "一句具体行动建议"],
    ["HH:mm", "短标题", "一句具体行动建议"]
  ],
  "line": "一句可以复制发送给对方的邀约话术，暧昧但不油腻",
  "hisTask": "给对方的一句话任务",
  "myTrick": "给发起者的一句话小心机",
  "reasoning": "用 70 字以内说明你如何根据选择推理出这个安排"
}

风格要求：
- 中文输出，轻松、聪明、有一点暧昧，但不要夸张表白。
- 安排要像真实能执行的城市约会，不要写空泛形容词。
- route 的时间必须匹配用户选择的时间段：午后从 14:00-17:30，傍晚从 18:00-20:30，晚饭后从 19:30-22:00，夜一点也行从 21:00-23:30。
- 不要编造真实店名、地址、价格、联系方式。
`.trim();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}

function sendOptions(response) {
  response.writeHead(204, {
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-origin": "*",
  });
  response.end();
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 64 * 1024) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

function validateSelection(payload) {
  for (const key of ["mood", "day", "time", "food"]) {
    if (!payload[key] || typeof payload[key] !== "string") {
      throw new Error("请选择完整的约会信息");
    }
  }
}

async function callKimi(payload) {
  if (!moonshotApiKey) {
    throw new Error("请先配置 KIMI_API_KEY 或 MOONSHOT_API_KEY");
  }

  const response = await fetch(moonshotBaseUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${moonshotApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: moonshotModel,
      temperature: 0.72,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            mood: payload.mood,
            day: payload.day,
            time: payload.time,
            food: payload.food,
          }),
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "Kimi API 调用失败");
  }

  const content = data.choices?.[0]?.message?.content || "";
  const plan = safeJsonParse(content);
  if (!plan) {
    throw new Error("Kimi 返回内容不是有效 JSON");
  }

  return normalizePlan(plan, payload);
}

function normalizePlan(plan, payload) {
  const food = payload.food === "让 AI 猜" ? plan.food || "甜品" : payload.food;
  return {
    title: String(plan.title || "好了，这是我们的见面计划。").slice(0, 32),
    score: Math.max(91, Math.min(98, Number(plan.score) || 94)),
    when: `${payload.day} · ${payload.time}`,
    vibe: payload.mood,
    food,
    route: normalizeRoute(plan.route),
    line: String(plan.line || "那天见。别迟到，我会假装没有很期待。"),
    hisTask: String(plan.hisTask || "准时出现，然后认真听我说话。"),
    myTrick: String(plan.myTrick || "准备一个不明显但会被记住的小惊喜。"),
    reasoning: String(plan.reasoning || "AI 根据氛围、时间和食物，把见面节奏安排成先放松、再靠近、最后自然收尾。"),
  };
}

function normalizeRoute(route) {
  const fallback = [
    ["18:20", "低压力碰面", "找一个好认的路口见面，先不要把气氛弄得太正式。"],
    ["19:00", "一起慢慢走", "选一段有橱窗和树影的路，边走边聊最近的小事。"],
    ["20:10", "甜一点收尾", "找一家甜品或咖啡店坐下，把告别留得轻一点。"],
  ];
  if (!Array.isArray(route)) return fallback;
  return route.slice(0, 3).map((item, index) => {
    if (!Array.isArray(item) || item.length < 3) return fallback[index];
    return [String(item[0]), String(item[1]), String(item[2])];
  });
}

function formatEmailHtml(payload) {
  const plan = payload.plan || {};
  const rows = Array.isArray(plan.route)
    ? plan.route
        .map(
          ([time, title, detail]) =>
            `<tr><td style="padding:8px 12px;border:1px solid #f0c7d5;"><strong>${escapeHtml(time)}</strong></td><td style="padding:8px 12px;border:1px solid #f0c7d5;">${escapeHtml(title)}<br><span style="color:#6e5d63;">${escapeHtml(detail)}</span></td></tr>`,
        )
        .join("")
    : "";

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.6;color:#171012;">
      <h2>Oops, It's a Date</h2>
      <p><strong>WHEN:</strong> ${escapeHtml(plan.when || `${payload.day} · ${payload.time}`)}</p>
      <p><strong>VIBE:</strong> ${escapeHtml(plan.vibe || payload.mood)}</p>
      <p><strong>MENU:</strong> ${escapeHtml(plan.food || payload.food)}</p>
      <p><strong>SCORE:</strong> ${escapeHtml(String(plan.score || payload.score || ""))}%</p>
      <table style="border-collapse:collapse;margin:16px 0;">${rows}</table>
      <p><strong>邀约话术：</strong>${escapeHtml(plan.line || payload.line || "")}</p>
      <p><strong>AI 推理：</strong>${escapeHtml(plan.reasoning || "")}</p>
      <p><strong>你的任务：</strong>${escapeHtml(plan.hisTask || "")}</p>
      <p><strong>我的小心机：</strong>${escapeHtml(plan.myTrick || "")}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendMail(payload) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false";

  console.log("[Mail Debug] SMTP_HOST:", host ? "已设置" : "未设置");
  console.log("[Mail Debug] SMTP_USER:", user ? "已设置" : "未设置");
  console.log("[Mail Debug] SMTP_PASS:", pass ? "已设置" : "未设置");
  console.log("[Mail Debug] SMTP_FROM:", from ? "已设置" : "未设置");
  console.log("[Mail Debug] SMTP_PORT:", smtpPort);
  console.log("[Mail Debug] SMTP_SECURE:", secure);

  if (!host || !user || !pass || !from) {
    throw new Error("请配置 SMTP_HOST、SMTP_USER、SMTP_PASS 和 SMTP_FROM");
  }

  const subject = `你的 AI 约会卡：${payload.plan?.vibe || payload.mood} · ${payload.plan?.food || payload.food}`;
  const html = formatEmailHtml(payload);
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const raw = buildEmail({ from, to: recipientEmail, subject, html, text });
  await smtpSend({ host, port: smtpPort, secure, user, pass, from, to: recipientEmail, raw });
}

function buildEmail({ from, to, subject, html, text }) {
  const boundary = `boundary_${crypto.randomBytes(12).toString("hex")}`;
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(text).toString("base64"),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(html).toString("base64"),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

function smtpSend({ host, port, secure, user, pass, from, to, raw }) {
  return new Promise((resolve, reject) => {
    const socket = secure ? tls.connect(port, host) : net.connect(port, host);
    let buffer = "";

    const fail = (error) => {
      socket.destroy();
      reject(error instanceof Error ? error : new Error(String(error)));
    };
    const write = (line) => socket.write(`${line}\r\n`);
    const wait = (expected) =>
      new Promise((stepResolve, stepReject) => {
        const timeout = setTimeout(() => stepReject(new Error("SMTP 响应超时")), 12000);
        const onData = (chunk) => {
          buffer += chunk.toString("utf8");
          const lines = buffer.split(/\r?\n/).filter(Boolean);
          const last = lines.at(-1) || "";
          if (!last.match(/^\d{3}[ -]/)) return;
          if (last[3] === "-") return;
          socket.off("data", onData);
          clearTimeout(timeout);
          const code = Number(last.slice(0, 3));
          if (expected.includes(code)) stepResolve(code);
          else stepReject(new Error(`SMTP 返回 ${last}`));
        };
        socket.on("data", onData);
      });

    socket.once("error", fail);
    socket.once("connect", async () => {
      try {
        await wait([220]);
        write(`EHLO localhost`);
        await wait([250]);
        write("AUTH LOGIN");
        await wait([334]);
        write(Buffer.from(user).toString("base64"));
        await wait([334]);
        write(Buffer.from(pass).toString("base64"));
        await wait([235]);
        write(`MAIL FROM:<${from}>`);
        await wait([250]);
        write(`RCPT TO:<${to}>`);
        await wait([250, 251]);
        write("DATA");
        await wait([354]);
        socket.write(`${raw}\r\n.\r\n`);
        await wait([250]);
        write("QUIT");
        resolve();
      } catch (error) {
        fail(error);
      }
    });
  });
}

function serveFile(response, pathname) {
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": types[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === "OPTIONS") {
      return sendOptions(response);
    }

    if (url.pathname === "/api/plan") {
      if (request.method !== "POST") return sendJson(response, 405, { ok: false, error: "Method not allowed" });
      const payload = JSON.parse(await readBody(request));
      validateSelection(payload);
      const plan = await callKimi(payload);
      return sendJson(response, 200, { ok: true, plan });
    }

    if (url.pathname === "/api/submit") {
      if (request.method !== "POST") return sendJson(response, 405, { ok: false, error: "Method not allowed" });
      const payload = JSON.parse(await readBody(request));
      await sendMail(payload);
      return sendJson(response, 200, { ok: true, sentTo: recipientEmail });
    }
  } catch (error) {
    return sendJson(response, 400, { ok: false, error: error.message || "请求失败" });
  }

  serveFile(response, decodeURIComponent(url.pathname));
});

server.listen(port, host, () => {
  console.log(`Oops, It's a Date AI app running at http://${host}:${port}/`);
});
