export function buildMessage(name: string, lang: string): string {
  switch (lang) {
    case "pt":
      return `🇧🇷 Olá ${name} tudo bem?`
    case "en":
      return `🇺🇸 ${name} What's up`
    case "es":
      return `🇪🇸 ¿Hola ${name}, qué tal?`
    default:
      return '✋😃'
  }
}