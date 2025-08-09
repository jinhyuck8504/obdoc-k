'use client'

import React from 'react'
import { WeightRecord } from '@/types/health'
// Removed lucide-react dependency - using emoji icons instead

interface WeightChartProps {
  records: WeightRecord[]
  targetWeight: number
  initialWeight: number
  height?: number
  className?: string
}

export default function WeightChart({ 
  records, 
  targetWeight, 
  initialWeight,
  height = 300,
  className = '' 
}: WeightChartProps) {
  if (records.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📉</span>
          </div>
          <p className="text-gray-500">체중 기록이 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">첫 번째 기록을 추가해보세요</p>
        </div>
      </div>
    )
  }

  // 차트 데이터 준비
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const minWeight = Math.min(targetWeight, ...sortedRecords.map(r => r.weight)) - 2
  const maxWeight = Math.max(initialWeight, ...sortedRecords.map(r => r.weight)) + 2
  const weightRange = maxWeight - minWeight

  // SVG 차트 설정
  const chartWidth = 100 // 퍼센트
  const chartHeight = height - 80 // 여백 제외
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }

  // 포인트 계산 함수
  const getX = (index: number) => {
    return (index / (sortedRecords.length - 1)) * (chartWidth - padding.left - padding.right) + padding.left
  }

  const getY = (weight: number) => {
    return ((maxWeight - weight) / weightRange) * (chartHeight - padding.top - padding.bottom) + padding.top
  }

  // 목표선 Y 좌표
  const targetY = getY(targetWeight)

  // 패스 생성
  const pathData = sortedRecords
    .map((record, index) => {
      const x = getX(index)
      const y = getY(record.weight)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  // 그라데이션 영역 패스
  const areaData = `${pathData} L ${getX(sortedRecords.length - 1)} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`

  // 최신 트렌드 계산
  const latestTrend = sortedRecords.length >= 2 ? 
    sortedRecords[sortedRecords.length - 1].weight - sortedRecords[sortedRecords.length - 2].weight : 0

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* 차트 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">체중 변화 추이</h3>
          <p className="text-sm text-gray-600">
            {sortedRecords.length}개 기록 • {new Date(sortedRecords[0].date).toLocaleDateString('ko-KR')} ~ {new Date(sortedRecords[sortedRecords.length - 1].date).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {latestTrend < -0.1 ? (
              <span className="text-green-600">📉</span>
            ) : latestTrend > 0.1 ? (
              <span className="text-red-600">📈</span>
            ) : (
              <span className="text-gray-600">➖</span>
            )}
            <span className={`text-sm font-medium ${
              latestTrend < -0.1 ? 'text-green-600' : 
              latestTrend > 0.1 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {latestTrend < -0.1 ? '감소' : latestTrend > 0.1 ? '증가' : '유지'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">최근 변화</p>
        </div>
      </div>

      {/* SVG 차트 */}
      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="overflow-visible"
        >
          {/* 그라데이션 정의 */}
          <defs>
            <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* 그리드 라인 */}
          {[...Array(5)].map((_, i) => {
            const weight = minWeight + (weightRange * i / 4)
            const y = getY(weight)
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {weight.toFixed(1)}kg
                </text>
              </g>
            )
          })}

          {/* 목표선 */}
          <line
            x1={padding.left}
            y1={targetY}
            x2={chartWidth - padding.right}
            y2={targetY}
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x={chartWidth - padding.right + 5}
            y={targetY + 4}
            className="text-xs fill-green-600 font-medium"
          >
            목표: {targetWeight}kg
          </text>

          {/* 영역 채우기 */}
          <path
            d={areaData}
            fill="url(#weightGradient)"
          />

          {/* 체중 변화 라인 */}
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 */}
          {sortedRecords.map((record, index) => {
            const x = getX(index)
            const y = getY(record.weight)
            const isLatest = index === sortedRecords.length - 1
            
            return (
              <g key={record.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isLatest ? 6 : 4}
                  fill={isLatest ? "#1D4ED8" : "#3B82F6"}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                />
                
                {/* 호버 시 툴팁 (간단한 버전) */}
                <title>
                  {new Date(record.date).toLocaleDateString('ko-KR')}: {record.weight}kg
                  {record.note && ` - ${record.note}`}
                </title>
              </g>
            )
          })}

          {/* X축 라벨 */}
          {sortedRecords.map((record, index) => {
            if (index % Math.ceil(sortedRecords.length / 4) === 0 || index === sortedRecords.length - 1) {
              const x = getX(index)
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {new Date(record.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </text>
              )
            }
            return null
          })}
        </svg>

        {/* 범례 */}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span className="text-gray-600">체중 변화</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-green-500 border-dashed border-t"></div>
              <span className="text-gray-600">목표</span>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 하단 정보 */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">총 감량</p>
          <p className="text-lg font-bold text-blue-700">
            {(initialWeight - sortedRecords[sortedRecords.length - 1].weight).toFixed(1)}kg
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">목표까지</p>
          <p className="text-lg font-bold text-green-700">
            {Math.max(0, sortedRecords[sortedRecords.length - 1].weight - targetWeight).toFixed(1)}kg
          </p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">평균 주간 감량</p>
          <p className="text-lg font-bold text-purple-700">
            {sortedRecords.length > 1 ? 
              (((initialWeight - sortedRecords[sortedRecords.length - 1].weight) / 
                Math.ceil((new Date(sortedRecords[sortedRecords.length - 1].date).getTime() - 
                          new Date(sortedRecords[0].date).getTime()) / (7 * 24 * 60 * 60 * 1000)))).toFixed(2)
              : '0.0'
            }kg
          </p>
        </div>
      </div>
    </div>
  )
}
