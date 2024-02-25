import csv from 'csv-parser'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { BadRequestError, NotFoundError } from '../../errors'
import clientRepositories from '../client/repositories'
import { convertBufferToStream } from '../../utils/convertBufferToStream'
import {
  type FindManyMembersQueryParams,
  type FindManyMembersWhere,
  type MemberToBeCreated,
  type MemberToBeReturned
} from './interfaces'
import { type FindManyResponse } from '../../interfaces'
import memberRepositories from './repositories'
import { status } from '../../enums/statusEnum'
import { prismaErrors } from '../../enums/prismaErrors'

const createOne = async (memberToBeCreated: MemberToBeCreated): Promise<string> => {
  const INVALID_CLIENT = 'Cliente inválido.'

  const client = await clientRepositories.findOneById(memberToBeCreated.clientId)

  if (client === null) throw new BadRequestError(INVALID_CLIENT)

  const member = await memberRepositories.createOne(memberToBeCreated)

  return member.id
}

const createMany = async (clientId: string, fileBuffer: Buffer): Promise<void> => {
  const INVALID_CLIENT = 'Cliente inválido.'

  const client = await clientRepositories.findOneById(clientId)

  if (client === null) throw new BadRequestError(INVALID_CLIENT)

  const fileStream = convertBufferToStream(fileBuffer)

  fileStream
    .pipe(csv())
    .on('data', async (row) => {
      const memberToBeCreated: MemberToBeCreated = {
        birthDate: row.data_de_nascimento,
        cep: row.cep,
        clientId,
        cpf: row.cpf,
        email: row.email,
        name: row.nome,
        phoneNumber: row.telefone,
        statusId: status.ACTIVE
      }

      try {
        await memberRepositories.createOneForBulkCreation(memberToBeCreated)
      } catch (error) {
        if (
          (error instanceof PrismaClientKnownRequestError) &&
          (error.code === prismaErrors.ALREADY_EXITS)
        ) {
          logger.error(`O associado de CPF ${row.cpf} não foi cadastrado: esse CPF já existe no banco de dados.`)
        }
      }
    })
}

const findMany = async ({ skip, take, ...queryParams }: FindManyMembersQueryParams): Promise<FindManyResponse<Omit<MemberToBeReturned, 'orders'>>> => {
  const MEMBERS_NOT_FOUND = 'Nenhum associado encontrado.'
  const CLIENT_NOT_FOUND = 'Cliente não encontrado.'

  const where: Partial<FindManyMembersWhere> = {}

  Object.entries(queryParams).forEach(([key, value]) => {
    if (
      value !== undefined &&
        !Number.isNaN(value) &&
        key !== 'clientCnpj'
    ) Object.assign(where, { [key]: value })
  })

  if (queryParams.clientCnpj !== undefined) {
    const client = await clientRepositories.findOneByCnpj(queryParams.clientCnpj)

    if (client === null) throw new BadRequestError(CLIENT_NOT_FOUND)

    Object.assign(where, { clientId: client.id })
  }

  const members = await memberRepositories.findMany(skip, take, where)

  if (members.length === 0) throw new NotFoundError(MEMBERS_NOT_FOUND)

  const totalCount = await memberRepositories.count({ statusId: queryParams.statusId })

  return { items: members, totalCount }
}

const findOneById = async (id: string): Promise<MemberToBeReturned> => {
  const MEMBER_NOT_FOUND = 'Associado não encontrado.'

  const member = await memberRepositories.findOneById(id)

  if (member === null) throw new NotFoundError(MEMBER_NOT_FOUND)

  logger.debug(member, 'Associado')

  const { password, createdPassword, updatedAt, ...memberToBeReturned } = member

  return memberToBeReturned
}

const activateOne = async (id: string): Promise<void> => {
  await memberRepositories.updateOne(id, { statusId: 1 })
}

const inactivateOne = async (id: string): Promise<void> => {
  await memberRepositories.updateOne(id, { statusId: 2 })
}

const deleteOne = async (id: string): Promise<void> => {
  await memberRepositories.updateOne(id, { statusId: 3 })
}

export default {
  activateOne,
  createMany,
  createOne,
  deleteOne,
  findMany,
  findOneById,
  inactivateOne
}
