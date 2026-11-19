export const roleNames = ['admin', 'operator'] as const;
export type RoleName = (typeof roleNames)[number];
