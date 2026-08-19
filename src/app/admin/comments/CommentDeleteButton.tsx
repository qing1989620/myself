"use client"

import DeleteConfirmButton from "@/components/admin/DeleteConfirmButton"

export default function CommentDeleteButton({
  commentId,
}: {
  commentId: number
}) {
  return (
    <DeleteConfirmButton
      apiPath={`/api/admin/comments/${commentId}`}
      iconTitle="删除评论"
    />
  )
}
