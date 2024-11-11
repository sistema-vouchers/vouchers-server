import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import prismaClient from '../../../database/connection'

import { DatabaseError, NotFoundError } from '../../../errors'
import { prismaErrors } from '../../../enums/prismaErrors'

export async function deleteOneResetPasswordCode (userId: string): Promise<void> {
  const USER_NOT_FOUND = 'Usuário não encontrado.'

  try {
    await prismaClient.userResetPasswordCode.delete({
      where: { userId }
    })
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaErrors.NOT_FOUND)
    ) throw new NotFoundError(USER_NOT_FOUND)

    throw new DatabaseError(error)
  }
}