export type ResultStatus = 'SUCCESS' | 'FAIL'
export type Result<T> = [ResultStatus, T]
