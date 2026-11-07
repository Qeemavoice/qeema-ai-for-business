// Opens the "مساعد قيمة" chat widget (public/qv-chat/qv-chat.js) from anywhere in the app.
declare global {
  interface Window {
    QeemaChat?: { open: (text?: string) => void; close: () => void };
  }
}

export const openAssistant = (text?: string) => {
  window.QeemaChat?.open(text);
};

// the chat is off on the public site for now; it loads only on the admin dashboard (App.tsx) while it is being developed
export const ASSISTANT_ON = false;
