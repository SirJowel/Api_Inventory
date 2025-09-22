declare namespace NodeJS {
  interface ProcessEnv {
   
    PORT:string
    DB_HOST:string
    DB_PORT:string
    DB_USER:string
    DB_PASSWORD:string
    DB_NAME:string
    NODE_ENV:string
    JWT_SECRET:string
    JWT_EXPIRES_IN:string
    JWT_ALGORITHM:string
    REDIS_HOST:string
    REDIS_PORT:string
    REDIS_PASSWORD:string
    RATE_LIMIT_MAX_REQUESTS:string
    RATE_LIMIT_WINDOW:string

  }
}
