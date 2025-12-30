import express from "express";
import cors from "cors";
import OpenAI from "openai";
import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICES_PATH = path.join(__dirname, "services.json");
const CONFIG_PATH = path.join(__dirname, "config.json");
const APPOINTMENTS_PATH = path.join(__dirname, "appointments.json");

let services = [];
async function loadServices() {
  try {
    const raw = await fs.readFile(SERVICES_PATH, "utf-8");
    services = JSON.parse(raw);
  } catch {
    services = [
      { id: "svc-1", name: "Corte de Cabelo", price: 60, durationMin: 45, description: "Corte masculino com finalização", category: "Cabelo" },
      { id: "svc-2", name: "Barba", price: 40, durationMin: 30, description: "Aparar e desenhar a barba", category: "Barba" },
      { id: "svc-3", name: "Hidratação", price: 80, durationMin: 50, description: "Tratamento capilar hidratante", category: "Tratamento" },
    ];
    await fs.writeFile(SERVICES_PATH, JSON.stringify(services, null, 2));
  }
}

async function saveServices() {
  await fs.writeFile(SERVICES_PATH, JSON.stringify(services, null, 2));
}

let assistantSettings = {
  assistantName: "Assistente AgendaPro",
  tone: "Profissional",
  greeting: "Olá! 👋 Sou o assistente virtual. Como posso ajudar você hoje?",
  embedUrl: "",
  customInstructions: "",
  assistantTheme: {
    presetIndex: 0,
    showHeader: true,
    bubbleRadius: "xl"
  }
};

async function loadAssistantSettings() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    assistantSettings = JSON.parse(raw);
  } catch {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(assistantSettings, null, 2));
  }
}

async function saveAssistantSettings() {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(assistantSettings, null, 2));
}

const conversations = new Map();
function getHistory(conversationId) {
  if (!conversationId) return [];
  const h = conversations.get(conversationId);
  return Array.isArray(h) ? h : [];
}
function setHistory(conversationId, history) {
  if (!conversationId) return;
  const max = 20;
  const trimmed = history.slice(-max);
  conversations.set(conversationId, trimmed);
}

// Services API
app.get("/api/services", async (req, res) => {
  if (!services.length) await loadServices();
  res.json({ services });
});

app.post("/api/services", async (req, res) => {
  const { name, price, durationMin, description, category } = req.body || {};
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name_required" });
  const id = `svc-${Date.now()}`;
  const item = {
    id,
    name,
    price: typeof price === "number" ? price : 0,
    durationMin: typeof durationMin === "number" ? durationMin : 30,
    description: typeof description === "string" ? description : "",
    category: typeof category === "string" ? category : ""
  };
  services.push(item);
  await saveServices();
  res.status(201).json({ service: item });
});

app.put("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  const idx = services.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: "not_found" });
  const { name, price, durationMin, description, category } = req.body || {};
  services[idx] = {
    ...services[idx],
    ...(typeof name === "string" ? { name } : {}),
    ...(typeof price === "number" ? { price } : {}),
    ...(typeof durationMin === "number" ? { durationMin } : {}),
    ...(typeof description === "string" ? { description } : {}),
    ...(typeof category === "string" ? { category } : {}),
  };
  await saveServices();
  res.json({ service: services[idx] });
});

app.delete("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  const before = services.length;
  services = services.filter((s) => s.id !== id);
  if (services.length === before) return res.status(404).json({ error: "not_found" });
  await saveServices();
  res.status(204).end();
});

app.get("/api/assistant/settings", async (req, res) => {
  await loadAssistantSettings();
  res.json({ settings: assistantSettings });
});

app.put("/api/assistant/settings", async (req, res) => {
  const b = req.body || {};
  assistantSettings = {
    ...assistantSettings,
    ...(typeof b.assistantName === "string" ? { assistantName: b.assistantName } : {}),
    ...(typeof b.tone === "string" ? { tone: b.tone } : {}),
    ...(typeof b.greeting === "string" ? { greeting: b.greeting } : {}),
    ...(typeof b.embedUrl === "string" ? { embedUrl: b.embedUrl } : {}),
    ...(typeof b.customInstructions === "string" ? { customInstructions: b.customInstructions } : {}),
    ...(b.assistantTheme && typeof b.assistantTheme === "object" ? { assistantTheme: { ...assistantSettings.assistantTheme, ...b.assistantTheme } } : {}),
  };
  await saveAssistantSettings();
  res.json({ settings: assistantSettings });
});

