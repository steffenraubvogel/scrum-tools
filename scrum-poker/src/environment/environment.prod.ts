export const environment = {
  production: true,
  backend: {
    // empty URLs (relative to domain) in production because frontend and server deployed on same domain
    api: "",
    socket: "/",
  },
};
