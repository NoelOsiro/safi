import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { act } from 'react'
import AdminPage from '@/app/[lang]/admin/page'

// Utility function to render async pages
async function renderAdminPage() {
  const Admin = AdminPage()
  await act(async () => {
    render(Admin)
  })
}

describe('AdminPage', () => {
  it('renders the header correctly', async () => {
    await renderAdminPage()
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
  })

  it('renders all stat cards', async () => {
    await renderAdminPage()
    const statTitles = ['Total Users', 'Active Learners', 'Certifications', 'Completion Rate']
    statTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('renders users tab with recent users', async () => {
    await renderAdminPage()
    const certlist = screen.getAllByText('Certified')
    expect(screen.getByText('Recent Users')).toBeInTheDocument()
    expect(screen.getByText('Mary Wanjiku')).toBeInTheDocument()
    expect(certlist.length).toBeGreaterThanOrEqual(2)
  })

  it('renders regions tab when clicked', async () => {
    await renderAdminPage()
    const tab = screen.getByRole('tab', { name: /regions/i })
    await act(async () => {
      await userEvent.click(tab)
    })
    expect(await screen.findByText('Regional Performance')).toBeInTheDocument()
    expect(screen.getByText('Nairobi County')).toBeInTheDocument()
    expect(screen.getByText('82%')).toBeInTheDocument()
  })

  it('renders content tab when clicked', async () => {
    await renderAdminPage()
    const tab = screen.getByRole('tab', { name: /content/i })
    await act(async () => {
      await userEvent.click(tab)
    })
    expect(await screen.findByText('Training Modules')).toBeInTheDocument()
    expect(screen.getByText(/Module 1: Food Safety Basics/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Coach Settings/)).toBeInTheDocument()
  })

  it('renders reports tab when clicked', async () => {
    await renderAdminPage()
    const reportsTab = screen.getByRole('tab', { name: /reports/i })
    await act(async () => {
      await userEvent.click(reportsTab)
    })
    expect(await screen.findByTestId('reports-card')).toBeInTheDocument()
    expect(screen.getByTestId('monthly-report-title')).toHaveTextContent('Monthly Report')
    expect(screen.getByTestId('user-satisfaction-title')).toHaveTextContent('User Satisfaction')
    expect(screen.getByTestId('satisfaction-percentage')).toHaveTextContent('23%')
    expect(screen.getByTestId('community-reach-title')).toHaveTextContent('Community Reach')
    expect(screen.getByTestId('reach-count')).toHaveTextContent('1,245')
  })
})
