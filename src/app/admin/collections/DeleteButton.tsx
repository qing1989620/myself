"use client"

import DeleteConfirmButton from "@/components/admin/DeleteConfirmButton"

export default function DeleteButton({ collectionId }: { collectionId: number }) {
  return (
    <DeleteConfirmButton
      apiPath={`/api/admin/collections/${collectionId}`}
      iconTitle="删除合集"
    />
  )
}
