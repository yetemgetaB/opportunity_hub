const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '')

let accessToken: string | null = null

export function setApiAccessToken(token: string | null) {
  accessToken = token
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type ApiEnvelope<T> = {
  success: true
  data: T
  meta?: { timestamp?: string }
}

type ApiErrorEnvelope = {
  success: false
  error?: { code?: string; message?: string; details?: unknown }
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return Boolean(value && typeof value === 'object' && 'success' in value && value.success === false)
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    if (accessToken) headers.set('Authorization', ['Bearer', accessToken].join(' '))

    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError('The service could not be reached.', 0, 'NETWORK_ERROR')
  }

  if (response.status === 204) {
    if (!response.ok) throw new ApiError('The request failed.', response.status)
    return undefined as T
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('The service returned an invalid response.', response.status, 'INVALID_RESPONSE')
  }

  if (!response.ok) {
    if (isApiErrorEnvelope(payload)) {
      throw new ApiError(
        payload.error?.message ?? 'The request failed.',
        response.status,
        payload.error?.code,
        payload.error?.details,
      )
    }
    throw new ApiError('The request failed.', response.status)
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    !('success' in payload) ||
    payload.success !== true ||
    !('data' in payload)
  ) {
    throw new ApiError('The service returned an invalid response.', response.status, 'INVALID_RESPONSE')
  }

  return (payload as ApiEnvelope<T>).data
}
