// Opens the "مساعد قيمة" chat widget (public/qv-chat/qv-chat.js) from anywhere in the app.
declare global {
  interface Window {
    QeemaChat?: { open: (text?: string) => void; close: () => void };
  }
}

export const openAssistant = (text?: string) => {
  window.QeemaChat?.open(text);
};
