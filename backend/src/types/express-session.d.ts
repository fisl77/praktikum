import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      username: string;
      role: string;
    };
  }
}
