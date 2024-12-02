import { type NextFunction, type Request, type Response } from 'express'
import { z } from 'zod'

import { BadRequestError, GenericError } from '../../../errors'

export async function removeVoucherConfigurationPayloadValidation (req: Request, _res: Response, next: NextFunction): Promise<void> {
  const removeVoucherConfigurationPayloadSchema = z.object({
    voucherId: z
      .string({
        invalid_type_error: 'O campo Id do Voucher ("voucherId") deve ser uma string.',
        required_error: 'O campo Id do Voucher ("voucherId") é obrigatório.'
      })
      .uuid({
        message: 'O campo Id do Voucher ("voucherId") deve ser um UUID válido.'
      })
  })

  try {
    removeVoucherConfigurationPayloadSchema.parse({
      voucherId: req.body.voucherId
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.issues.reduce((acc, issue) => `${acc} ${issue.message}`, ''))
    }

    throw new GenericError(error)
  }

  next()
}
