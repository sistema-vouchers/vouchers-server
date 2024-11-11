import { type MemberToBeCreated } from '../memberInterfaces'
import { memberRepositories } from '../repositories/memberRepositories'

export async function createOne (memberToBeCreated: MemberToBeCreated): Promise<string> {
  const member = await memberRepositories.createOne(memberToBeCreated)

  return member.id
}
