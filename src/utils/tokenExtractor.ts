import { UserInfo } from '../types';

type UserLike = { profile?: { preferred_username?: string; sub?: string } } | null | undefined;

export function extractUserInfo(user: UserLike): UserInfo | null {
  if (!user || !user.profile) {
    return null;
  }

  const profile = user.profile;

  const user_auth_guid = profile.preferred_username || profile.sub;
  
  if (!user_auth_guid) {
    return null;
  }

  return {
    user_auth_guid,
  };
}

