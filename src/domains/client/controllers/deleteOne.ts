import { HttpStatusCode } from 'axios'
import { type Request, type Response } from 'express'

import clientService from '../service'

export async function deleteOne (req: Request, res: Response): Promise<Response> {
  const CLIENT_SUCCESSFULLY_DELETED = 'Cliente excluído com sucesso.'

  const clientId = req.params.id

  await clientService.deleteOne(clientId)

  return res.status(HttpStatusCode.Ok).json({ message: CLIENT_SUCCESSFULLY_DELETED })
}