app.get("/api/settings", async (req, res) => {
  await loadAssistantSettings();
  res.json({ settings: assistantSettings });
});

app.put("/api/settings", async (req, res) => {
  const b = req.body || {};
  function merge(a, b) {
    if (Array.isArray(a) || Array.isArray(b) || typeof a !== "object" || typeof b !== "object") return b;
    const out = { ...a };
    for (const k of Object.keys(b)) {
      out[k] = merge(a?.[k], b[k]);
    }
    return out;
  }
  assistantSettings = merge(assistantSettings, b);
  await saveAssistantSettings();
  res.json({ settings: assistantSettings });
});

app.get("/api/appointments", async (req, res) => {
  await loadAppointments();
  res.json({ appointments });
});

app.get("/api/appointments/:date", async (req, res) => {
  await loadAppointments();
  const { date } = req.params;
  const list = appointments.filter((a) => a.date === date);
  res.json({ appointments: list });
});

app.get("/api/availability", async (req, res) => {
  await loadAppointments();
  await loadAssistantSettings();
  const date = typeof req.query.date === "string" ? req.query.date : null;
  const durationMin = parseInt(String(req.query.durationMin || "45"), 10);
  if (!date) return res.status(400).json({ error: "invalid_date" });
  const av = computeAvailability(date, isNaN(durationMin) ? 45 : durationMin);
  res.json(av);
});

app.post("/api/appointments", async (req, res) => {
  await loadAppointments();
  await loadAssistantSettings();
  const b = req.body || {};
  const { date, startTime, durationMin, clientName, serviceId, serviceName } = b;
  if (!date || !startTime || !durationMin || !clientName || !(serviceId || serviceName)) {
    return res.status(400).json({ error: "invalid_request" });
  }
  const dur = parseInt(String(durationMin), 10);
  const wh = workingHours(date);
  if (!wh) return res.status(400).json({ error: "outside_hours" });
  const startMin = toMinutes(startTime);
  const endMin = startMin + dur;
  if (startMin < toMinutes(wh.start) || endMin > toMinutes(wh.end)) {
    return res.status(400).json({ error: "outside_hours" });
  }
  const conflict = appointments.some((a) => a.date === date && overlaps(toMinutes(a.startTime), a.durationMin, toMinutes(startTime), dur));
  if (conflict) return res.status(409).json({ error: "conflict" });
  const id = `apt-${Date.now()}`;
  const svc = serviceId ? services.find((s) => s.id === serviceId) : findServiceByNameFragment(serviceName);
  const record = { id, date, startTime, durationMin: dur, clientName, serviceId: svc?.id || serviceId || "", serviceName: svc?.name || serviceName || "" };
  appointments.push(record);
  await saveAppointments();
  res.status(201).json({ appointment: record });
});

// Marca um agendamento como pago
app.put("/api/appointments/:id/pay", async (req, res) => {
  await loadAppointments();
  const { id } = req.params;
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: "not_found" });
  appointments[idx] = { ...appointments[idx], paid: true };
  await saveAppointments();
  res.json({ appointment: appointments[idx] });
});

// Receita semanal: previsão vs. real
app.get("/api/revenue/weekly", async (req, res) => {
  await loadAppointments();
  await loadServices();

  // Dias da semana em PT-BR (Segunda a Domingo)
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const today = new Date();
  // Encontra a segunda-feira da semana atual
  const monday = new Date(today);
  const dayOfWeek = monday.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const diffToMonday = (dayOfWeek + 6) % 7; // transforma para offset a partir de segunda
  monday.setDate(monday.getDate() - diffToMonday);

  const weeklyData = days.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayAppts = appointments.filter((a) => a.date === dateStr);
    const previsao = dayAppts.reduce((sum, a) => {
      const svc = services.find((s) => s.id === a.serviceId);
      return sum + (svc ? Number(svc.price) || 0 : 0);
    }, 0);
    const realTotal = dayAppts.reduce((sum, a) => {
      const svc = services.find((s) => s.id === a.serviceId);
      const isPaid = Boolean(a.paid);
      return sum + (isPaid && svc ? Number(svc.price) || 0 : 0);
    }, 0);

    return {
      name: label,
      previsao,
      real: realTotal > 0 ? realTotal : null,
    };
  });

  res.json({ data: weeklyData });
});

