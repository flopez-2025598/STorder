export const orderStatuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof orderStatuses)[number];
