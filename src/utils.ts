import startOfTomorrow from 'date-fns/startOfTomorrow'
import getTime from 'date-fns/getTime'

export const getStartOfTomorrow = (dateInMilliseconds?: number) =>
  dateInMilliseconds || getTime(startOfTomorrow())
