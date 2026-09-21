import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { $sessionColorOverrides, setSessionColorOverride } from '@/store/session-color'
import type { SessionInfo } from '@/types/hermes'

import { SessionStatusDot } from './session-status-dot'

vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: {
      sidebar: {
        row: {
          backgroundRunning: 'Background',
          draftSession: 'Draft',
          finishedUnread: 'Unread',
          needsInput: 'Needs input',
          sessionRunning: 'Running',
          waitingForAnswer: 'Waiting'
        }
      }
    }
  })
}))

afterEach(() => {
  cleanup()
  $sessionColorOverrides.set({})
})

const session = { id: '20260922_120000_abcdef' } as unknown as SessionInfo

function rowDot(container: HTMLElement): HTMLElement {
  const dot = [...container.querySelectorAll('span')].find(span => /(^|\s)size-1(\.5)?(\s|$)/.test(span.className))
  if (!dot) throw new Error('no status dot rendered')
  return dot
}

const paint = (container: HTMLElement) => rowDot(container).getAttribute('style')

describe('SessionStatusDot session colour', () => {
  it('repaints a live dot when the override changes, matching a fresh mount', () => {
    setSessionColorOverride(session.id, 'hsl(0 68% 58%)')
    const { container } = render(<SessionStatusDot session={session} storedSessionId={session.id} />)
    expect(paint(container)).not.toBeNull()

    // Changing the override must reach the row that is already on screen; the
    // colour used to survive only as the value read at mount time.
    act(() => setSessionColorOverride(session.id, 'hsl(180 68% 58%)'))
    const { container: remounted } = render(<SessionStatusDot session={session} storedSessionId={session.id} />)
    const fresh = paint(remounted)
    expect(fresh).not.toBeNull()
    expect(paint(container)).toBe(fresh)
  })

  it('paints nothing when the session has no colour', () => {
    const { container } = render(<SessionStatusDot session={session} storedSessionId={session.id} />)
    expect(paint(container)).toBeNull()
  })
})
