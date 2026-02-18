export function getEnv(name: string): string{
  const value: string | undefined = process.env[name]
  if (!value){
    throw new Error(`missing environment variable : ${name}`)
  } else {
    return value
  }
}