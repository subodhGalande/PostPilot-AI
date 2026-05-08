import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { PostPreview } from './post-preview'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const mockPostPack = {
  posts: [
    {
      baseIdea: 'Test Idea',
      linkedin: { content: 'LinkedIn Content', status: 'DRAFT', scheduledAt: null },
      x: { posts: [{ id: '1', content: 'X Content' }], status: 'DRAFT', scheduledAt: null }
    }
  ],
  model: 'gemini-2.0-flash'
}

describe('PostPreview Lifecycle Visibility', () => {
  it('shows correct save button label for active platform (#01)', () => {
    const { rerender } = render(
      <PostPreview 
        generatedPostPack={mockPostPack} 
        mode="draft" 
        initialPlatform="linkedin"
        linkedinStatus="DRAFT"
        xStatus="DRAFT"
        onLinkedInChange={() => {}}
        onXPostChange={() => {}}
      />,
      { wrapper: Wrapper }
    )
    expect(screen.getByText('Save LinkedIn Draft')).toBeInTheDocument()

    rerender(
      <PostPreview 
        generatedPostPack={mockPostPack} 
        mode="draft" 
        initialPlatform="x"
        linkedinStatus="DRAFT"
        xStatus="DRAFT"
        onLinkedInChange={() => {}}
        onXPostChange={() => {}}
      />
    )
    expect(screen.getByText('Save X Draft')).toBeInTheDocument()
  })

  it('hides scheduled variant tab from draft editor (#02)', () => {
    const scheduledLinkedInPack = {
      ...mockPostPack,
      posts: [{
        ...mockPostPack.posts[0],
        linkedin: { ...mockPostPack.posts[0].linkedin, status: 'SCHEDULED' }
      }]
    }

    render(
      <PostPreview 
        generatedPostPack={scheduledLinkedInPack} 
        mode="draft" 
        linkedinStatus="SCHEDULED"
        xStatus="DRAFT"
        onLinkedInChange={() => {}}
        onXPostChange={() => {}}
      />,
      { wrapper: Wrapper }
    )

    // LinkedIn tab should be hidden because it's SCHEDULED and mode is draft
    expect(screen.queryByRole('tab', { name: 'LinkedIn' })).not.toBeInTheDocument()
    // There are 2 'X' tabs (mobile + desktop)
    expect(screen.getAllByRole('tab', { name: 'X' }).length).toBeGreaterThan(0)
  })

  it('renders read-only view from calendar (#04)', () => {
    render(
      <PostPreview 
        generatedPostPack={mockPostPack} 
        readOnly={true}
        onLinkedInChange={() => {}}
        onXPostChange={() => {}}
      />,
      { wrapper: Wrapper }
    )

    // Save button should be hidden in read-only mode
    expect(screen.queryByText(/Save .* Draft/)).not.toBeInTheDocument()
    // Schedule button should still exist (as Reschedule)
    expect(screen.getByText(/Schedule LinkedIn/)).toBeInTheDocument()
  })
})
