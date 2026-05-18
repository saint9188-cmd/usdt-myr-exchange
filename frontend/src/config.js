// Dynamically uses the current hostname so the app works on both
// localhost (PC) and any phone/device on the same network
const host = window.location.hostname;
export const API = `http://${host}:3001`;
