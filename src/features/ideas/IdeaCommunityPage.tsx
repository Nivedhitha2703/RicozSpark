import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Loader2,
  MessageCircle,
  Pencil,
  Reply,
  Send,
  Trash2,
  UserPlus,
  UserRoundCheck,
  ThumbsUp,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getIdeaDetail,
  type IdeaDetail,
} from './idea-detail-api'

import {
  createComment,
  deleteComment,
  getCurrentUserId,
  getIdeaComments,
  getIdeaCommunityStats,
  toggleIdeaBookmark,
  toggleIdeaFollow,
  toggleIdeaVote,
  updateComment,
  type IdeaComment,
  type IdeaCommunityStats,
} from './idea-community-api'


/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(' ')
}

function getStatusClasses(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-400'

    case 'UNDER_REVIEW':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-400'

    case 'UNDER_EVALUATION':
      return 'border-purple-500/20 bg-purple-500/10 text-purple-400'

    case 'APPROVED':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'

    case 'REJECTED':
      return 'border-red-500/20 bg-red-500/10 text-red-400'

    case 'CHANGES_REQUESTED':
      return 'border-orange-500/20 bg-orange-500/10 text-orange-400'

    case 'IN_PIPELINE':
      return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'

    case 'CONVERTED_TO_PROJECT':
      return 'border-green-500/20 bg-green-500/10 text-green-400'

    default:
      return 'border-border bg-surface text-muted'
  }
}


/* =========================================================
   COMMUNITY ACTION BAR
========================================================= */

