'use client'
import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, Edit, Trash2, MoreHorizontal, Clock, Flag } from 'lucide-react'
import { CommunityComment, CommentFormData } from '@/types/community'
import { getComments, createComment, deleteComment, toggleCommentLike } from '@/lib/communityService'
import { useAuth } from '@/contexts/AuthContext'
import ReportModal from './moderation/ReportModal'

interface CommentSectionProps {
  postId: string
  commentCount: number
  onCommentCountChange: (count: number) => void
}

export default function CommentSection({ postId, commentCount, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMenuCommentId, setShowMenuCommentId] = useState<string | null>(null)
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean
    targetId: string
    targetContent: string
  }>({
    isOpen: false,
    targetId: '',
    targetContent: ''
  })

  useEffect(() => {
    loadComments()
  }, [postId])

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenuCommentId(null)
    }
    
    if (showMenuCommentId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenuCommentId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const commentsData = await getComments(postId)
      setComments(commentsData)
    } catch (error) {
      console.error('댓글 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('댓글 작성 시작:', { newComment, user, postId })
    
    if (!newComment.trim()) {
      console.log('댓글 내용이 비어있음')
      return
    }
    
    // 개발 환경에서 임시 사용자 정보 사용
    const userId = user?.id || 'user1'
    console.log('사용할 사용자 ID:', userId)

    setIsSubmitting(true)
    try {
      console.log('createComment 호출 시작')
      const comment = await createComment(postId, userId, { content: newComment.trim() })
      console.log('댓글 생성 완료:', comment)
      
      const newComments = [...comments, comment]
      setComments(newComments)
      onCommentCountChange(newComments.length)
      setNewComment('')
      console.log('댓글 UI 업데이트 완료')
    } catch (error) {
      console.error('댓글 작성 실패:', error)
      alert('댓글 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return
    }

    try {
      console.log('댓글 삭제 시작:', commentId)
      await deleteComment(commentId)
      const newComments = comments.filter(comment => comment.id !== commentId)
      setComments(newComments)
      onCommentCountChange(newComments.length)
      setShowMenuCommentId(null)
      console.log('댓글 삭제 완료')
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  const handleCommentLike = async (commentId: string) => {
    console.log('댓글 좋아요 클릭:', { commentId, user: user?.id })
    
    // 개발 환경에서 임시 사용자 정보 사용
    const userId = user?.id || 'user1'
    console.log('사용할 사용자 ID:', userId)

    try {
      console.log('toggleCommentLike 호출 시작')
      const result = await toggleCommentLike(commentId, userId)
      console.log('댓글 좋아요 결과:', result)
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, isLiked: result.liked, likes: result.likes }
          : comment
      ))
      console.log('댓글 좋아요 UI 업데이트 완료')
    } catch (error) {
      console.error('댓글 좋아요 처리 실패:', error)
    }
  }

  const handleReportComment = (comment: CommunityComment) => {
    setReportModal({
      isOpen: true,
      targetId: comment.id,
      targetContent: comment.content
    })
    setShowMenuCommentId(null)
  }

  const isMyComment = (comment: CommunityComment) => {
    const userId = user?.id || 'user1'
    return comment.authorId === userId
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}시간 전`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}일 전`
    
    return date.toLocaleDateString('ko-KR')
  }

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          댓글 {comments.length}개
        </h3>
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해보세요..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">
                {newComment.length}/500
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? '작성 중...' : '댓글 작성'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">아직 댓글이 없습니다.</p>
            <p className="text-gray-400 text-sm">첫 번째 댓글을 작성해보세요!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {comment.authorNickname.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {comment.authorNickname}
                    </span>
                    {isMyComment(comment) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        내 댓글
                      </span>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(comment.createdAt)}
                    </div>
                  </div>
                  
                  {/* 메뉴 버튼 */}
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenuCommentId(showMenuCommentId === comment.id ? null : comment.id)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {showMenuCommentId === comment.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                        {isMyComment(comment) ? (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReportComment(comment)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            신고
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-1">
                  <p className="text-gray-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
                
                {/* 댓글 좋아요 */}
                <div className="flex items-center space-x-4 mt-2">
                  <button 
                    onClick={() => handleCommentLike(comment.id)}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      comment.isLiked 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, targetId: '', targetContent: '' })}
        targetType="comment"
        targetId={reportModal.targetId}
        targetContent={reportModal.targetContent}
        reporterId={user?.id || 'user1'}
        reporterName={user?.name || '사용자'}
      />
    </div>
  )
}