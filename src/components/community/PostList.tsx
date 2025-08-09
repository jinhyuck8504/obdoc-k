'use client'
import React, { useState, useEffect } from 'react'
import { CommunityPost, PostFilters, PostCategory, POST_CATEGORIES, PostFormData } from '@/types/community'
import { getPosts, togglePostLike, getPopularTags, deletePost, updatePost } from '@/lib/communityService'
import { useAuth } from '@/contexts/AuthContext'
import ReportModal from './moderation/ReportModal'

interface PostListProps {
  onPostClick: (post: CommunityPost) => void
  onCreatePost: () => void
  onEditPost: (post: CommunityPost) => void
  refreshTrigger?: number
}

export default function PostList({ onPostClick, onCreatePost, onEditPost, refreshTrigger }: PostListProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PostFilters>({
    sortBy: 'latest'
  })
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showMenuPostId, setShowMenuPostId] = useState<string | null>(null)
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
    loadPosts()
    loadPopularTags()
  }, [filters, refreshTrigger])

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenuPostId(null)
    }
    
    if (showMenuPostId && typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenuPostId])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const postsData = await getPosts(filters)
      setPosts(postsData)
    } catch (error) {
      console.error('게시글 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPopularTags = async () => {
    try {
      const tags = await getPopularTags()
      setPopularTags(tags)
    } catch (error) {
      console.error('인기 태그 로드 실패:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  const handleCategoryFilter = (category: PostCategory | undefined) => {
    setFilters(prev => ({ ...prev, category }))
  }

  const handleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }))
  }

  const handleSortChange = (sortBy: PostFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    try {
      const result = await togglePostLike(postId, user.id || 'user1')
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isLiked: result.liked, likes: result.likes }
          : post
      ))
    } catch (error) {
      console.error('좋아요 처리 실패:', error)
    }
  }

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    try {
      await deletePost(postId)
      setPosts(prev => prev.filter(post => post.id !== postId))
      setShowMenuPostId(null)
    } catch (error) {
      console.error('게시글 삭제 실패:', error)
      alert('게시글 삭제에 실패했습니다.')
    }
  }

  const handleEditClick = (post: CommunityPost, e: React.MouseEvent) => {
    e.stopPropagation()
    onEditPost(post)
    setShowMenuPostId(null)
  }

  const handleReportClick = (post: CommunityPost, e: React.MouseEvent) => {
    e.stopPropagation()
    setReportModal({
      isOpen: true,
      targetId: post.id,
      targetContent: post.title + '\n\n' + post.content.substring(0, 200)
    })
    setShowMenuPostId(null)
  }

  const isMyPost = (post: CommunityPost) => {
    return post.authorId === (user?.id || 'user1')
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}일 전`
    
    return date.toLocaleDateString('ko-KR')
  }

  const getCategoryInfo = (category: PostCategory) => {
    return POST_CATEGORIES.find(cat => cat.value === category) || POST_CATEGORIES[POST_CATEGORIES.length - 1]
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
          <p className="text-gray-600 mt-1">다이어트 경험과 팁을 공유해보세요</p>
        </div>
        <button
          onClick={onCreatePost}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <span className="mr-2">➕</span>
          글쓰기
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목, 내용, 태그로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            검색
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <span className="mr-2">🔽</span>
            필터
          </button>
        </form>

        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* 정렬 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'latest', label: '최신순' },
                  { value: 'popular', label: '인기순' },
                  { value: 'most-liked', label: '좋아요순' }
                ].map(sort => (
                  <button
                    key={sort.value}
                    onClick={() => handleSortChange(sort.value as PostFilters['sortBy'])}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.sortBy === sort.value
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter(undefined)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    !filters.category
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                {POST_CATEGORIES.map(category => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryFilter(category.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.category === category.value
                        ? category.color
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 인기 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">인기 태그</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center ${
                      filters.tags?.includes(tag)
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">🏷️</span>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <span className="text-4xl mb-4 block">💬</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 게시글을 작성해보세요!</p>
            <button
              onClick={onCreatePost}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <span className="mr-2">➕</span>
              글쓰기
            </button>
          </div>
        ) : (
          posts.map(post => {
            const categoryInfo = getCategoryInfo(post.category)
            return (
              <div
                key={post.id}
                onClick={() => onPostClick(post)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* 작성자 정보 */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {post.authorNickname.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{post.authorNickname}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      {isMyPost(post) && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          내 글
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-1">🕐</span>
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                  
                  {/* 메뉴 버튼 */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenuPostId(showMenuPostId === post.id ? null : post.id)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      ⋯
                    </button>
                    
                    {showMenuPostId === post.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                        {isMyPost(post) ? (
                          <>
                            <button
                              onClick={(e) => handleEditClick(post, e)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">✏️</span>
                              수정
                            </button>
                            <button
                              onClick={(e) => handleDeletePost(post.id, e)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <span className="mr-2">🗑️</span>
                              삭제
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => handleReportClick(post, e)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <span className="mr-2">🚩</span>
                            신고
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>

                {/* 내용 미리보기 */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.content.replace(/[#*`]/g, '').substring(0, 200)}
                  {post.content.length > 200 && '...'}
                </p>

                {/* 태그 */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        <span className="mr-1">🏷️</span>
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{post.tags.length - 3}개</span>
                    )}
                  </div>
                )}

                {/* 상호작용 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        post.isLiked 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <span className={post.isLiked ? '❤️' : '🤍'}></span>
                      <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <span>💬</span>
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    더 보기 →
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, targetId: '', targetContent: '' })}
        targetType="post"
        targetId={reportModal.targetId}
        targetContent={reportModal.targetContent}
        reporterId={user?.id || 'user1'}
        reporterName={user?.name || '사용자'}
      />
    </div>
  )
}
