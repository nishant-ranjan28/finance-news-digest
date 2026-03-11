describe('smoke test', () => {
  it('Jest is configured and running', () => {
    expect(true).toBe(true)
  })

  it('TypeScript works in tests', () => {
    const add = (a: number, b: number): number => a + b
    expect(add(2, 3)).toBe(5)
  })
})
