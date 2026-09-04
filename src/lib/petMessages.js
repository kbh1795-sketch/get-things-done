const MESSAGES = {
  ko: {
    greeting: (name) => (name ? `${name}가(이) 인사해요!` : '안녕하세요!'),
    noTasks: '오늘 할 일이 없어요. 계획을 세워볼까요?',
    remaining: (n) => `오늘 할 일이 ${n}개 남았어요. 파이팅!`,
    allDone: '오늘 할 일을 모두 끝냈어요! 대단해요! 🎉',
    streak: (n) => `현재 ${n}일 연속 달성 중! 🔥`,
  },
  en: {
    greeting: (name) => (name ? `${name} says hi!` : 'Hello!'),
    noTasks: 'No tasks today. Fancy planning something?',
    remaining: (n) => `${n} tasks left today. You can do it!`,
    allDone: 'All done for today! Brilliant! 🎉',
    streak: (n) => `${n}-day streak going! 🔥`,
  },
  zh: {
    greeting: (name) => (name ? `${name}在向你问好！` : '你好！'),
    noTasks: '今天没有任务。要不要计划一下？',
    remaining: (n) => `今天还剩 ${n} 个任务。加油！`,
    allDone: '今天的任务全部完成啦！太棒了！ 🎉',
    streak: (n) => `已连续达成 ${n} 天！ 🔥`,
  },
  ja: {
    greeting: (name) => (name ? `${name}が挨拶してるよ！` : 'こんにちは！'),
    noTasks: '今日のタスクはありません。計画を立てませんか？',
    remaining: (n) => `今日のタスクは残り${n}個です。頑張って！`,
    allDone: '今日のタスクはすべて完了！すごい！ 🎉',
    streak: (n) => `現在${n}日連続達成中！ 🔥`,
  },
  fr: {
    greeting: (name) => (name ? `${name} te dit bonjour !` : 'Bonjour !'),
    noTasks: "Aucune tâche aujourd'hui. On planifie quelque chose ?",
    remaining: (n) => `Il reste ${n} tâches aujourd'hui. Courage !`,
    allDone: "Toutes les tâches du jour sont terminées ! Bravo ! 🎉",
    streak: (n) => `${n} jours d'affilée ! 🔥`,
  },
  es: {
    greeting: (name) => (name ? `¡${name} te saluda!` : '¡Hola!'),
    noTasks: 'No hay tareas hoy. ¿Planeamos algo?',
    remaining: (n) => `Quedan ${n} tareas hoy. ¡Tú puedes!`,
    allDone: '¡Todo terminado hoy! ¡Increíble! 🎉',
    streak: (n) => `¡Racha de ${n} días! 🔥`,
  },
  de: {
    greeting: (name) => (name ? `${name} sagt hallo!` : 'Hallo!'),
    noTasks: 'Keine Aufgaben heute. Möchtest du etwas planen?',
    remaining: (n) => `Noch ${n} Aufgaben heute. Du schaffst das!`,
    allDone: 'Alle Aufgaben erledigt! Großartig! 🎉',
    streak: (n) => `${n} Tage in Folge! 🔥`,
  },
};

export function getPetMessage(lang, { name, remaining, total, streak }) {
  const t = MESSAGES[lang] || MESSAGES.ko;
  let body;
  if (total === 0) body = t.noTasks;
  else if (remaining === 0) body = t.allDone;
  else body = t.remaining(remaining);
  return {
    greeting: t.greeting(name),
    body,
    streak: streak > 0 ? t.streak(streak) : '',
  };
}