const getClient = () => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const project = process.env.OPENAI_PROJECT;
  return new OpenAI(project ? { apiKey: key, project } : { apiKey: key });
};

app.post("/api/assistant", async (req, res) => {
  const { message, conversationId } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "invalid_request" });
  }
  try {
    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: "missing_api_key" });
    }
    await loadAssistantSettings();
    const model = process.env.ASSISTANT_MODEL || "gpt-4o-mini";
    const baseSystem = process.env.ASSISTANT_SYSTEM_PROMPT || "Você é um atendente humano, conversando com um cliente final que deseja contratar um serviço. Fale em português do Brasil, de forma natural, acolhedora e clara. Faça perguntas objetivas, uma por vez, para entender serviço desejado, preferências de horário e dados de contato. Evite jargões e longas listas, ofereça opções quando necessário e confirme detalhes antes de prosseguir.";
    const guidance = (assistantSettings.customInstructions && assistantSettings.customInstructions.trim().length >= 5)
      ? assistantSettings.customInstructions
      : "Objetivo: ajudar o cliente final a escolher e contratar um serviço, conduzindo um agendamento quando apropriado. Estilo: humano, cordial, claro, sem jargões. Uma pergunta por vez. Frases curtas. Use emojis com moderação. Fluxo: apresente-se; identifique serviço; colete preferências de horário; solicite nome e contato; reconfirme dados (serviço, data, hora, preço, duração); peça confirmação final; agradeça e informe próximos passos. Boas práticas: evite listas longas; proponha opções; peça esclarecimentos quando necessário; mantenha tom amigável e profissional; não exponha detalhes internos do sistema.";
    const system = `${baseSystem}\n\nNome do atendente: ${assistantSettings.assistantName}\nTom de voz preferido: ${assistantSettings.tone}\n\nDiretrizes personalizadas:\n${guidance}`;
    const cid = typeof conversationId === "string" && conversationId.length ? conversationId : `c-${Date.now()}`;
    const history = getHistory(cid);
    // availability enrichment
    const intent = extractBookingIntent(message);
    const svcHint = services.find((s) => new RegExp(s.name, "i").test(message));
    const durHint = svcHint?.durationMin || 45;
    const avText = intent.date
      ? (() => {
          const av = computeAvailability(intent.date, durHint);
          const requested = intent.time ? `${intent.time} está ${av.occupied.includes(intent.time) ? "ocupado" : av.free.includes(intent.time) ? "livre" : "fora do horário"}` : "sem horário específico";
          return `Disponibilidade (${intent.date}, ${durHint}min): livres: ${av.free.slice(0, 12).join(", ")} | ocupados: ${av.occupied.slice(0, 12).join(", ")} | pedido: ${requested}.`;
        })()
      : "";

    const response = await client.responses.create({
      model,
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "system", content: [{ type: "input_text", text: `Serviços disponíveis:\n${services.map(s => `• ${s.name} — R$ ${s.price}, ${s.durationMin}min`).join("\n")}` }] },
        avText ? { role: "system", content: [{ type: "input_text", text: avText }] } : null,
        ...history.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] })),
        { role: "user", content: [{ type: "input_text", text: message }] }
      ].filter(Boolean)
    });
    const text = response.output_text || "";
    // auto create appointment if user confirmed and slot free
    if (intent.confirm && intent.date && intent.time) {
      const wh = workingHours(intent.date);
      const startMin = toMinutes(intent.time || "00:00");
      const endMin = startMin + durHint;
      const within = wh && startMin >= toMinutes(wh.start) && endMin <= toMinutes(wh.end);
      const conflict = appointments.some((a) => a.date === intent.date && overlaps(toMinutes(a.startTime), a.durationMin, toMinutes(intent.time), durHint));
      if (within && !conflict) {
        const svc = svcHint || services[0];
        const record = { id: `apt-${Date.now()}`, date: intent.date, startTime: intent.time, durationMin: durHint, clientName: intent.clientName || "Cliente", serviceId: svc?.id || "", serviceName: svc?.name || "" };
        appointments.push(record);
        await saveAppointments();
      }
    }
    const nextHistory = [...history, { role: "user", content: message }, { role: "assistant", content: text }];
    setHistory(cid, nextHistory);
    return res.json({ content: text, conversationId: cid });
  } catch (e) {
    return res.status(500).json({ error: "openai_error" });
  }
});

