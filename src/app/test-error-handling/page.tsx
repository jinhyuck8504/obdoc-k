'use client';

import { useState } from 'react';

export default function TestErrorHandlingPage() {
  const [errorType, setErrorType] = useState('');

  const triggerError = (type: string) => {
    setErrorType(type);
    
    switch (type) {
      case 'javascript':
        throw new Error('테스트용 JavaScript 오류입니다.');
      case 'network':
        fetch('/non-existent-endpoint')
          .catch(err => console.error('네트워크 오류:', err));
        break;
      case 'validation':
        alert('유효성 검사 오류가 발생했습니다.');
        break;
      default:
        console.log('알 수 없는 오류 타입');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-header text-center">
              <h1 className="text-2xl font-bold text-gray-900">오류 처리 테스트</h1>
              <p className="text-gray-600 mt-2">다양한 오류 상황을 테스트해보세요</p>
            </div>
            
            <div className="card-body">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">🚨 오류 테스트</h3>
                  <div className="grid gap-4">
                    <button
                      onClick={() => triggerError('javascript')}
                      className="btn btn-danger w-full"
                    >
                      JavaScript 오류 발생
                    </button>
                    
                    <button
                      onClick={() => triggerError('network')}
                      className="btn btn-danger w-full"
                    >
                      네트워크 오류 발생
                    </button>
                    
                    <button
                      onClick={() => triggerError('validation')}
                      className="btn btn-danger w-full"
                    >
                      유효성 검사 오류 발생
                    </button>
                  </div>
                </div>

                {errorType && (
                  <div className="alert alert-error">
                    <strong>오류 발생:</strong> {errorType} 타입의 오류가 트리거되었습니다.
                  </div>
                )}

                <div className="mt-8 text-center">
                  <a href="/" className="btn btn-primary">
                    홈으로 돌아가기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
