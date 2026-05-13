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
      topic: 'Test Topic',
      baseIdea: 'Test Idea',
      linkedin: { content: 'LinkedIn Content', status: 'DRAFT' as const, scheduledAt: null },
      x: { posts: [{ id: '1', content: 'X Content' }], status: 'DRAFT' as const, scheduledAt: null }
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
        onLinkedInChange={() => {}}
        onXPostChange={() => {}}
      />,
      { wrapper: Wrapper }
    )
    expect(screen.getByText('Save as Draft')).toBeInTheDocument()

    rerender(
      <PostPreview
        generatedPostPack={mockPostPack}
        mode="draft"
        initialPlatform="x"
        onLinkedInChange={() => {}}
        onXPostChange={() => {}}
      />
    )
    expect(screen.getByText('Save as Draft')).toBeInTheDocument()
  })

  it('hides scheduled variant tab from draft editor (#02)', () => {
    const scheduledLinkedInPack = {
      ...mockPostPack,
      posts: [{
        ...mockPostPack.posts[0],
        linkedin: { ...mockPostPack.posts[0].linkedin, status: 'SCHEDULED' as const }
      }]
    }

    render(
      <PostPreview
        generatedPostPack={scheduledLinkedInPack}
        mode="draft"
        onLinkedInChange={() => {}}
        onXPostChange={() => {}}
      />,
      { wrapper: Wrapper }
    )

    expect(screen.queryByRole('tab', { name: 'LinkedIn' })).not.toBeInTheDocument()
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

    expect(screen.queryByText(/Save .* Draft/)).not.toBeInTheDocument()
  })
})