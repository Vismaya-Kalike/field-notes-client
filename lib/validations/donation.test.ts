import { describe, expect, it } from 'vitest'
import { donationRequestSchema, donorInfoSchema, stripEmptyFriends } from './donation'

const baseDonor = {
  donorName: 'Asha Rao',
  donorEmail: 'asha@example.com',
  donorPhone: '+14155552671'
}

const baseRequest = {
  ...baseDonor,
  country: 'us' as const,
  donationType: 'recurring' as const,
  amount: 249,
  paymentMethod: 'card' as const,
  recurringTier: 'adopt-with-friends'
}

describe('friends rows on the donor form', () => {
  it('accepts a fully blank row', () => {
    const result = donorInfoSchema.safeParse({
      ...baseDonor,
      friends: [{ name: '', email: '' }]
    })
    expect(result.success).toBe(true)
  })

  it('accepts no friends at all, which is the "match us" path', () => {
    expect(donorInfoSchema.safeParse(baseDonor).success).toBe(true)
  })

  it('rejects a row with a name but no email, pointing at that field', () => {
    const result = donorInfoSchema.safeParse({
      ...baseDonor,
      friends: [{ name: 'Priya Nair', email: '' }]
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['friends', 0, 'email'])
  })

  it('rejects a row with an email but no name, pointing at that field', () => {
    const result = donorInfoSchema.safeParse({
      ...baseDonor,
      friends: [{ name: '', email: 'priya@example.com' }]
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['friends', 0, 'name'])
  })

  it('reports against the offending row when an earlier row is blank', () => {
    const result = donorInfoSchema.safeParse({
      ...baseDonor,
      friends: [
        { name: '', email: '' },
        { name: 'Sam Cohen', email: 'not-an-email' }
      ]
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['friends', 1, 'email'])
  })
})

describe('stripEmptyFriends', () => {
  it('drops blank rows and keeps the rest', () => {
    expect(
      stripEmptyFriends([
        { name: 'Dana Wu', email: 'dana@example.com' },
        { name: '  ', email: '  ' }
      ])
    ).toEqual([{ name: 'Dana Wu', email: 'dana@example.com' }])
  })

  it('turns undefined into an empty list', () => {
    expect(stripEmptyFriends(undefined)).toEqual([])
  })
})

describe('friends on the donation request', () => {
  it('strips blank rows before validating', () => {
    const result = donationRequestSchema.safeParse({
      ...baseRequest,
      friends: [{ name: '', email: '' }]
    })

    expect(result.success).toBe(true)
    expect(result.data?.friends).toEqual([])
  })

  it('trims surviving rows', () => {
    const result = donationRequestSchema.safeParse({
      ...baseRequest,
      friends: [{ name: ' Priya Nair ', email: ' priya@example.com ' }]
    })

    expect(result.data?.friends).toEqual([
      { name: 'Priya Nair', email: 'priya@example.com' }
    ])
  })

  it('defaults to an empty list when omitted', () => {
    const result = donationRequestSchema.safeParse(baseRequest)
    expect(result.success).toBe(true)
    expect(result.data?.friends).toEqual([])
  })

  it('rejects a half-filled row', () => {
    const result = donationRequestSchema.safeParse({
      ...baseRequest,
      friends: [{ name: 'Priya Nair', email: '' }]
    })
    expect(result.success).toBe(false)
  })
})

describe('existing donation rules still hold', () => {
  it('requires a valid PAN for India', () => {
    const withoutPan = donationRequestSchema.safeParse({
      ...baseRequest,
      country: 'india',
      recurringTier: 'adopt-center',
      amount: 25000
    })
    expect(withoutPan.success).toBe(false)

    const withPan = donationRequestSchema.safeParse({
      ...baseRequest,
      country: 'india',
      recurringTier: 'adopt-center',
      amount: 25000,
      panNumber: 'ABCDE1234F'
    })
    expect(withPan.success).toBe(true)
  })

  it('requires an address for cheque payments', () => {
    const result = donationRequestSchema.safeParse({
      ...baseRequest,
      paymentMethod: 'cheque'
    })
    expect(result.success).toBe(false)
  })

  it('requires a tier for recurring donations', () => {
    const result = donationRequestSchema.safeParse({
      ...baseRequest,
      recurringTier: undefined
    })
    expect(result.success).toBe(false)
  })

  it('allows a one-time donation with no tier', () => {
    const result = donationRequestSchema.safeParse({
      ...baseRequest,
      donationType: 'onetime',
      recurringTier: undefined,
      amount: 3000
    })
    expect(result.success).toBe(true)
  })
})
