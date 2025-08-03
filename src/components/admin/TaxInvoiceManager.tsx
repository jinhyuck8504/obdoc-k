'use client'
import React from 'react'

export default function TaxInvoiceManager() {
  const handleViewDetail = (invoiceId: string) => {
    alert(`${invoiceId} 상세보기를 클릭했습니다.`)
  }

  const handleViewTaxInvoice = (invoiceId: string) => {
    alert(`${invoiceId} 세금계산서 열람을 클릭했습니다.`)
  }

  const handlePaymentConfirm = (invoiceId: string) => {
    alert(`${invoiceId} 결제확인을 클릭했습니다.`)
  }

  const handleOverdueAlert = (invoiceId: string) => {
    alert(`${invoiceId} 연체 알림을 클릭했습니다.`)
  }

  const handleIssueInvoice = (invoiceId: string) => {
    alert(`${invoiceId} 발행하기를 클릭했습니다.`)
  }

  const handleBillingInfo = (invoiceId: string) => {
    alert(`${invoiceId} 청구정보를 클릭했습니다.`)
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">세금계산서 관리</h2>
          <p className="text-gray-600 mt-1">구독 결제 및 세금계산서 발행 관리</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">총 계산서</p>
              <p className="text-3xl font-bold">4</p>
            </div>
            <div className="h-8 w-8 text-blue-200">📄</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">결제완료</p>
              <p className="text-3xl font-bold">1</p>
            </div>
            <div className="h-8 w-8 text-green-200">✅</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">총 매출</p>
              <p className="text-2xl font-bold">₩1,100,000</p>
            </div>
            <div className="h-8 w-8 text-purple-200">📈</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">연체</p>
              <p className="text-3xl font-bold">1</p>
            </div>
            <div className="h-8 w-8 text-red-200">⏰</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            세금계산서 목록 (4건)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  계산서 번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  의사/병원
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  발행일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  INV-2024-001
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  김의사 / 서울대학교병원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₩1,100,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    결제완료
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-01-01
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded text-xs font-medium"
                      title="상세보기"
                      onClick={() => handleViewDetail('INV-2024-001')}
                    >
                      상세보기
                    </button>
                    <button
                      className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded text-xs font-medium"
                      title="세금계산서 열람"
                      onClick={() => handleViewTaxInvoice('INV-2024-001')}
                    >
                      계산서 열람
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  INV-2024-002
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  이의사 / 강남세브란스병원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₩550,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    발행완료
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-01-15
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded text-xs font-medium"
                      title="상세보기"
                      onClick={() => handleViewDetail('INV-2024-002')}
                    >
                      상세보기
                    </button>
                    <button
                      className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 rounded text-xs font-medium"
                      title="결제확인"
                      onClick={() => handlePaymentConfirm('INV-2024-002')}
                    >
                      결제확인
                    </button>
                    <button
                      className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded text-xs font-medium"
                      title="세금계산서 열람"
                      onClick={() => handleViewTaxInvoice('INV-2024-002')}
                    >
                      계산서 열람
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  INV-2024-003
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  박의사 / 삼성서울병원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₩330,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    연체
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-02-01
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded text-xs font-medium"
                      title="상세보기"
                      onClick={() => handleViewDetail('INV-2024-003')}
                    >
                      상세보기
                    </button>
                    <button
                      className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-xs font-medium"
                      title="연체 알림"
                      onClick={() => handleOverdueAlert('INV-2024-003')}
                    >
                      연체 알림
                    </button>
                    <button
                      className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded text-xs font-medium"
                      title="세금계산서 열람"
                      onClick={() => handleViewTaxInvoice('INV-2024-003')}
                    >
                      계산서 열람
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  INV-2024-004
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  최의사 / 아산병원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₩1,100,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    임시저장
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-02-15
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded text-xs font-medium"
                      title="상세보기"
                      onClick={() => handleViewDetail('INV-2024-004')}
                    >
                      상세보기
                    </button>
                    <button
                      className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-3 py-1 rounded text-xs font-medium"
                      title="발행하기"
                      onClick={() => handleIssueInvoice('INV-2024-004')}
                    >
                      발행하기
                    </button>
                    <button
                      className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1 rounded text-xs font-medium"
                      title="청구정보"
                      onClick={() => handleBillingInfo('INV-2024-004')}
                    >
                      청구정보
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}