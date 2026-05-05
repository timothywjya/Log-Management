
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: ProcessEnv;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}