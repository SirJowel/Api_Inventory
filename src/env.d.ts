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

  }
}