function CommunityActions({
  stats,
  busyAction,
  onVote,
  onFollow,
  onBookmark,
}: {
  stats: IdeaCommunityStats
  busyAction: string | null
  onVote: () => void
  onFollow: () => void
  onBookmark: () => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">

        {/* Vote */}
        <button
          type="button"
          onClick={onVote}
          disabled={busyAction === 'vote'}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
            stats.isVoted
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-background text-muted hover:border-primary/30 hover:text-primary'
          }`}
        >
          {busyAction === 'vote' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp
              className={`h-4 w-4 ${
                stats.isVoted ? 'fill-current' : ''
              }`}
            />
          )}

          {stats.isVoted ? 'Voted' : 'Upvote'}

          <span className="rounded-full bg-background px-2 py-0.5 text-xs">
            {stats.voteCount}
          </span>
        </button>


        {/* Follow */}
        <button
          type="button"
          onClick={onFollow}
          disabled={busyAction === 'follow'}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
            stats.isFollowing
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-background text-muted hover:border-primary/30 hover:text-primary'
          }`}
        >
          {busyAction === 'follow' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : stats.isFollowing ? (
            <UserRoundCheck className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}

          {stats.isFollowing ? 'Following' : 'Follow'}

          <span className="rounded-full bg-background px-2 py-0.5 text-xs">
            {stats.followerCount}
          </span>
        </button>


        {/* Bookmark */}
        <button
          type="button"
          onClick={onBookmark}
          disabled={busyAction === 'bookmark'}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
            stats.isBookmarked
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-background text-muted hover:border-primary/30 hover:text-primary'
          }`}
        >
          {busyAction === 'bookmark' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark
              className={`h-4 w-4 ${
                stats.isBookmarked ? 'fill-current' : ''
              }`}
            />
          )}

          {stats.isBookmarked ? 'Saved' : 'Save'}
        </button>


        {/* Comment count */}
        <a
          href="#discussion"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted transition hover:border-primary/30 hover:text-primary"
        >
          <MessageCircle className="h-4 w-4" />

          Comments

          <span className="rounded-full bg-surface px-2 py-0.5 text-xs">
            {stats.commentCount}
          </span>
        </a>

      </div>
    </div>
  )
}


/* =========================================================
   COMMENT CARD
========================================================= */

function CommentCard({
  comment,
  replies,
  currentUserId,
  replyingTo,
  editingCommentId,
  replyText,
  editText,
  commentBusy,
  onReply,
  onCancelReply,
  onReplyTextChange,
  onSubmitReply,
  onEdit,
  onCancelEdit,
  onEditTextChange,
  onSubmitEdit,
  onDelete,
}: {
  comment: IdeaComment
  replies: IdeaComment[]
  currentUserId: string | null
  replyingTo: string | null
  editingCommentId: string | null
  replyText: string
  editText: string
  commentBusy: string | null
  onReply: (commentId: string) => void
  onCancelReply: () => void
  onReplyTextChange: (value: string) => void
  onSubmitReply: (parentCommentId: string) => void
  onEdit: (comment: IdeaComment) => void
  onCancelEdit: () => void
  onEditTextChange: (value: string) => void
  onSubmitEdit: (commentId: string) => void
  onDelete: (commentId: string) => void
}) {
  const isOwner = currentUserId === comment.user_id

  const authorName =
    comment.author?.full_name || 'RicozSpark User'

  return (
    <div className="rounded-2xl border border-border bg-background p-5">

      {/* Main comment */}
      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {authorName.charAt(0).toUpperCase()}
        </div>


        <div className="min-w-0 flex-1">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-sm font-semibold text-foreground">
                {authorName}
              </p>

              <p className="mt-1 text-xs text-muted">
                {formatDateTime(comment.created_at)}
              </p>
            </div>


            {isOwner && (
              <div className="flex items-center gap-1">

                <button
                  type="button"
                  title="Edit comment"
                  onClick={() => onEdit(comment)}
                  className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>


                <button
                  type="button"
                  title="Delete comment"
                  onClick={() => onDelete(comment.id)}
                  disabled={
                    commentBusy === `delete-${comment.id}`
                  }
                  className="rounded-lg p-2 text-muted transition hover:bg-red-500/10 hover:text-red-400"
                >
                  {commentBusy === `delete-${comment.id}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>

              </div>
            )}

          </div>


          {/* Content / Edit */}
          {editingCommentId === comment.id ? (
            <div className="mt-4 space-y-3">

              <textarea
                value={editText}
                onChange={(event) =>
                  onEditTextChange(event.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary/50"
              />

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() => onSubmitEdit(comment.id)}
                  disabled={
                    !editText.trim() ||
                    commentBusy === `edit-${comment.id}`
                  }
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {commentBusy === `edit-${comment.id}`
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>


                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:text-foreground"
                >
                  Cancel
                </button>

              </div>
            </div>
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {comment.content}
            </p>
          )}


          {/* Reply button */}
          <div className="mt-4">

            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-primary"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>

          </div>


          {/* Reply composer */}
          {replyingTo === comment.id && (
            <div className="mt-4 rounded-xl border border-border bg-surface p-4">

              <textarea
                value={replyText}
                onChange={(event) =>
                  onReplyTextChange(event.target.value)
                }
                placeholder="Write a reply..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary/50"
              />

              <div className="mt-3 flex justify-end gap-2">

                <button
                  type="button"
                  onClick={onCancelReply}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:text-foreground"
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={() => onSubmitReply(comment.id)}
                  disabled={
                    !replyText.trim() ||
                    commentBusy === `reply-${comment.id}`
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {commentBusy === `reply-${comment.id}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}

                  Reply
                </button>

              </div>
            </div>
          )}


          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-5 space-y-3 border-l border-border pl-5">

              {replies.map((reply) => {
                const replyAuthor =
                  reply.author?.full_name ||
                  'RicozSpark User'

                const replyOwner =
                  currentUserId === reply.user_id

                return (
                  <div
                    key={reply.id}
                    className="rounded-xl border border-border bg-surface p-4"
                  >

                    <div className="flex items-start gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {replyAuthor.charAt(0).toUpperCase()}
                      </div>


                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {replyAuthor}
                            </p>

                            <p className="mt-1 text-[11px] text-muted">
                              {formatDateTime(reply.created_at)}
                            </p>
                          </div>


                          {replyOwner && (
                            <div className="flex gap-1">

                              <button
                                type="button"
                                title="Edit reply"
                                onClick={() => onEdit(reply)}
                                className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>


                              <button
                                type="button"
                                title="Delete reply"
                                onClick={() => onDelete(reply.id)}
                                disabled={
                                  commentBusy ===
                                  `delete-${reply.id}`
                                }
                                className="rounded-md p-1.5 text-muted hover:bg-background hover:text-red-400"
                              >
                                {commentBusy ===
                                `delete-${reply.id}` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </button>

                            </div>
                          )}

                        </div>


                        {editingCommentId === reply.id ? (
                          <div className="mt-3 space-y-2">

                            <textarea
                              value={editText}
                              onChange={(event) =>
                                onEditTextChange(event.target.value)
                              }
                              rows={3}
                              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted focus:border-primary/50"
                            />

                            <div className="flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  onSubmitEdit(reply.id)
                                }
                                disabled={
                                  !editText.trim() ||
                                  commentBusy ===
                                    `edit-${reply.id}`
                                }
                                className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
                              >
                                {commentBusy ===
                                `edit-${reply.id}`
                                  ? 'Saving...'
                                  : 'Save'}
                              </button>


                              <button
                                type="button"
                                onClick={onCancelEdit}
                                className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted"
                              >
                                Cancel
                              </button>

                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-foreground">
                            {reply.content}
                          </p>
                        )}

                      </div>

                    </div>
                  </div>
                )
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  )
}


/* =========================================================
   MAIN PAGE
========================================================= */

export function IdeaCommunityPage() {
  const { ideaId } = useParams<{
    ideaId: string
  }>()

  const [idea, setIdea] =
    useState<IdeaDetail | null>(null)

  const [comments, setComments] =
    useState<IdeaComment[]>([])

  const [communityStats, setCommunityStats] =
    useState<IdeaCommunityStats>({
      voteCount: 0,
      commentCount: 0,
      followerCount: 0,
      isVoted: false,
      isFollowing: false,
      isBookmarked: false,
    })

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [actionError, setActionError] =
    useState<string | null>(null)

  const [busyAction, setBusyAction] =
    useState<string | null>(null)

  const [newComment, setNewComment] =
    useState('')

  const [replyingTo, setReplyingTo] =
    useState<string | null>(null)

  const [replyText, setReplyText] =
    useState('')

  const [editingCommentId, setEditingCommentId] =
    useState<string | null>(null)

  const [editText, setEditText] =
    useState('')

  const [commentBusy, setCommentBusy] =
    useState<string | null>(null)


  /* =======================================================
     LOAD COMMUNITY DATA
  ======================================================= */

  const loadCommunity = useCallback(async () => {
    if (!ideaId) {
      setError('No idea was specified.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [
        detail,
        stats,
        ideaComments,
        userId,
      ] = await Promise.all([
        getIdeaDetail(ideaId),
        getIdeaCommunityStats(ideaId),
        getIdeaComments(ideaId),
        getCurrentUserId(),
      ])

      setIdea(detail.idea)
      setCommunityStats(stats)
      setComments(ideaComments)
      setCurrentUserId(userId)
    } catch (err) {
      console.error(
        'Failed to load community page:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load the idea community.',
      )
    } finally {
      setLoading(false)
    }
  }, [ideaId])


  useEffect(() => {
    // Intentional initial Supabase data fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCommunity()
  }, [loadCommunity])


  /* =======================================================
     VOTE
  ======================================================= */

  const handleVote = async () => {
    if (!ideaId) {
      return
    }

    try {
      setBusyAction('vote')
      setActionError(null)

      const isVoted =
        await toggleIdeaVote(ideaId)

      setCommunityStats((current) => ({
        ...current,
        isVoted,
        voteCount: Math.max(
          0,
          current.voteCount +
            (isVoted ? 1 : -1),
        ),
      }))
    } catch (err) {
      console.error(
        'Failed to toggle vote:',
        err,
      )

      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to update your vote.',
      )
    } finally {
      setBusyAction(null)
    }
  }


  /* =======================================================
     FOLLOW
  ======================================================= */

  const handleFollow = async () => {
    if (!ideaId) {
      return
    }

    try {
      setBusyAction('follow')
      setActionError(null)

      const isFollowing =
        await toggleIdeaFollow(ideaId)

      setCommunityStats((current) => ({
        ...current,
        isFollowing,
        followerCount: Math.max(
          0,
          current.followerCount +
            (isFollowing ? 1 : -1),
        ),
      }))
    } catch (err) {
      console.error(
        'Failed to toggle follow:',
        err,
      )

      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to update follow status.',
      )
    } finally {
      setBusyAction(null)
    }
  }


  /* =======================================================
     BOOKMARK
  ======================================================= */

  const handleBookmark = async () => {
    if (!ideaId) {
      return
    }

    try {
      setBusyAction('bookmark')
      setActionError(null)

      const isBookmarked =
        await toggleIdeaBookmark(ideaId)

      setCommunityStats((current) => ({
        ...current,
        isBookmarked,
      }))
    } catch (err) {
      console.error(
        'Failed to toggle bookmark:',
        err,
      )

      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to update bookmark.',
      )
    } finally {
      setBusyAction(null)
    }
  }


  /* =======================================================
     ADD COMMENT
  ======================================================= */

  const handleAddComment = async () => {
    if (!ideaId || !newComment.trim()) {
      return
    }

    try {
      setCommentBusy('comment')
      setActionError(null)

      const comment =
        await createComment(
          ideaId,
          newComment,
        )

      setComments((current) => [
        ...current,
        comment,
      ])

      setCommunityStats((current) => ({
        ...current,
        commentCount:
          current.commentCount + 1,
      }))

      setNewComment('')
    } catch (err) {
      console.error(
        'Failed to add comment:',
        err,
      )

      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to add your comment.',
      )
    } finally {
      setCommentBusy(null)
    }
  }


  /* =======================================================
     ADD REPLY
  ======================================================= */

  const handleAddReply = async (
    parentCommentId: string,
  ) => {
    if (!ideaId || !replyText.trim()) {
      return
    }

    try {
      setCommentBusy(
        `reply-${parentCommentId}`,
      )
      setActionError(null)

      const reply =
        await createComment(
          ideaId,
          replyText,
          parentCommentId,
        )

      setComments((current) => [
        ...current,
        reply,
      ])

      setCommunityStats((current) => ({
        ...current,
        commentCount:
          current.commentCount + 1,
      }))

      setReplyText('')
      setReplyingTo(null)
    } catch (err) {
      console.error(
        'Failed to add reply:',
        err,
      )

      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to add your reply.',
      )
    } finally {
      setCommentBusy(null)
    }
  }


  /* =======================================================
     EDIT COMMENT
  ======================================================= */

  const handleEdit = (
    comment: IdeaComment,
  ) => {
    setEditingCommentId(comment.id)
    setEditText(comment.content)
    setReplyingTo(null)
    setReplyText('')
  }


  const handleSubmitEdit = async (
    commentId: string,
  ) => {
    if (!editText.trim()) {
      return
    }

    try {
      setCommentBusy(
        `edit-${commentId}`,
      )
      setActionError(null)

      const updated =
        await updateComment(
          commentId,
          editText,
        )

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? updated
            : comment,
        ),
      )

      setEditingCommentId(null)
      setEditText('')
    } catch (err) {
      console.error(
        'Failed to update comment:',
        err,
      )

      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to update your comment.',
      )
    } finally {
      setCommentBusy(null)
    }
  }


  /* =======================================================
     DELETE COMMENT
  ======================================================= */

  const handleDelete = async (
    commentId: string,
  ) => {
    const confirmed =
      window.confirm(
        'Delete this comment?',
      )

    if (!confirmed) {
      return
    }

    try {
      setCommentBusy(
        `delete-${commentId}`,
      )
      setActionError(null)

      const deletedReplies =
        comments.filter(
          (comment) =>
            comment.parent_comment_id ===
            commentId,
        ).length

      await deleteComment(commentId)

      setComments((current) =>
        current.filter(
          (comment) =>
            comment.id !== commentId &&
            comment.parent_comment_id !==
              commentId,
        ),
      )

      setCommunityStats((current) => ({
        ...current,
        commentCount: Math.max(
          0,
          current.commentCount -
            1 -
            deletedReplies,
        ),
      }))

      if (
        editingCommentId ===
        commentId
      ) {
        setEditingCommentId(null)
        setEditText('')
      }
    } catch (err) {
      console.error(
        'Failed to delete comment:',
        err,
      )

      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to delete your comment.',
      )
    } finally {
      setCommentBusy(null)
    }
  }


  /* =======================================================
     ORGANIZE COMMENTS
  ======================================================= */

  const rootComments =
    useMemo(
      () =>
        comments.filter(
          (comment) =>
            !comment.parent_comment_id,
        ),
      [comments],
    )


  const repliesByParent =
    useMemo(() => {
      const map = new Map<
        string,
        IdeaComment[]
      >()

      for (const comment of comments) {
        if (!comment.parent_comment_id) {
          continue
        }

        const replies =
          map.get(
            comment.parent_comment_id,
          ) ?? []

        replies.push(comment)

        map.set(
          comment.parent_comment_id,
          replies,
        )
      }

      return map
    }, [comments])


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading community...
        </div>
      </section>
    )
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !idea) {
    return (
      <section className="space-y-6">

        <Link
          to={
            ideaId
              ? `/ideas/${ideaId}`
              : '/ideas'
          }
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Idea
        </Link>


        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">

          <div className="flex items-start gap-3">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div>
              <h1 className="font-semibold text-foreground">
                Unable to load community
              </h1>

              <p className="mt-2 text-sm text-muted">
                {error ??
                  'The requested idea could not be found.'}
              </p>
            </div>

          </div>

        </div>
      </section>
    )
  }


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <section className="mx-auto max-w-5xl space-y-6">

      {/* Back */}
      <Link
        to={`/ideas/${idea.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Idea
      </Link>


      {/* Idea header */}
      <div className="rounded-2xl border border-border bg-surface p-6">

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="font-mono text-xs font-medium text-primary">
                {idea.idea_code}
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                  idea.status,
                )}`}
              >
                {formatStatus(idea.status)}
              </span>

              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                {idea.priority
                  .charAt(0)
                  .toUpperCase() +
                  idea.priority
                    .slice(1)
                    .toLowerCase()}
              </span>

            </div>


            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              {idea.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              {idea.short_description}
            </p>

          </div>


          <div className="shrink-0 rounded-xl border border-border bg-background px-4 py-3">

            <p className="text-xs uppercase tracking-wide text-muted">
              Community
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              Discussion
            </p>

          </div>

        </div>


        <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Category
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {idea.category?.name ??
                'Not assigned'}
            </p>
          </div>


          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Submitted
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDateTime(
                idea.submitted_at ??
                  idea.created_at,
              )}
            </p>
          </div>


          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Reference
            </p>

            <p className="mt-1 font-mono text-sm font-medium text-primary">
              {idea.idea_code}
            </p>
          </div>

        </div>

      </div>


      {/* Actions */}
      <CommunityActions
        stats={communityStats}
        busyAction={busyAction}
        onVote={handleVote}
        onFollow={handleFollow}
        onBookmark={handleBookmark}
      />


      {/* Action error */}
      {actionError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">

          <div className="flex items-start gap-3">

            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

            <p className="flex-1 text-sm text-red-300">
              {actionError}
            </p>

            <button
              type="button"
              onClick={() =>
                setActionError(null)
              }
              className="text-xs text-red-300 transition hover:text-red-200"
            >
              Dismiss
            </button>

          </div>

        </div>
      )}


      {/* Discussion */}
      <section
        id="discussion"
        className="rounded-2xl border border-border bg-surface p-6"
      >

        <div className="mb-6 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">
                Community Discussion
              </h2>

              <p className="mt-1 text-xs text-muted">
                Share feedback, ask questions, and collaborate
                around this idea.
              </p>
            </div>

          </div>


          <div className="hidden rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted sm:block">
            {communityStats.commentCount}{' '}
            {communityStats.commentCount === 1
              ? 'comment'
              : 'comments'}
          </div>

        </div>


        {/* New comment */}
        <div className="rounded-xl border border-border bg-background p-4">

          <textarea
            value={newComment}
            onChange={(event) =>
              setNewComment(event.target.value)
            }
            placeholder="Share your thoughts on this idea..."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary/50"
          />


          <div className="mt-3 flex items-center justify-between gap-3">

            <p className="text-xs text-muted">
              Keep feedback constructive and relevant.
            </p>

            <button
              type="button"
              onClick={handleAddComment}
              disabled={
                !newComment.trim() ||
                commentBusy === 'comment'
              }
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentBusy === 'comment' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              Add Comment
            </button>

          </div>

        </div>


        {/* Comments */}
        <div className="mt-6 space-y-4">

          {rootComments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center">

              <MessageCircle className="mx-auto h-9 w-9 text-muted" />

              <p className="mt-4 text-sm font-semibold text-foreground">
                No comments yet
              </p>

              <p className="mt-1 text-xs text-muted">
                Be the first person to start the discussion.
              </p>

            </div>
          ) : (
            rootComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                replies={
                  repliesByParent.get(
                    comment.id,
                  ) ?? []
                }
                currentUserId={currentUserId}
                replyingTo={replyingTo}
                editingCommentId={
                  editingCommentId
                }
                replyText={replyText}
                editText={editText}
                commentBusy={commentBusy}
                onReply={(commentId) => {
                  setReplyingTo(commentId)
                  setReplyText('')
                  setEditingCommentId(null)
                }}
                onCancelReply={() => {
                  setReplyingTo(null)
                  setReplyText('')
                }}
                onReplyTextChange={setReplyText}
                onSubmitReply={handleAddReply}
                onEdit={handleEdit}
                onCancelEdit={() => {
                  setEditingCommentId(null)
                  setEditText('')
                }}
                onEditTextChange={setEditText}
                onSubmitEdit={handleSubmitEdit}
                onDelete={handleDelete}
              />
            ))
          )}

        </div>

      </section>


      {/* Community statistics */}
      <section className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-border bg-surface p-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ThumbsUp className="h-4 w-4" />
          </div>

          <p className="mt-4 text-2xl font-semibold text-foreground">
            {communityStats.voteCount}
          </p>

          <p className="mt-1 text-xs text-muted">
            Community votes
          </p>

        </div>


        <div className="rounded-2xl border border-border bg-surface p-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageCircle className="h-4 w-4" />
          </div>

          <p className="mt-4 text-2xl font-semibold text-foreground">
            {communityStats.commentCount}
          </p>

          <p className="mt-1 text-xs text-muted">
            Discussion comments
          </p>

        </div>


        <div className="rounded-2xl border border-border bg-surface p-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRoundCheck className="h-4 w-4" />
          </div>

          <p className="mt-4 text-2xl font-semibold text-foreground">
            {communityStats.followerCount}
          </p>

          <p className="mt-1 text-xs text-muted">
            People following
          </p>

        </div>

      </section>

    </section>
  )
}