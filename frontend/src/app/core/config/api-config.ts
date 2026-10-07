// Se arma con el mismo host/dominio que el navegador usó para cargar el
// frontend (localhost, la IP de la LAN, o un FQDN), para que la app
// funcione igual sin importar desde qué equipo de la red se acceda.
export const API_BASE_URL = `http://${window.location.hostname}:8000`;
