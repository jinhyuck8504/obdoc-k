const fetchAppointments = async () => {
  try {
    setLoading(true)
    
    // 타임아웃 설정 (10초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('요청 시간 초과')), 10000)
    })
    
    const dataPromise = appointmentService.getAppointments('doctor1')
    const data = await Promise.race([dataPromise, timeoutPromise]) as any
    
    setAppointments(data)
  } catch (error) {
    console.error('예약 목록 조회 실패:', error)
    
    // 에러 발생 시 더미 데이터 사용
    const dummyData = [/* 더미 데이터 배열 */]
    setAppointments(dummyData)
  } finally {
    setLoading(false)
  }
}
