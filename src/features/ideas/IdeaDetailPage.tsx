import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  History,
  Lightbulb,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Reply,
  Send,
  Target,
  Trash2,
  UserPlus,
  UserRoundCheck,
  ThumbsUp,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  getIdeaDetail,
  type IdeaActivity,
  type IdeaDetail,
  type IdeaStatusHistory,
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

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

function formatActivityType(type: string) {
  return type
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
   SHARED DETAIL COMPONENTS
   ========================================================= */

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <h2 className="text-base font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {children}
    </section>
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: string | number | null
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {value === null || value === ''
          ? 'Not provided'
          : String(value)}
      </p>
    </div>
  )
}


/* =========================================================
   STATUS HISTORY
   ========================================================= */

function StatusHistory({
  history,
}: {
  history: IdeaStatusHistory[]
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <History className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Lifecycle History
          </h2>

          <p className="mt-1 text-xs text-muted">
            Track how this idea has progressed through the innovation
            workflow.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted">
          No lifecycle history is available yet.
        </p>
      ) : (
        <div className="space-y-5">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="relative flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                {index < history.length - 1 && (
                  <div className="mt-2 h-full w-px bg-border" />
                )}
              </div>

              <div className="pb-2">
                <p className="text-sm font-medium text-foreground">
                  {item.from_status
                    ? `${formatStatus(item.from_status)} → ${formatStatus(
                        item.to_status,
                      )}`
                    : formatStatus(item.to_status)}
                </p>

                {item.reason && (
                  <p className="mt-1 text-sm text-muted">
                    {item.reason}
                  </p>
                )}

                <p className="mt-2 text-xs text-muted">
                  {formatDateTime(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}


/* =========================================================
   ACTIVITY
   ========================================================= */

function ActivityFeed({
  activity,
}: {
  activity: IdeaActivity[]
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Clock3 className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Activity
          </h2>

          <p className="mt-1 text-xs text-muted">
            Recent activity recorded for this idea.
          </p>
        </div>
      </div>

      {activity.length === 0 ? (
        <p className="text-sm text-muted">
          No activity has been recorded yet.
        </p>
      ) : (
        <div className="space-y-4">
          {activity.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.description ||
                      formatActivityType(
                        item.activity_type,
                      )}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {formatActivityType(
                      item.activity_type,
                    )}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-muted">
                  {formatDateTime(item.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}


/* =========================================================
   COMMUNITY ACTIONS
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
    <div className="rounded-2xl border border-border bg-surface p-4">
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
            <ThumbsUp className="h-4 w-4" />
          )}

          {stats.isVoted ? 'Voted' : 'Upvote'}

          <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs">
            {stats.voteCount}
          </span>
        </button>


        {/* Comments */}
        <a
          href="#community"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted transition hover:border-primary/30 hover:text-primary"
        >
          <MessageCircle className="h-4 w-4" />

          Comments

          <span className="rounded-full bg-surface px-2 py-0.5 text-xs">
            {stats.commentCount}
          </span>
        </a>


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

          {stats.isFollowing
            ? 'Following'
            : 'Follow'}
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
                stats.isBookmarked
                  ? 'fill-current'
                  : ''
              }`}
            />
          )}

          {stats.isBookmarked
            ? 'Saved'
            : 'Save'}
        </button>

      </div>
    </div>
  )
}


/* =========================================================
   COMMENT ITEM
   ========================================================= */

function CommentItem({
  comment,
  replies,
  currentUserId,
  replyingTo,
  editingCommentId,
  replyText,
  editText,
  commentBusy,
  onReplyStart,
  onReplyCancel,
  onReplyTextChange,
  onReplySubmit,
  onEditStart,
  onEditCancel,
  onEditTextChange,
  onEditSubmit,
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
  onReplyStart: (commentId: string) => void
  onReplyCancel: () => void
  onReplyTextChange: (value: string) => void
  onReplySubmit: (
    parentCommentId: string,
  ) => void
  onEditStart: (
    comment: IdeaComment,
  ) => void
  onEditCancel: () => void
  onEditTextChange: (value: string) => void
  onEditSubmit: (
    commentId: string,
  ) => void
  onDelete: (
    commentId: string,
  ) => void
}) {
  const isOwner =
    currentUserId === comment.user_id

  const authorName =
    comment.author?.full_name ||
    'RicozSpark User'

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-background p-4">
        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {authorName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {authorName}
                </p>

                <p className="mt-0.5 text-xs text-muted">
                  {formatDateTime(
                    comment.created_at,
                  )}
                </p>
              </div>

              {isOwner && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Edit comment"
                    onClick={() =>
                      onEditStart(comment)
                    }
                    className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Delete comment"
                    onClick={() =>
                      onDelete(comment.id)
                    }
                    disabled={
                      commentBusy ===
                      `delete-${comment.id}`
                    }
                    className="rounded-lg p-2 text-muted transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    {commentBusy ===
                    `delete-${comment.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>


            {editingCommentId === comment.id ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={editText}
                  onChange={(event) =>
                    onEditTextChange(
                      event.target.value,
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary/50"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onEditSubmit(comment.id)
                    }
                    disabled={
                      commentBusy ===
                      `edit-${comment.id}`
                    }
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    {commentBusy ===
                    `edit-${comment.id}`
                      ? 'Saving...'
                      : 'Save'}
                  </button>

                  <button
                    type="button"
                    onClick={onEditCancel}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {comment.content}
              </p>
            )}


            <div className="mt-3">
              <button
                type="button"
                onClick={() =>
                  onReplyStart(comment.id)
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-primary"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
            </div>


            {replyingTo === comment.id && (
              <div className="mt-3 rounded-xl border border-border bg-surface p-3">
                <textarea
                  value={replyText}
                  onChange={(event) =>
                    onReplyTextChange(
                      event.target.value,
                    )
                  }
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary/50"
                />

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onReplyCancel}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-foreground"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onReplySubmit(comment.id)
                    }
                    disabled={
                      !replyText.trim() ||
                      commentBusy ===
                        `reply-${comment.id}`
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {commentBusy ===
                    `reply-${comment.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}

                    Reply
                  </button>
                </div>
              </div>
            )}


            {replies.length > 0 && (
              <div className="mt-4 space-y-3 border-l border-border pl-4">
                {replies.map((reply) => {
                  const replyOwner =
                    currentUserId ===
                    reply.user_id

                  const replyAuthor =
                    reply.author?.full_name ||
                    'RicozSpark User'

                  return (
                    <div
                      key={reply.id}
                      className="rounded-xl border border-border bg-surface p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {replyAuthor
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium text-foreground">
                                {replyAuthor}
                              </p>

                              <p className="mt-0.5 text-[11px] text-muted">
                                {formatDateTime(
                                  reply.created_at,
                                )}
                              </p>
                            </div>

                            {replyOwner && (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  title="Edit reply"
                                  onClick={() =>
                                    onEditStart(
                                      reply,
                                    )
                                  }
                                  className="rounded-md p-1.5 text-muted hover:bg-background hover:text-primary"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>

                                <button
                                  type="button"
                                  title="Delete reply"
                                  onClick={() =>
                                    onDelete(
                                      reply.id,
                                    )
                                  }
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

                          {editingCommentId ===
                          reply.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={editText}
                                onChange={(event) =>
                                  onEditTextChange(
                                    event.target
                                      .value,
                                  )
                                }
                                rows={2}
                                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted focus:border-primary/50"
                              />

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onEditSubmit(
                                      reply.id,
                                    )
                                  }
                                  disabled={
                                    commentBusy ===
                                    `edit-${reply.id}`
                                  }
                                  className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground"
                                >
                                  {commentBusy ===
                                  `edit-${reply.id}`
                                    ? 'Saving...'
                                    : 'Save'}
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    onEditCancel
                                  }
                                  className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-foreground">
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
    </div>
  )
}


/* =========================================================
   COMMUNITY SECTION
   ========================================================= */

function CommunitySection({
  comments,
  currentUserId,
  newComment,
  setNewComment,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  editingCommentId,
  setEditingCommentId,
  editText,
  setEditText,
  commentBusy,
  onCommentSubmit,
  onReplySubmit,
  onEditSubmit,
  onDelete,
}: {
  comments: IdeaComment[]
  currentUserId: string | null
  newComment: string
  setNewComment: (
    value: string,
  ) => void
  replyingTo: string | null
  setReplyingTo: (
    value: string | null,
  ) => void
  replyText: string
  setReplyText: (
    value: string,
  ) => void
  editingCommentId: string | null
  setEditingCommentId: (
    value: string | null,
  ) => void
  editText: string
  setEditText: (
    value: string,
  ) => void
  commentBusy: string | null
  onCommentSubmit: () => void
  onReplySubmit: (
    parentCommentId: string,
  ) => void
  onEditSubmit: (
    commentId: string,
  ) => void
  onDelete: (
    commentId: string,
  ) => void
}) {
  const rootComments = useMemo(
    () =>
      comments.filter(
        (comment) =>
          !comment.parent_comment_id,
      ),
    [comments],
  )

  const repliesByParent = useMemo(() => {
    const map = new Map<
      string,
      IdeaComment[]
    >()

    for (const comment of comments) {
      if (!comment.parent_comment_id) {
        continue
      }

      const existing =
        map.get(
          comment.parent_comment_id,
        ) ?? []

      existing.push(comment)

      map.set(
        comment.parent_comment_id,
        existing,
      )
    }

    return map
  }, [comments])

  return (
    <section
      id="community"
      className="rounded-2xl border border-border bg-surface p-6"
    >
      <div className="mb-6 flex items-center gap-3">
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

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onCommentSubmit}
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
          <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-muted" />

            <p className="mt-3 text-sm font-medium text-foreground">
              No comments yet
            </p>

            <p className="mt-1 text-xs text-muted">
              Be the first person to start the discussion.
            </p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={
                repliesByParent.get(
                  comment.id,
                ) ?? []
              }
              currentUserId={
                currentUserId
              }
              replyingTo={replyingTo}
              editingCommentId={
                editingCommentId
              }
              replyText={replyText}
              editText={editText}
              commentBusy={commentBusy}
              onReplyStart={(commentId) => {
                setReplyingTo(commentId)
                setReplyText('')
                setEditingCommentId(null)
              }}
              onReplyCancel={() => {
                setReplyingTo(null)
                setReplyText('')
              }}
              onReplyTextChange={
                setReplyText
              }
              onReplySubmit={
                onReplySubmit
              }
              onEditStart={(comment) => {
                setEditingCommentId(
                  comment.id,
                )
                setEditText(
                  comment.content,
                )
                setReplyingTo(null)
              }}
              onEditCancel={() => {
                setEditingCommentId(null)
                setEditText('')
              }}
              onEditTextChange={
                setEditText
              }
              onEditSubmit={
                onEditSubmit
              }
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  )
}


/* =========================================================
   MAIN PAGE
   ========================================================= */

export function IdeaDetailPage() {
  const { ideaId } = useParams<{
    ideaId: string
  }>()

  const [idea, setIdea] =
    useState<IdeaDetail | null>(null)

  const [statusHistory, setStatusHistory] =
    useState<IdeaStatusHistory[]>([])

  const [activity, setActivity] =
    useState<IdeaActivity[]>([])

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

  const [communityLoading, setCommunityLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [communityError, setCommunityError] =
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
     LOAD IDEA
     ======================================================= */

  const loadIdea = useCallback(
    async () => {
      if (!ideaId) {
        setError('No idea was specified.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const data =
          await getIdeaDetail(ideaId)

        setIdea(data.idea)
        setStatusHistory(
          data.statusHistory,
        )
        setActivity(data.activity)
      } catch (err) {
        console.error(
          'Failed to load idea detail:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load the idea.',
        )
      } finally {
        setLoading(false)
      }
    },
    [ideaId],
  )


  /* =======================================================
     LOAD COMMUNITY
     ======================================================= */

  const loadCommunity =
    useCallback(async () => {
      if (!ideaId) {
        return
      }

      try {
        setCommunityLoading(true)
        setCommunityError(null)

        const [
          stats,
          ideaComments,
          ideaActivity,
          userId,
        ] = await Promise.all([
          getIdeaCommunityStats(
            ideaId,
          ),
          getIdeaComments(
            ideaId,
          ),
          Promise.resolve(null),
          getCurrentUserId(),
        ])

        setCommunityStats(stats)
        setComments(ideaComments)
        setCurrentUserId(userId)

        void ideaActivity
      } catch (err) {
        console.error(
          'Failed to load community:',
          err,
        )

        setCommunityError(
          err instanceof Error
            ? err.message
            : 'Unable to load community features.',
        )
      } finally {
        setCommunityLoading(false)
      }
    }, [ideaId])


  /* =======================================================
     INITIAL DATA LOAD
     ======================================================= */

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(() => {
      if (cancelled) {
        return
      }

      void loadIdea()
      void loadCommunity()
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [loadIdea, loadCommunity])


  /* =======================================================
     VOTE
     ======================================================= */

  const handleVote = async () => {
    if (!ideaId) return

    try {
      setBusyAction('vote')

      const isVoted =
        await toggleIdeaVote(
          ideaId,
        )

      setCommunityStats(
        (current) => ({
          ...current,
          isVoted,
          voteCount:
            current.voteCount +
            (isVoted ? 1 : -1),
        }),
      )
    } catch (err) {
      console.error(
        'Failed to toggle vote:',
        err,
      )

      setCommunityError(
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
    if (!ideaId) return

    try {
      setBusyAction('follow')

      const isFollowing =
        await toggleIdeaFollow(
          ideaId,
        )

      setCommunityStats(
        (current) => ({
          ...current,
          isFollowing,
          followerCount:
            current.followerCount +
            (isFollowing ? 1 : -1),
        }),
      )
    } catch (err) {
      console.error(
        'Failed to toggle follow:',
        err,
      )

      setCommunityError(
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

  const handleBookmark =
    async () => {
      if (!ideaId) return

      try {
        setBusyAction(
          'bookmark',
        )

        const isBookmarked =
          await toggleIdeaBookmark(
            ideaId,
          )

        setCommunityStats(
          (current) => ({
            ...current,
            isBookmarked,
          }),
        )
      } catch (err) {
        console.error(
          'Failed to toggle bookmark:',
          err,
        )

        setCommunityError(
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

  const handleCommentSubmit =
    async () => {
      if (
        !ideaId ||
        !newComment.trim()
      ) {
        return
      }

      try {
        setCommentBusy('comment')

        const comment =
          await createComment(
            ideaId,
            newComment,
          )

        setComments(
          (current) => [
            ...current,
            comment,
          ],
        )

        setCommunityStats(
          (current) => ({
            ...current,
            commentCount:
              current.commentCount + 1,
          }),
        )

        setNewComment('')
      } catch (err) {
        console.error(
          'Failed to create comment:',
          err,
        )

        setCommunityError(
          err instanceof Error
            ? err.message
            : 'Unable to add your comment.',
        )
      } finally {
        setCommentBusy(null)
      }
    }


  /* =======================================================
     REPLY
     ======================================================= */

  const handleReplySubmit =
    async (
      parentCommentId: string,
    ) => {
      if (
        !ideaId ||
        !replyText.trim()
      ) {
        return
      }

      try {
        setCommentBusy(
          `reply-${parentCommentId}`,
        )

        const reply =
          await createComment(
            ideaId,
            replyText,
            parentCommentId,
          )

        setComments(
          (current) => [
            ...current,
            reply,
          ],
        )

        setCommunityStats(
          (current) => ({
            ...current,
            commentCount:
              current.commentCount + 1,
          }),
        )

        setReplyText('')
        setReplyingTo(null)
      } catch (err) {
        console.error(
          'Failed to create reply:',
          err,
        )

        setCommunityError(
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

  const handleEditSubmit =
    async (
      commentId: string,
    ) => {
      if (!editText.trim()) {
        return
      }

      try {
        setCommentBusy(
          `edit-${commentId}`,
        )

        const updated =
          await updateComment(
            commentId,
            editText,
          )

        setComments(
          (current) =>
            current.map(
              (comment) =>
                comment.id ===
                commentId
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

        setCommunityError(
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

  const handleDeleteComment =
    async (
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

        await deleteComment(
          commentId,
        )

        setComments(
          (current) =>
            current.filter(
              (comment) =>
                comment.id !==
                commentId &&
                comment.parent_comment_id !==
                  commentId,
            ),
        )

        setCommunityStats(
          (current) => {
            const deletedComment =
              comments.find(
                (comment) =>
                  comment.id ===
                  commentId,
              )

            const deletedReplies =
              comments.filter(
                (comment) =>
                  comment.parent_comment_id ===
                  commentId,
              ).length

            const decrement =
              deletedComment
                ? 1 + deletedReplies
                : 0

            return {
              ...current,
              commentCount:
                Math.max(
                  0,
                  current.commentCount -
                    decrement,
                ),
            }
          },
        )

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

        setCommunityError(
          err instanceof Error
            ? err.message
            : 'Unable to delete your comment.',
        )
      } finally {
        setCommentBusy(null)
      }
    }


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading idea...
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
          to="/ideas/my"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Ideas
        </Link>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div>
              <h1 className="font-semibold text-foreground">
                Unable to load idea
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
    <section className="space-y-6">

      {/* Back */}
      <Link
        to="/ideas/my"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Ideas
      </Link>


      {/* Header */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

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
                {formatStatus(
                  idea.status,
                )}
              </span>

              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
                {idea.priority.charAt(0) +
                  idea.priority
                    .slice(1)
                    .toLowerCase()}
              </span>

            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              {idea.title}
            </h1>

            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
              {idea.short_description}
            </p>
          </div>


          <div className="shrink-0 rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted">
              Submitted
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(
                idea.submitted_at ??
                  idea.created_at,
              )}
            </p>
          </div>

        </div>


        <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">

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
              Revision
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {idea.revision_number}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Created
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(
                idea.created_at,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Last updated
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(
                idea.updated_at,
              )}
            </p>
          </div>

        </div>
      </div>


      {/* Community Actions */}
      {communityLoading ? (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading community...
          </div>
        </div>
      ) : (
        <CommunityActions
          stats={communityStats}
          busyAction={busyAction}
          onVote={handleVote}
          onFollow={handleFollow}
          onBookmark={handleBookmark}
        />
      )}


      {/* Community Error */}
      {communityError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

            <div className="flex-1">
              <p className="text-sm text-red-300">
                {communityError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setCommunityError(null)
              }
              className="text-xs text-red-300 hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}


      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

        <div className="space-y-6">

          <DetailSection
            icon={
              <Lightbulb className="h-4 w-4" />
            }
            title="Idea Context"
          >
            <div className="space-y-6">
              <DetailField
                label="Problem Statement"
                value={
                  idea.problem_statement
                }
              />

              <DetailField
                label="Proposed Solution"
                value={
                  idea.proposed_solution
                }
              />
            </div>
          </DetailSection>


          <DetailSection
            icon={
              <Target className="h-4 w-4" />
            }
            title="Business Context"
          >
            <div className="grid gap-6 md:grid-cols-2">

              <DetailField
                label="Expected Benefits"
                value={
                  idea.expected_benefits
                }
              />

              <DetailField
                label="Business Impact"
                value={
                  idea.business_impact
                }
              />

              <DetailField
                label="Target Users"
                value={
                  idea.target_users
                }
              />

              <DetailField
                label="Strategic Alignment"
                value={
                  idea.strategic_alignment
                }
              />

            </div>
          </DetailSection>


          <DetailSection
            icon={
              <FileText className="h-4 w-4" />
            }
            title="Implementation"
          >
            <div className="space-y-6">

              <DetailField
                label="Implementation Approach"
                value={
                  idea.implementation_approach
                }
              />

              <div className="grid gap-6 md:grid-cols-2">

                <DetailField
                  label="Estimated Effort"
                  value={
                    idea.estimated_effort
                  }
                />

                <DetailField
                  label="Estimated Cost"
                  value={
                    idea.estimated_cost ===
                    null
                      ? null
                      : `₹${idea.estimated_cost.toLocaleString(
                          'en-IN',
                        )}`
                  }
                />

                <DetailField
                  label="Dependencies"
                  value={
                    idea.dependencies
                  }
                />

                <DetailField
                  label="Risks"
                  value={
                    idea.risks
                  }
                />

              </div>
            </div>
          </DetailSection>


          {idea.category?.description && (
            <DetailSection
              icon={
                <Flag className="h-4 w-4" />
              }
              title="Category"
            >
              <p className="text-sm leading-6 text-muted">
                {idea.category.description}
              </p>
            </DetailSection>
          )}


          {/* Community */}
          <CommunitySection
            comments={comments}
            currentUserId={
              currentUserId
            }
            newComment={newComment}
            setNewComment={
              setNewComment
            }
            replyingTo={replyingTo}
            setReplyingTo={
              setReplyingTo
            }
            replyText={replyText}
            setReplyText={
              setReplyText
            }
            editingCommentId={
              editingCommentId
            }
            setEditingCommentId={
              setEditingCommentId
            }
            editText={editText}
            setEditText={setEditText}
            commentBusy={commentBusy}
            onCommentSubmit={
              handleCommentSubmit
            }
            onReplySubmit={
              handleReplySubmit
            }
            onEditSubmit={
              handleEditSubmit
            }
            onDelete={
              handleDeleteComment
            }
          />


          <StatusHistory
            history={statusHistory}
          />

          <ActivityFeed
            activity={activity}
          />

        </div>


        {/* Sidebar */}
        <aside className="space-y-6">

          <div className="rounded-2xl border border-border bg-surface p-6">

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="h-4 w-4" />
              </div>

              <h2 className="text-base font-semibold text-foreground">
                Submission Details
              </h2>
            </div>


            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Reference
                </p>

                <p className="mt-1 font-mono text-sm font-medium text-primary">
                  {idea.idea_code}
                </p>
              </div>


              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatStatus(
                    idea.status,
                  )}
                </p>
              </div>


              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Priority
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {idea.priority.charAt(0) +
                    idea.priority
                      .slice(1)
                      .toLowerCase()}
                </p>
              </div>


              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Revision
                </p>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {idea.revision_number}
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

            </div>
          </div>


          {/* Community summary */}
          <div className="rounded-2xl border border-border bg-surface p-6">

            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Community
              </h2>

              <MoreHorizontal className="h-4 w-4 text-muted" />
            </div>


            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="rounded-xl border border-border bg-background p-4">
                <ThumbsUp className="h-4 w-4 text-primary" />

                <p className="mt-3 text-xl font-semibold text-foreground">
                  {communityStats.voteCount}
                </p>

                <p className="mt-1 text-xs text-muted">
                  Votes
                </p>
              </div>


              <div className="rounded-xl border border-border bg-background p-4">
                <MessageCircle className="h-4 w-4 text-primary" />

                <p className="mt-3 text-xl font-semibold text-foreground">
                  {communityStats.commentCount}
                </p>

                <p className="mt-1 text-xs text-muted">
                  Comments
                </p>
              </div>


              <div className="rounded-xl border border-border bg-background p-4">
                <UserRoundCheck className="h-4 w-4 text-primary" />

                <p className="mt-3 text-xl font-semibold text-foreground">
                  {communityStats.followerCount}
                </p>

                <p className="mt-1 text-xs text-muted">
                  Followers
                </p>
              </div>


              <div className="rounded-xl border border-border bg-background p-4">
                <Bookmark className="h-4 w-4 text-primary" />

                <p className="mt-3 text-xl font-semibold text-foreground">
                  {communityStats.isBookmarked
                    ? 'Saved'
                    : '—'}
                </p>

                <p className="mt-1 text-xs text-muted">
                  Your bookmark
                </p>
              </div>

            </div>
          </div>


          {/* Current Stage */}
          <div className="rounded-2xl border border-border bg-surface p-6">

            <h2 className="text-base font-semibold text-foreground">
              Current Stage
            </h2>


            <div className="mt-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatStatus(
                      idea.status,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Current lifecycle status
                  </p>
                </div>

              </div>


              <div className="mt-5 h-2 overflow-hidden rounded-full bg-background">

                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width:
                      idea.status ===
                      'SUBMITTED'
                        ? '20%'
                        : idea.status ===
                            'UNDER_REVIEW'
                          ? '35%'
                          : idea.status ===
                              'UNDER_EVALUATION'
                            ? '50%'
                            : idea.status ===
                                'APPROVED'
                              ? '70%'
                              : idea.status ===
                                  'IN_PIPELINE'
                                ? '85%'
                                : idea.status ===
                                    'CONVERTED_TO_PROJECT'
                                  ? '100%'
                                  : '20%',
                  }}
                />

              </div>

            </div>
          </div>

        </aside>

      </div>
    </section>
  )
}