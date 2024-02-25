import {createSecretKey} from 'crypto'
import { jwtVerify } from 'jose'
import { type NextFunction, type Request, type Response } from 'express'

import { getEnvironmentVariable } from '../utils/getEnvironmentVariable'
import { UnauthorizedError } from '../errors'

export const verifyAccessToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const INVALID_ACCESS_TOKEN = 'Token de acesso inválido.'

  const JWT_SECRET = getEnvironmentVariable('JWT_SECRET')
  const JWT_ISSUER = getEnvironmentVariable('JWT_ISSUER')
  const JWT_AUDIENCE = getEnvironmentVariable('JWT_AUDIENCE')

  const accessToken = req.headers.authorization?.split('Bearer ')[1]

  if (!accessToken) throw new UnauthorizedError(INVALID_ACCESS_TOKEN)

  const secretKey = createSecretKey(JWT_SECRET, 'utf8')

  try {
    const { payload } = await jwtVerify(accessToken, secretKey, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })

    if (
      !('id' in payload) ||
      (typeof payload.id !== 'string')
    ) throw new UnauthorizedError(INVALID_ACCESS_TOKEN)

    if (
      !('roleId' in payload) ||
      (typeof payload.roleId !== 'number')
    ) throw new UnauthorizedError(INVALID_ACCESS_TOKEN)

    req.headers['request-user-id'] = payload.id
    req.headers['request-user-role-id'] = JSON.stringify(payload.roleId)

    next()
  } catch (error) {
    throw new UnauthorizedError(INVALID_ACCESS_TOKEN)
  }
}
