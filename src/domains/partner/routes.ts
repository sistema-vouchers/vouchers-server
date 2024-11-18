import multer from 'multer'
import { Router } from 'express'

import { checkIfIsMasterUser, checkIfIsUser } from '../../middlewares/authorization.middleware'
import { multerOptionsForImage } from '../../multerOptions'
import { partnerControllers } from './controllers/partnerControllers'
import { partnerMiddlewares } from './middlewares/partnerMiddlewares'
import { validateUuidParam } from '../../middlewares/validateUuidParam.middleware'
import { verifyAccessToken } from '../../middlewares/authentication.middleware'

const partnerRouter: Router = Router()

// Criar estabelecimento
partnerRouter.post(
  '/',
  verifyAccessToken,
  checkIfIsMasterUser,
  partnerMiddlewares.createOnePayloadValidation,
  partnerControllers.createOne
)

// Detalhes de um estabelecimento
partnerRouter.get(
  '/:id',
  verifyAccessToken,
  checkIfIsUser,
  validateUuidParam,
  partnerControllers.findOneById
)

// Listar estabelecimentos
partnerRouter.get(
  '/',
  verifyAccessToken,
  checkIfIsUser,
  partnerMiddlewares.findManyQueryParamsValidation,
  partnerControllers.findMany
)

// Ativar estabelecimento
partnerRouter.patch(
  '/:id/activate',
  verifyAccessToken,
  checkIfIsMasterUser,
  validateUuidParam,
  partnerControllers.activateOne
)

// Inativar estabelecimento
partnerRouter.patch(
  '/:id/inactivate',
  verifyAccessToken,
  checkIfIsMasterUser,
  validateUuidParam,
  partnerControllers.inactivateOne
)

// Excluir estabelecimento
partnerRouter.patch(
  '/:id/delete',
  verifyAccessToken,
  checkIfIsMasterUser,
  validateUuidParam,
  partnerControllers.deleteOne
)

// Editar estabelecimento
partnerRouter.patch(
  '/:id',
  verifyAccessToken,
  checkIfIsMasterUser,
  validateUuidParam,
  partnerMiddlewares.updateOnePayloadValidation,
  partnerControllers.updateOne
)

// Salvar imagem
partnerRouter.patch(
  '/:id/image',
  verifyAccessToken,
  checkIfIsMasterUser,
  validateUuidParam,
  partnerMiddlewares.partnerIdValidation,
  multer(multerOptionsForImage).single('image'),
  partnerMiddlewares.updateFilePayloadValidation,
  partnerControllers.updateFile
)

// Salvar logo
partnerRouter.patch(
  '/:id/logo',
  verifyAccessToken,
  checkIfIsMasterUser,
  validateUuidParam,
  partnerMiddlewares.partnerIdValidation,
  multer(multerOptionsForImage).single('logo'),
  partnerMiddlewares.updateFilePayloadValidation,
  partnerControllers.updateFile
)

export { partnerRouter }
