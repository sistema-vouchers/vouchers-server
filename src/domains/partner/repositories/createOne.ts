import type { Partner } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { BadRequestError, DatabaseError } from '../../../errors'
import type { PartnerToBeCreated } from '../interfaces'
import prismaClient from '../../../database/connection'
import { prismaErrors } from '../../../enums/prismaErrors'

export async function createOne (partnerToBeCreated: PartnerToBeCreated): Promise<Pick<Partner, 'id'>> {
  const PARTNER_ALREADY_EXISTS = 'Estabelecimento já cadastrado.'

  try {
    const partner = await prismaClient.partner.create({
      data: { ...partnerToBeCreated },
      select: {
        id: true
      }
    })

    return partner
  } catch (error) {
    if (
      (error instanceof PrismaClientKnownRequestError) &&
      (error.code === prismaErrors.ALREADY_EXITS)
    ) throw new BadRequestError(PARTNER_ALREADY_EXISTS)

    throw new DatabaseError(error)
  }
}
