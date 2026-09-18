export const WEDDING_ISO = "2026-10-10T16:00:00+08:00";
export const WEDDING_END_ISO = "2026-10-10T22:00:00+08:00";

export const couple = {
  groom: "顾清和",
  bride: "沈晚棠",
} as const;

export const venue = {
  name: "云栖庄园",
  city: "杭州 · 西湖",
  address: "浙江省杭州市西湖区梅灵北路 88 号",
  mapQuery: "杭州西湖 云栖庄园",
} as const;

export const letter = [
  "一茶一席，一诺一生。",
  "我们谨订于公历二零二六年十月十日、农历丙午年九月初一，在杭州西湖云栖庄园举行婚礼。",
  "愿你来，把这一日过成我们共同记得的黄昏。",
] as const;

export const schedule = [
  { time: "16:00", title: "迎宾 · 茶叙" },
  { time: "16:30", title: "典礼" },
  { time: "17:30", title: "合影 · 园中漫步" },
  { time: "18:18", title: "晚宴开席" },
] as const;

export const story = {
  title: "我们的故事",
  kicker: "相识",
  paragraphs: [
    "清和先遇见的是晚棠写在信笺边的一行小字，墨还未干。晚棠先听见的，是廊下谁把茶盏搁得很轻。",
    "后来西湖的雨下了许多场。有一回两人共撑一把旧伞，路走到曲园，才发觉谁也没有先开口说分开。",
    "于是把那一日记下。其余的日子，便都朝它走来。",
  ],
  image: "/images/tea.jpg",
} as const;

export const families = {
  title: "家人",
  kicker: "两姓联姻",
  sides: [
    { house: "顾府", people: "顾先生 · 顾夫人", note: "清和之父母" },
    { house: "沈府", people: "沈先生 · 沈夫人", note: "晚棠之父母" },
  ],
} as const;

export const travel = {
  title: "赴宴须知",
  kicker: "来路",
  items: [
    {
      heading: "车行",
      body: "自杭州市区驱车约四十分钟。庄园门口设落客区，车辆请停北侧宾客车场。",
    },
    {
      heading: "接驳",
      body: "十五时起，西湖东站有礼宾车往返，约二十分钟一班，至典礼前止。",
    },
    {
      heading: "留宿",
      body: "庄园内备有数间庭院客房，如需安排，请与家人说明。亦可就近下榻西湖边酒店。",
    },
  ],
} as const;

export const photos: { src: string; title: string; caption: string }[] = [
  { src: "/images/still-life.jpg", title: "香", caption: "一炷沉香，开场。" },
  { src: "/images/peony.jpg", title: "牡丹", caption: "折枝，未题款。" },
  { src: "/images/courtyard.jpg", title: "月洞", caption: "门里门外，都是水。" },
  { src: "/images/garden.jpg", title: "甬道", caption: "白墙花窗，一匹素绢。" },
  { src: "/images/tablescape.jpg", title: "席", caption: "箸与银叉同席。" },
  { src: "/images/stationery.jpg", title: "帖", caption: "朱砂印还没有落下。" },
  { src: "/images/tea.jpg", title: "茶", caption: "两盏，刚刚好。" },
  { src: "/images/lanterns.jpg", title: "灯", caption: "檐下的暖色，落在水里。" },
  { src: "/images/hands.jpg", title: "约", caption: "指尖将触未触。" },
  { src: "/images/lotus.jpg", title: "荷", caption: "夜色把花洗淡了。" },
  { src: "/images/corridor.jpg", title: "廊", caption: "烛火把路认出来。" },
  { src: "/images/ink.jpg", title: "墨", caption: "纸上只有风。" },
  { src: "/images/glasses.jpg", title: "杯", caption: "西与东，碰一下。" },
  { src: "/images/bridge.jpg", title: "桥", caption: "月下只留一座。" },
];

export function calendarBlob() {
  const stamp = (iso: string) => {
    const d = new Date(iso);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const h = String(d.getUTCHours()).padStart(2, "0");
    const min = String(d.getUTCMinutes()).padStart(2, "0");
    return `${y}${m}${day}T${h}${min}00Z`;
  };
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Qinghe Wantang//Wedding//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${stamp(WEDDING_ISO)}`,
    `DTEND:${stamp(WEDDING_END_ISO)}`,
    "SUMMARY:顾清和 & 沈晚棠 婚礼",
    `LOCATION:${venue.address} (${venue.name})`,
    "DESCRIPTION:中西合璧婚礼 · 杭州西湖云栖庄园",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}