app.get("/api/assistant/stream", async (req, res) => {
  const message = typeof req.query.message === "string" ? req.query.message : "";
  const conversationId = typeof req.query.conversationId === "string" ? req.query.conversationId : "";
  if (!message) {
    res.writeHead(400, { "Content-Type": "text/event-stream" });
    res.write("event:error\n");
    res.write("data: invalid_request\n\n");
    return res.end();
  }
  const client = getClient();
  if (!client) {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
    res.write("event:error\n");
    res.write("data: missing_api_key\n\n");
    return res.end();
  }
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
  try {
    await loadAssistantSettings();
    const model = process.env.ASSISTANT_MODEL || "gpt-4o-mini";
    const baseSystem = process.env.ASSISTANT_SYSTEM_PROMPT || "Você é um atendente humano, conversando com um cliente final que deseja contratar um serviço. Fale em português do Brasil, de forma natural, acolhedora e clara. Faça perguntas objetivas, uma por vez, para entender serviço desejado, preferências de horário e dados de contato. Evite jargões e longas listas, ofereça opções quando necessário e confirme detalhes antes de prosseguir.";
    const guidance = (assistantSettings.customInstructions && assistantSettings.customInstructions.trim().length >= 5)
      ? assistantSettings.customInstructions
      : "Objetivo: ajudar o cliente final a escolher e contratar um serviço, conduzindo um agendamento quando apropriado. Estilo: humano, cordial, claro, sem jargões. Uma pergunta por vez. Frases curtas. Use emojis com moderação. Fluxo: apresente-se; identifique serviço; colete preferências de horário; solicite nome e contato; reconfirme dados (serviço, data, hora, preço, duração); peça confirmação final; agradeça e informe próximos passos. Boas práticas: evite listas longas; proponha opções; peça esclarecimentos quando necessário; mantenha tom amigável e profissional; não exponha detalhes internos do sistema.";
    const system = `${baseSystem}\n\nNome do atendente: ${assistantSettings.assistantName}\nTom de voz preferido: ${assistantSettings.tone}\n\nDiretrizes personalizadas:\n${guidance}`;
    const cid = conversationId && conversationId.length ? conversationId : `c-${Date.now()}`;
    const history = getHistory(cid);
    const intent = extractBookingIntent(message);
    const svcHint = services.find((s) => new RegExp(s.name, "i").test(message));
    const durHint = svcHint?.durationMin || 45;
    const avText = intent.date
      ? (() => {
          const av = computeAvailability(intent.date, durHint);
          const requested = intent.time ? `${intent.time} está ${av.occupied.includes(intent.time) ? "ocupado" : av.free.includes(intent.time) ? "livre" : "fora do horário"}` : "sem horário específico";
          return `Disponibilidade (${intent.date}, ${durHint}min): livres: ${av.free.slice(0, 12).join(", ")} | ocupados: ${av.occupied.slice(0, 12).join(", ")} | pedido: ${requested}.`;
        })()
      : "";

    const stream = await client.responses.stream({
      model,
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "system", content: [{ type: "input_text", text: `Serviços disponíveis:\n${services.map(s => `• ${s.name} — R$ ${s.price}, ${s.durationMin}min`).join("\n")}` }] },
        avText ? { role: "system", content: [{ type: "input_text", text: avText }] } : null,
        ...history.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] })),
        { role: "user", content: [{ type: "input_text", text: message }] }
      ].filter(Boolean)
    });
    let acc = "";
    stream.on("text.delta", (delta) => {
      res.write(`data: ${JSON.stringify(delta)}\n\n`);
      acc += delta;
    });
    stream.on("message.stop", () => {
      if (intent.confirm && intent.date && intent.time) {
        const wh = workingHours(intent.date);
        const startMin = toMinutes(intent.time || "00:00");
        const endMin = startMin + durHint;
        const within = wh && startMin >= toMinutes(wh.start) && endMin <= toMinutes(wh.end);
        const conflict = appointments.some((a) => a.date === intent.date && overlaps(toMinutes(a.startTime), a.durationMin, toMinutes(intent.time), durHint));
        if (within && !conflict) {
          const svc = svcHint || services[0];
          const record = { id: `apt-${Date.now()}`, date: intent.date, startTime: intent.time, durationMin: durHint, clientName: intent.clientName || "Cliente", serviceId: svc?.id || "", serviceName: svc?.name || "" };
          appointments.push(record);
          saveAppointments();
        }
      }
      const nextHistory = [...history, { role: "user", content: message }, { role: "assistant", content: acc }];
      setHistory(cid, nextHistory);
      res.write(`event:cid\n`);
      res.write(`data: ${JSON.stringify({ conversationId: cid })}\n\n`);
      res.write("event:done\n");
      res.write("data: {}\n\n");
      res.end();
    });
    stream.on("error", () => {
      res.write("event:error\n");
      res.write("data: openai_error\n\n");
      res.end();
    });
    await stream.finalize();
  } catch {
    res.write("event:error\n");
    res.write("data: openai_error\n\n");
    res.end();
  }
});

