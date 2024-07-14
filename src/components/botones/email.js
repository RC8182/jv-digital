import Link from 'next/link'
import React from 'react'

export const Email = ({email, asunto}) => {
  return (
    <Link href={`mailto:${email}?subject=${asunto}`} className="text-white">
        Email
    </Link>
  )
}
