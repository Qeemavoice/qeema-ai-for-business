/** «انضم كمعلق صوتي» opens the narrator sign-up modal (no separate page); App.tsx listens for this event. */
export const TALENT_SIGNUP_EVENT = 'qeema:talent-signup';
export const openTalentSignup = () => window.dispatchEvent(new Event(TALENT_SIGNUP_EVENT));
