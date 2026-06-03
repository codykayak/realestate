export const REGION = process.env.FUNCTION_REGION || 'us-central1';

/** Gen 2 callable: public invoker + explicit CORS for macrorei.com and local dev */
export const CALLABLE_OPTIONS = {
  region: REGION,
  invoker: 'public',
  cors: [
    'https://www.macrorei.com',
    'https://macrorei.com',
    /https:\/\/.*\.macrorei\.com$/,
    'https://realestate-map-23692.web.app',
    'https://realestate-map-23692.firebaseapp.com',
    /http:\/\/localhost(:\d+)?$/,
    /http:\/\/127\.0\.0\.1(:\d+)?$/,
  ],
};
