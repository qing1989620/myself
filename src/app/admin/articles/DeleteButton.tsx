"use client"

import DeleteConfirmButton from "@/components/admin/DeleteConfirmButton"

export default function DeleteButton({ articleId }: { articleId: number }) {
  return (
    <DeleteConfirmButton
      apiPath={`/api/admin/articles/${articleId}`}
      iconTitle="删除文章"
    />
  )
}
