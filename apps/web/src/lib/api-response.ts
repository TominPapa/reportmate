import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export function notFound(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 })
}

export function serverError(error: unknown) {
  console.error(error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
