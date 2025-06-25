
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPage from '@/app/admin/page' // adjust path if needed
import '@testing-library/jest-dom'

describe('AdminPage', () => {
  it('renders the header correctly', () => {
    render(<AdminPage />)
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
  })

  it('renders all stat cards', () => {
    render(<AdminPage />)
    const statTitles = ['Total Users', 'Active Learners', 'Certifications', 'Completion Rate']
    statTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('renders users tab with recent users', () => {
    render(<AdminPage />)
    // Users table should be visible by default
    const certlist = screen.getAllByText('Certified')
    expect(screen.getByText('Recent Users')).toBeInTheDocument()
    expect(screen.getByText('Mary Wanjiku')).toBeInTheDocument()
    expect(certlist.length).toBeGreaterThanOrEqual(2)
  })

  it('renders regions tab when clicked', async () => {
    render(<AdminPage />)

    // Click on the "Regions" tab
    const tab = screen.getByRole('tab', { name: /regions/i })
    await userEvent.click(tab)

    expect(await screen.findByText('Regional Performance')).toBeInTheDocument()
    expect(screen.getByText('Nairobi County')).toBeInTheDocument()
    expect(screen.getByText('82%')).toBeInTheDocument()
  })

  it('renders content tab when clicked', async () => {
    render(<AdminPage />)

    const tab = screen.getByRole('tab', { name: /content/i })
    await userEvent.click(tab)
    expect(await screen.findByText('Training Modules')).toBeInTheDocument()
    expect(screen.getByText(/Module 1: Food Safety Basics/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Coach Settings/)).toBeInTheDocument()
  })

  it('renders reports tab when clicked', async () => {
    render(<AdminPage />)
    
    // Find and click the reports tab
    const reportsTab = screen.getByRole('tab', { name: /reports/i })
    await userEvent.click(reportsTab)
    
    // Wait for the reports card to be visible using test ID
    const reportsCard = await screen.findByTestId('reports-card')
    
    // Check for the presence of all elements using test IDs
    expect(screen.getByTestId('monthly-report-title')).toHaveTextContent('Monthly Report')
    expect(screen.getByTestId('user-satisfaction-title')).toHaveTextContent('User Satisfaction')
    expect(screen.getByTestId('satisfaction-percentage')).toHaveTextContent('23%')
    expect(screen.getByTestId('community-reach-title')).toHaveTextContent('Community Reach')
    expect(screen.getByTestId('reach-count')).toHaveTextContent('1,245')
  })
})
