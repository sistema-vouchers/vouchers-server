import { status } from '../../../enums/statusEnum'
import { userRepositories } from '../repositories/userRepositories'

export async function inactivateOne (userToBeInactivatedId: string): Promise<string> {
  const userId = await userRepositories.updateOne(userToBeInactivatedId, { statusId: status.INACTIVE })

  return userId
}