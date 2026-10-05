const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiEnvelope<T> = {
  success: boolean
  data: T
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError('The service could not be reached.', 0)
  }

  if (!response.ok) {
    throw new ApiError('The request failed.', response.status)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('The service returned an invalid response.', response.status)
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    !('success' in payload) ||
    payload.success !== true ||
    !('data' in payload)
  ) {
    throw new ApiError('The service returned an invalid response.', response.status)
  }

  return (payload as ApiEnvelope<T>).data
}
