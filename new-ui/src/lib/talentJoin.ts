/** «انضم كمعلق صوتي» opens the narrator sign-up modal (no separate page); App.tsx listens for this event. */
export const TALENT_SIGNUP_EVENT = 'qeema:talent-signup';
export const openTalentSignup = () => window.dispatchEvent(new Event(TALENT_SIGNUP_EVENT));

/** Client sign-in modal from any page (e.g. a guide that needs an account); SIGNED_IN_EVENT fires once signed in */
export const CLIENT_LOGIN_EVENT = 'qeema:client-login';
export const openClientLogin = () => window.dispatchEvent(new Event(CLIENT_LOGIN_EVENT));
export const SIGNED_IN_EVENT = 'qeema:signed-in';
