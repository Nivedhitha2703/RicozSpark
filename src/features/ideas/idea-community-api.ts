import { supabase } from '../../lib/supabase/client'

export type IdeaCommunityStats = {
  voteCount: number
  commentCount: number
  followerCount: number
  isVoted: boolean
  isFollowing: boolean
  isBookmarked: boolean
}

export type IdeaComment = {
  id: string
  idea_id: string
  user_id: string
  parent_comment_id: string | null
  content: string
  created_at: string
  updated_at: string
  author: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export type IdeaActivity = {
  id: string
  idea_id: string
  user_id: string | null
  activity_type: string
  description: string | null
  created_at: string
  actor: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

/* =========================================================
   CURRENT USER
   ========================================================= */

export async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(
      error.message || 'Unable to identify the current user.',
    )
  }

  if (!user) {
    throw new Error(
      'You must be signed in to perform this action.',
    )
  }

  return user.id
}

/* =========================================================
   COMMUNITY STATS
   ========================================================= */

export async function getIdeaCommunityStats(
  ideaId: string,
): Promise<IdeaCommunityStats> {
  const userId = await getCurrentUserId()

  const [
    votesResult,
    commentsResult,
    followersResult,
    userVoteResult,
    userFollowerResult,
    userBookmarkResult,
  ] = await Promise.all([
    supabase
      .from('idea_votes')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('idea_id', ideaId),

    supabase
      .from('idea_comments')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('idea_id', ideaId),

    supabase
      .from('idea_followers')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('idea_id', ideaId),

    supabase
      .from('idea_votes')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .maybeSingle(),

    supabase
      .from('idea_followers')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .maybeSingle(),

    supabase
      .from('idea_bookmarks')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const results = [
    votesResult,
    commentsResult,
    followersResult,
    userVoteResult,
    userFollowerResult,
    userBookmarkResult,
  ]

  for (const result of results) {
    if (result.error) {
      throw new Error(
        result.error.message ||
          'Unable to load community information.',
      )
    }
  }

  return {
    voteCount: votesResult.count ?? 0,
    commentCount: commentsResult.count ?? 0,
    followerCount: followersResult.count ?? 0,
    isVoted: Boolean(userVoteResult.data),
    isFollowing: Boolean(userFollowerResult.data),
    isBookmarked: Boolean(userBookmarkResult.data),
  }
}

/* =========================================================
   VOTE
   ========================================================= */

export async function hasUserVoted(
  ideaId: string,
): Promise<boolean> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('idea_votes')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(
      error.message || 'Unable to check vote status.',
    )
  }

  return Boolean(data)
}

export async function toggleIdeaVote(
  ideaId: string,
): Promise<boolean> {
  const userId = await getCurrentUserId()

  const { data: existingVote, error: existingError } =
    await supabase
      .from('idea_votes')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .maybeSingle()

  if (existingError) {
    throw new Error(
      existingError.message ||
        'Unable to check the current vote.',
    )
  }

  if (existingVote) {
    const { error } = await supabase
      .from('idea_votes')
      .delete()
      .eq('id', existingVote.id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(
        error.message || 'Unable to remove your vote.',
      )
    }

    return false
  }

  const { error } = await supabase
    .from('idea_votes')
    .insert({
      idea_id: ideaId,
      user_id: userId,
    })

  if (error) {
    throw new Error(
      error.message || 'Unable to vote for this idea.',
    )
  }

  return true
}

/* =========================================================
   COMMENTS
   ========================================================= */

export async function getIdeaComments(
  ideaId: string,
): Promise<IdeaComment[]> {
  const { data, error } = await supabase
    .from('idea_comments')
    .select(`
      id,
      idea_id,
      user_id,
      parent_comment_id,
      content,
      created_at,
      updated_at,
      author:profiles!idea_comments_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('idea_id', ideaId)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw new Error(
      error.message || 'Unable to load comments.',
    )
  }

  return (data ?? []).map((comment) => ({
    ...comment,
    author: Array.isArray(comment.author)
      ? comment.author[0] ?? null
      : comment.author ?? null,
  })) as IdeaComment[]
}

export async function createComment(
  ideaId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<IdeaComment> {
  const userId = await getCurrentUserId()

  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new Error('Comment cannot be empty.')
  }

  const { data, error } = await supabase
    .from('idea_comments')
    .insert({
      idea_id: ideaId,
      user_id: userId,
      parent_comment_id: parentCommentId,
      content: trimmedContent,
    })
    .select(`
      id,
      idea_id,
      user_id,
      parent_comment_id,
      content,
      created_at,
      updated_at,
      author:profiles!idea_comments_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    throw new Error(
      error.message || 'Unable to create comment.',
    )
  }

  return {
    ...data,
    author: Array.isArray(data.author)
      ? data.author[0] ?? null
      : data.author ?? null,
  } as IdeaComment
}

