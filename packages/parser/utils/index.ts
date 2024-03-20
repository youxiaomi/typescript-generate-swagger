export function omitUndefined<T>(items:T[]){
  return items.filter(item=>item !== undefined) as (T extends undefined  ? never : T)[]
}