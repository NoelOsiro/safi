import { getDictionary } from "@/app/dictionaries";



describe("Get Dictionary", () => {
  it("renders the logo and navigation links", async() => {
    const dict = await getDictionary('en')
    const landingPage = dict.landing
    const landingSections = [
        'hero',
        'stats',
        'visual',
        'features',
        'testimonials',
        'curriculum',
        'cta',
        'footer'
      ]
    expect(Object.keys(landingPage)).toEqual(landingSections)
  })
})
