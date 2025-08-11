export const UserLevel = {
    MANAGEMENT: 2,
    SUPERVISOR: 1,
    EMPLOYEE: 0,
} as const;

export const UserStatus = {
    INACTIVE: 0,
    ACTIVE: 1,
    UNVERIFIED: 2,
} as const;

export const Gender = {
    MALE: 'M',
    FEMALE: 'F',
} as const

export type TRole = typeof UserLevel[keyof typeof UserLevel];
export type TGender = typeof Gender[keyof typeof Gender];