export async function updateComment(
  commentId: string,
  content: string,
): Promise<IdeaComment> {
  const userId = await getCurrentUserId()

  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new Error('Comment cannot be empty.')
  }

  const { data, error } = await supabase
    .from('idea_comments')
    .update({
      content: trimmedContent,
    })
    .eq('id', commentId)
    .eq('user_id', userId)
    .select(`
      id,
      idea_id,
      user_id,
      parent_comment_id,
      content,
      created_at,
      updated_at,
      author:profiles!idea_comments_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    throw new Error(
      error.message || 'Unable to update comment.',
    )
  }

  return {
    ...data,
    author: Array.isArray(data.author)
      ? data.author[0] ?? null
      : data.author ?? null,
  } as IdeaComment
}

export async function deleteComment(
  commentId: string,
): Promise<void> {
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('idea_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(
      error.message || 'Unable to delete your comment.',
    )
  }
}

/* =========================================================
   FOLLOW
   ========================================================= */

export async function isFollowingIdea(
  ideaId: string,
): Promise<boolean> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('idea_followers')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(
      error.message || 'Unable to check follow status.',
    )
  }

  return Boolean(data)
}

export async function toggleIdeaFollow(
  ideaId: string,
): Promise<boolean> {
  const userId = await getCurrentUserId()

  const {
    data: existingFollower,
    error: existingError,
  } = await supabase
    .from('idea_followers')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) {
    throw new Error(
      existingError.message ||
        'Unable to check follow status.',
    )
  }

  if (existingFollower) {
    const { error } = await supabase
      .from('idea_followers')
      .delete()
      .eq('id', existingFollower.id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(
        error.message || 'Unable to unfollow this idea.',
      )
    }

    return false
  }

  const { error } = await supabase
    .from('idea_followers')
    .insert({
      idea_id: ideaId,
      user_id: userId,
    })

  if (error) {
    throw new Error(
      error.message || 'Unable to follow this idea.',
    )
  }

  return true
}

/* =========================================================
   BOOKMARK
   ========================================================= */

export async function isIdeaBookmarked(
  ideaId: string,
): Promise<boolean> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('idea_bookmarks')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(
      error.message || 'Unable to check bookmark status.',
    )
  }

  return Boolean(data)
}

export async function toggleIdeaBookmark(
  ideaId: string,
): Promise<boolean> {
  const userId = await getCurrentUserId()

  const {
    data: existingBookmark,
    error: existingError,
  } = await supabase
    .from('idea_bookmarks')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) {
    throw new Error(
      existingError.message ||
        'Unable to check bookmark status.',
    )
  }

  if (existingBookmark) {
    const { error } = await supabase
      .from('idea_bookmarks')
      .delete()
      .eq('id', existingBookmark.id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(
        error.message ||
          'Unable to remove this bookmark.',
      )
    }

    return false
  }

  const { error } = await supabase
    .from('idea_bookmarks')
    .insert({
      idea_id: ideaId,
      user_id: userId,
    })

  if (error) {
    throw new Error(
      error.message || 'Unable to bookmark this idea.',
    )
  }

  return true
}

/* =========================================================
   ACTIVITY
   ========================================================= */

export async function getIdeaActivity(
  ideaId: string,
): Promise<IdeaActivity[]> {
  const { data, error } = await supabase
    .from('idea_activity')
    .select(`
      id,
      idea_id,
      user_id,
      activity_type,
      description,
      created_at,
      actor:profiles!idea_activity_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('idea_id', ideaId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw new Error(
      error.message || 'Unable to load idea activity.',
    )
  }

  return (data ?? []).map((item) => ({
    ...item,
    actor: Array.isArray(item.actor)
      ? item.actor[0] ?? null
      : item.actor ?? null,
  })) as IdeaActivity[]
}