/** Generate a short invite code for team lead pools */
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const ORG_ROLES = {
  owner: 'Owner',
  admin: 'Admin',
  agent: 'Agent',
};
