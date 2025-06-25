import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'
 
describe('HomePage', () => {
  it('renders the main navigation with logo and title', () => {
    render(<HomePage />)
    
    // Find the header by its role
    const header = screen.getByRole('banner')
    
    // Check for the logo and title within the header
    const logo = header.querySelector('div[class*="bg-gradient-to-br"]')
    const title = screen.getAllByText('MAMA SAFI')
    const subtitle = screen.getByText('AI Coach for Food Safety')
    
    expect(header).toBeInTheDocument()
    expect(logo).toBeInTheDocument()
    expect(title.length).toBeGreaterThanOrEqual(2)
    expect(subtitle).toBeInTheDocument()
  })
})