app.get("/api/status", (req, res) => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  res.json({ hasKey });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  console.log(`Server listening on http://localhost:${port} | OPENAI_API_KEY loaded: ${hasKey}`);
  loadServices();
  loadAssistantSettings();
  loadAppointments();
});
let appointments = [];
const appointmentClients = new Set();
async function loadAppointments() {
  try {
    const raw = await fs.readFile(APPOINTMENTS_PATH, "utf-8");
    appointments = JSON.parse(raw);
  } catch {
    appointments = [];
    await fs.writeFile(APPOINTMENTS_PATH, JSON.stringify(appointments, null, 2));
  }
}
async function saveAppointments() {
  await fs.writeFile(APPOINTMENTS_PATH, JSON.stringify(appointments, null, 2));
  notifyAppointments();
}

function notifyAppointments() {
  const payload = `data: ${JSON.stringify({ appointments })}\n\n`;
  for (const res of appointmentClients) {
    try {
      res.write(payload);
    } catch {}
  }
}

app.get("/api/appointments/stream", async (req, res) => {
  await loadAppointments();
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  appointmentClients.add(res);
  res.write(`data: ${JSON.stringify({ appointments })}\n\n`);
  req.on("close", () => {
    appointmentClients.delete(res);
  });
});

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  return h * 60 + m;
}
function toHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function overlaps(aStart, aDur, bStart, bDur) {
  const aEnd = aStart + aDur;
  const bEnd = bStart + bDur;
  return aStart < bEnd && bStart < aEnd;
}
function workingHours(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = d.getDay();
  const idx = (dow + 6) % 7;
  const h = Array.isArray(assistantSettings?.hours) ? assistantSettings.hours[idx] : null;
  if (!h || h.open === false) return null;
  const start = typeof h.start === "string" ? h.start : "09:00";
  const end = typeof h.end === "string" ? h.end : "18:00";
  return { start, end };
}
function computeAvailability(dateStr, durationMin) {
  const wh = workingHours(dateStr);
  if (!wh) return { free: [], occupied: [], closed: true };
  const startMin = toMinutes(wh.start);
  const endMin = toMinutes(wh.end);
  const dayAppts = appointments.filter((a) => a.date === dateStr);
  const slotStep = 15; // 15-min granularity
  const free = [];
  const occupied = [];
  for (let s = startMin; s + durationMin <= endMin; s += slotStep) {
    const conflict = dayAppts.some((a) => overlaps(toMinutes(a.startTime), a.durationMin, s, durationMin));
    (conflict ? occupied : free).push(toHHMM(s));
  }
  return { free, occupied, closed: false };
}
function findServiceByNameFragment(name) {
  const norm = (x) => x.toLowerCase();
  const n = norm(name || "");
  return services.find((s) => norm(s.name).includes(n));
}
function extractBookingIntent(message) {
  const dateMatch = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  const timeMatch = message.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
  const confirm = /(confirmar|pode marcar|agendar|marcar)/i.test(message);
  // naive client name capture after "para "
  const clientMatch = message.match(/para\s+([A-Za-zÀ-ÿ'\-\s]{2,})/i);
  return {
    date: dateMatch ? dateMatch[1] : null,
    time: timeMatch ? timeMatch[0] : null,
    confirm,
    clientName: clientMatch ? clientMatch[1].trim() : null,
  };
}