import { useState } from 'react'
import './App.css'

// 科目の型定義
interface Subject {
  id: string
  name: string
  totalHours: number
  completedHours: number
  color: string
}

// 勉強セッションの型定義
interface StudySession {
  id: string
  subjectId: string
  date: string
  hours: number
  notes: string
  emoji: string
}

// 模擬試験の型定義
interface MockExam {
  id: string
  subjectId: string
  date: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  notes: string
}

// 予定の型定義
interface Schedule {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  description: string
  subjectId: string
}

// カレンダー表示用の型定義
interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  studyHours: number
  subjects: string[]
  notes: string[]
  schedules: Schedule[]
  exams: MockExam[]
}

function App() {
  // 科目データの初期化
  const [subjects] = useState<Subject[]>([
    { id: '1', name: '建築計画', totalHours: 150, completedHours: 0, color: '#000000' },
    { id: '2', name: '建築法規', totalHours: 200, completedHours: 0, color: '#000000' },
    { id: '3', name: '建築構造', totalHours: 180, completedHours: 0, color: '#000000' },
    { id: '4', name: '建築施工', totalHours: 120, completedHours: 0, color: '#000000' },
    { id: '5', name: '設計製図', totalHours: 300, completedHours: 0, color: '#000000' },
    { id: '6', name: 'その他', totalHours: 0, completedHours: 0, color: '#666666' }
  ])

  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [mockExams, setMockExams] = useState<MockExam[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [studyHours, setStudyHours] = useState<number>(0)
  const [studyNotes, setStudyNotes] = useState<string>('')
  const [studyDate, setStudyDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [studyEmoji, setStudyEmoji] = useState<string>('😊')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'progress' | 'study' | 'calendar' | 'exams' | 'schedule'>('progress')
  
  // 絵文字の選択肢とその意味
  const emojiOptions = [
    { emoji: '😊', meaning: '楽しく勉強できた' },
    { emoji: '😅', meaning: '大変だった' },
    { emoji: '😤', meaning: '集中できた' },
    { emoji: '😴', meaning: '眠かった' }
  ]
  
  // カレンダー詳細表示用の状態
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [showDateDetail, setShowDateDetail] = useState<boolean>(false)
  
  // 模擬試験用の状態
  const [examSubject, setExamSubject] = useState<string>('')
  const [examScore, setExamScore] = useState<number>(0)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [timeSpent, setTimeSpent] = useState<number>(0)
  const [examNotes, setExamNotes] = useState<string>('')
  
  // 予定用の状態
  const [scheduleTitle, setScheduleTitle] = useState<string>('')
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [scheduleStartTime, setScheduleStartTime] = useState<string>('09:00')
  const [scheduleEndTime, setScheduleEndTime] = useState<string>('10:00')
  const [scheduleDescription, setScheduleDescription] = useState<string>('')
  const [scheduleSubject, setScheduleSubject] = useState<string>('1')

  // 編集用の状態（勉強記録）
  const [editingStudyId, setEditingStudyId] = useState<string>('')
  const [editStudyDate, setEditStudyDate] = useState<string>('')
  const [editStudySubject, setEditStudySubject] = useState<string>('')
  const [editStudyHours, setEditStudyHours] = useState<number>(0)
  const [editStudyNotes, setEditStudyNotes] = useState<string>('')
  const [editStudyEmoji, setEditStudyEmoji] = useState<string>('😊')

  // 編集用の状態（予定）
  const [editingScheduleId, setEditingScheduleId] = useState<string>('')
  const [editScheduleTitle, setEditScheduleTitle] = useState<string>('')
  const [editScheduleDate, setEditScheduleDate] = useState<string>('')
  const [editScheduleSubject, setEditScheduleSubject] = useState<string>('1')
  const [editScheduleDescription, setEditScheduleDescription] = useState<string>('')

  // 編集用の状態（模擬試験）
  const [editingExamId, setEditingExamId] = useState<string>('')
  const [editExamSubject, setEditExamSubject] = useState<string>('')
  const [editExamTotalQuestions, setEditExamTotalQuestions] = useState<number>(0)
  const [editExamCorrectAnswers, setEditExamCorrectAnswers] = useState<number>(0)
  const [editExamTimeSpent, setEditExamTimeSpent] = useState<number>(0)
  const [editExamNotes, setEditExamNotes] = useState<string>('')

  // 編集開始・保存・キャンセル（勉強記録）
  const startEditStudy = (session: StudySession) => {
    setEditingStudyId(session.id)
    setEditStudyDate(session.date)
    setEditStudySubject(session.subjectId)
    setEditStudyHours(session.hours)
    setEditStudyNotes(session.notes)
    setEditStudyEmoji(session.emoji)
  }

  const saveEditStudy = () => {
    if (!editingStudyId) return
    setStudySessions(prev => prev.map(s => s.id === editingStudyId ? {
      ...s,
      date: editStudyDate,
      subjectId: editStudySubject,
      hours: editStudyHours,
      notes: editStudyNotes,
      emoji: editStudyEmoji
    } : s))
    cancelEditStudy()
  }

  const cancelEditStudy = () => {
    setEditingStudyId('')
  }

  // 編集開始・保存・キャンセル（予定）
  const startEditSchedule = (schedule: Schedule) => {
    setEditingScheduleId(schedule.id)
    setEditScheduleTitle(schedule.title)
    setEditScheduleDate(schedule.date)
    setEditScheduleSubject(schedule.subjectId)
    setEditScheduleDescription(schedule.description)
  }

  const saveEditSchedule = () => {
    if (!editingScheduleId) return
    setSchedules(prev => prev.map(s => s.id === editingScheduleId ? {
      ...s,
      title: editScheduleTitle,
      date: editScheduleDate,
      subjectId: editScheduleSubject,
      description: editScheduleDescription
    } : s))
    cancelEditSchedule()
  }

  const cancelEditSchedule = () => {
    setEditingScheduleId('')
  }

  // 編集開始・保存・キャンセル（模擬試験）
  const startEditExam = (exam: MockExam) => {
    setEditingExamId(exam.id)
    setEditExamSubject(exam.subjectId)
    setEditExamTotalQuestions(exam.totalQuestions)
    setEditExamCorrectAnswers(exam.correctAnswers)
    setEditExamTimeSpent(exam.timeSpent)
    setEditExamNotes(exam.notes)
  }

  const saveEditExam = () => {
    if (!editingExamId) return
    const score = editExamTotalQuestions > 0 ? Math.round((editExamCorrectAnswers / editExamTotalQuestions) * 100) : 0
    setMockExams(prev => prev.map(e => e.id === editingExamId ? {
      ...e,
      subjectId: editExamSubject,
      totalQuestions: editExamTotalQuestions,
      correctAnswers: editExamCorrectAnswers,
      score: score,
      timeSpent: editExamTimeSpent,
      notes: editExamNotes
    } : e))
    cancelEditExam()
  }

  const cancelEditExam = () => {
    setEditingExamId('')
  }

  // 勉強セッションを追加
  const addStudySession = () => {
    if (selectedSubject && studyHours > 0) {
      const newSession: StudySession = {
        id: Date.now().toString(),
        subjectId: selectedSubject,
        date: studyDate,
        hours: studyHours,
        notes: studyNotes,
        emoji: studyEmoji
      }
      setStudySessions([...studySessions, newSession])
      setStudyHours(0)
      setStudyNotes('')
      setStudyDate(() => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })
      setStudyEmoji('😊')
    }
  }

  // 進捗率を計算
  const getProgressPercentage = (subject: Subject) => {
    const completedHours = studySessions
      .filter(session => session.subjectId === subject.id)
      .reduce((total, session) => total + session.hours, 0)
    return Math.min((completedHours / subject.totalHours) * 100, 100)
  }

  // 総勉強時間を計算
  const getTotalStudyHours = () => {
    return studySessions.reduce((total, session) => total + session.hours, 0)
  }

  // 模擬試験を追加
  const addMockExam = () => {
    if (examSubject && totalQuestions > 0 && correctAnswers >= 0) {
      const score = Math.round((correctAnswers / totalQuestions) * 100)
      const newExam: MockExam = {
        id: Date.now().toString(),
        subjectId: examSubject,
        date: (() => {
          const today = new Date()
          const year = today.getFullYear()
          const month = String(today.getMonth() + 1).padStart(2, '0')
          const day = String(today.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        })(),
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        timeSpent: timeSpent,
        notes: examNotes
      }
      setMockExams([...mockExams, newExam])
      setExamSubject('')
      setTotalQuestions(0)
      setCorrectAnswers(0)
      setTimeSpent(0)
      setExamNotes('')
    }
  }

  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: CalendarDay[] = []
    const today = new Date()
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dateStr = (() => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })()
      const dayStudySessions = studySessions.filter(session => session.date === dateStr)
      const studyHours = dayStudySessions.reduce((total, session) => total + session.hours, 0)
      const subjectNames = [...new Set(dayStudySessions.map(session => {
        const subject = subjects.find(s => s.id === session.subjectId)
        return subject?.name || ''
      }))].filter(Boolean)
      const notes = dayStudySessions.map(session => session.notes).filter(Boolean)
      const daySchedules = schedules.filter(schedule => schedule.date === dateStr)
      const dayExams = mockExams.filter(exam => exam.date === dateStr)
      
      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        studyHours: studyHours,
        subjects: subjectNames,
        notes: notes,
        schedules: daySchedules,
        exams: dayExams
      })
    }
    
    return days
  }

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // 特定の日付の勉強記録を取得
  const getStudySessionsForDate = (date: string) => {
    return studySessions.filter(session => session.date === date)
  }

  // 日付をクリックしたときの処理
  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setShowDateDetail(true)
  }

  // 選択された日付のデータを取得
  const getSelectedDateData = () => {
    if (!selectedDate) return null
    
    const dayStudySessions = studySessions.filter(session => session.date === selectedDate)
    const daySchedules = schedules.filter(schedule => schedule.date === selectedDate)
    const dayExams = mockExams.filter(exam => exam.date === selectedDate)
    
    return {
      studySessions: dayStudySessions,
      schedules: daySchedules,
      exams: dayExams
    }
  }

  // 予定を追加
  const addSchedule = () => {
    if (scheduleTitle && scheduleDate) {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        title: scheduleTitle,
        date: scheduleDate,
        startTime: '',
        endTime: '',
        description: scheduleDescription,
        subjectId: scheduleSubject
      }
      setSchedules([...schedules, newSchedule])
      setScheduleTitle('')
      setScheduleDate(() => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })
      setScheduleDescription('')
      setScheduleSubject('1')
    }
  }

  // 週の日付を生成
  const generateWeekDays = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = 日曜日, 1 = 月曜日, ...
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay)
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      
      const dateStr = (() => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })()
      
      const daySchedules = schedules.filter(schedule => schedule.date === dateStr)
      const dayStudySessions = studySessions.filter(session => session.date === dateStr)
      const dayExams = mockExams.filter(exam => exam.date === dateStr)
      const studyHours = dayStudySessions.reduce((total, session) => total + session.hours, 0)
      
      weekDays.push({
        date: date.getDate(),
        dayName: ['日', '月', '火', '水', '木', '金', '土'][i],
        dateStr: dateStr,
        schedules: daySchedules,
        studyHours: studyHours,
        studySessions: dayStudySessions,
        exams: dayExams,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    return weekDays
  }

  // 絵文字から意味を取得する関数
  const getEmojiMeaning = (emoji: string) => {
    const option = emojiOptions.find(opt => opt.emoji === emoji)
    return option ? option.meaning : ''
  }

  return (
    <div className="app">
      <header className="header">
        <h1>二級建築士 勉強計画管理</h1>
        <div className="total-hours">
          総勉強時間: {getTotalStudyHours()}時間 / 950時間
        </div>
      </header>

      <main className="main">
        {/* タブナビゲーション */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            進捗管理
          </button>
          <button 
            className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            予定管理
          </button>
          <button 
            className={`tab-button ${activeTab === 'study' ? 'active' : ''}`}
            onClick={() => setActiveTab('study')}
          >
            ✏️ 勉強記録
          </button>
          <button 
            className={`tab-button ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            📝 チェック問題
          </button>
          <button 
            className={`tab-button ${activeTab === 'week' ? 'active' : ''}`}
            onClick={() => setActiveTab('week')}
          >
            週予定
          </button>
          <button 
            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            カレンダー
          </button>
        </div>

        {/* 進捗管理タブ */}
        {activeTab === 'progress' && (
          <section className="subjects-section">
            <h2>科目別進捗</h2>
            <div className="subjects-grid">
              {subjects.map(subject => {
                const progress = getProgressPercentage(subject)
                const completedHours = studySessions
                  .filter(session => session.subjectId === subject.id)
                  .reduce((total, session) => total + session.hours, 0)
                
                return (
                  <div key={subject.id} className="subject-card">
                    <div className="subject-header">
                      <h3 style={{ color: subject.color }}>{subject.name}</h3>
                      <span className="hours-text">
                        {completedHours}時間 / {subject.totalHours}時間
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progress}%`, 
                          backgroundColor: subject.color 
                        }}
                      />
                    </div>
                    {subject.id !== '6' && (
                      <div className="progress-percentage">
                        {progress.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 予定管理タブ */}
        {activeTab === 'schedule' && (
          <>
            <section className="schedule-input-section">
              <h2>予定追加</h2>
              <div className="schedule-form">
                <div className="form-group">
                  <label>予定タイトル:</label>
                  <input 
                    type="text" 
                    value={scheduleTitle} 
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder="予定のタイトルを入力"
                  />
                </div>
                
                <div className="form-group">
                  <label>日付:</label>
                  <input 
                    type="date" 
                    value={scheduleDate} 
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                
                
                <div className="form-group">
                  <label>科目:</label>
                  <select 
                    value={scheduleSubject} 
                    onChange={(e) => setScheduleSubject(e.target.value)}
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group memo-group">
                  <label>詳細:</label>
                  <input 
                    type="text" 
                    value={scheduleDescription} 
                    onChange={(e) => setScheduleDescription(e.target.value)}
                    placeholder="予定の詳細を入力"
                  />
                </div>
                
                <button onClick={addSchedule} className="add-button">
                  予定を追加
                </button>
              </div>
            </section>

            <section className="schedule-history-section">
              <h2>予定一覧</h2>
              <div className="schedule-list">
                {schedules.length === 0 ? (
                  <p className="no-history">まだ予定がありません</p>
                ) : (
                  schedules
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(schedule => (
                      <div key={schedule.id} className="schedule-item-detail">
                        <div className="schedule-header">
                          <div className="schedule-date">{schedule.date}</div>
                        </div>
                        <div className="schedule-content">
                          <div 
                            className="schedule-title-detail" 
                            style={{ color: subjects.find(s => s.id === schedule.subjectId)?.color || '#000000' }}
                          >
                            {schedule.title}
                          </div>
                          <div className="schedule-subject">
                            {subjects.find(s => s.id === schedule.subjectId)?.name || '不明な科目'}
                          </div>
                          {schedule.description && (
                            <div className="schedule-description">{schedule.description}</div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </section>
          </>
        )}

        {/* 勉強記録タブ */}
        {activeTab === 'study' && (
          <>
            {/* 勉強記録入力 */}
            <section className="study-input-section">
              <h2>勉強記録</h2>
              <div className="study-form">
                <div className="form-group">
                  <label>日付:</label>
                  <input 
                    type="date" 
                    value={studyDate} 
                    onChange={(e) => setStudyDate(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>科目:</label>
                  <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">科目を選択</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>勉強時間:</label>
                  <input 
                    type="number" 
                    value={studyHours} 
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    min="0"
                    step="0.5"
                    placeholder="時間"
                  />
                </div>
                
                <div className="form-group">
                  <label>気分:</label>
                  <div className="emoji-selector">
                    {emojiOptions.map(option => (
                      <div key={option.emoji} className="emoji-option">
                        <button
                          type="button"
                          className={`emoji-button ${studyEmoji === option.emoji ? 'selected' : ''}`}
                          onClick={() => setStudyEmoji(option.emoji)}
                          title={option.meaning}
                        >
                          {option.emoji}
                        </button>
                        <span className="emoji-meaning">{option.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group memo-group">
                  <label>メモ:</label>
                  <input 
                    type="text" 
                    value={studyNotes} 
                    onChange={(e) => setStudyNotes(e.target.value)}
                    placeholder="勉強内容や感想など"
                  />
                </div>
                
                <button onClick={addStudySession} className="add-button">
                  記録を追加
                </button>
              </div>
            </section>

            {/* 勉強履歴 */}
            <section className="history-section">
              <h2>勉強履歴</h2>
              <div className="history-list">
                {studySessions.length === 0 ? (
                  <p className="no-history">まだ勉強記録がありません</p>
                ) : (
                  studySessions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(session => {
                      const subject = subjects.find(s => s.id === session.subjectId)
                      return (
                        <div key={session.id} className="history-item">
                          <div 
                            className="history-emoji" 
                            title={getEmojiMeaning(session.emoji)}
                          >
                            {session.emoji}
                          </div>
                          <div className="history-date">{session.date}</div>
                          <div 
                            className="history-subject" 
                            style={{ color: subject?.color }}
                          >
                            {subject?.name}
                          </div>
                          <div className="history-hours">{session.hours}時間</div>
                          {session.notes && (
                            <div className="history-notes">{session.notes}</div>
                          )}
                        </div>
                      )
                    })
                )}
              </div>
            </section>
          </>
        )}

        {/* 週予定表タブ */}
        {activeTab === 'week' && (
          <section className="week-schedule-section">
            <h2>今週の予定</h2>
            
            <div className="week-grid">
              {generateWeekDays().map((day, index) => (
                <div key={index} className={`week-day ${day.isToday ? 'today' : ''}`}>
                  <div className="week-day-header">
                    <div className="week-day-name">{day.dayName}</div>
                    <div className="week-day-date">{day.date}</div>
                  </div>
                  
                  <div className="week-day-content">
                    {day.studyHours > 0 && (
                      <div className="week-study-sessions">
                        <div className="week-section-label">✏️</div>
                        {day.studySessions?.slice(0, 3).map((session, i) => {
                          const subject = subjects.find(s => s.id === session.subjectId)
                          return (
                            <div 
                              key={i} 
                              className="week-study-item"
                              style={{ borderLeftColor: subject?.color || '#000000' }}
                            >
                              <div className="week-study-subject">{subject?.name || '不明'}</div>
                              <div className="week-study-hours">{session.hours}h</div>
                            </div>
                          )
                        })}
                        {day.studySessions?.length > 3 && (
                          <div className="week-more-study">
                            +{day.studySessions.length - 3}件
                          </div>
                        )}
                      </div>
                    )}
                    
                    {day.schedules.length > 0 && (
                      <div className="week-schedules">
                        {day.schedules.slice(0, 3).map((schedule, i) => {
                          const subject = subjects.find(s => s.id === schedule.subjectId)
                          return (
                            <div 
                              key={i} 
                              className="week-schedule-item"
                              style={{ borderLeftColor: subject?.color || '#000000' }}
                            >
                              <div className="week-schedule-title">{schedule.title}</div>
                              <div className="week-schedule-subject">{subject?.name || '不明'}</div>
                            </div>
                          )
                        })}
                        {day.schedules.length > 3 && (
                          <div className="week-more-schedules">
                            +{day.schedules.length - 3}件
                          </div>
                        )}
                      </div>
                    )}
                    
                    {day.exams.length > 0 && (
                      <div className="week-exams">
                        <div className="week-section-label">📝</div>
                        {day.exams.slice(0, 3).map((exam, i) => {
                          const subject = subjects.find(s => s.id === exam.subjectId)
                          const percentage = exam.score
                          return (
                            <div 
                              key={i} 
                              className="week-exam-item"
                              style={{ borderLeftColor: subject?.color || '#000000' }}
                            >
                                  <div className="week-exam-subject">{subject?.name || '不明'}</div>
                              <div className="week-exam-score">{percentage}%</div>
                            </div>
                          )
                        })}
                        {day.exams.length > 3 && (
                              <div className="week-more-exams">
                            +{day.exams.length - 3}件
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* カレンダータブ */}
        {activeTab === 'calendar' && (
          <section className="calendar-section">
            <h2>勉強カレンダー</h2>
            
            <div className="calendar-header">
              <button onClick={() => changeMonth('prev')} className="month-button">
                ←
              </button>
              <h3>
                {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
              </h3>
              <button onClick={() => changeMonth('next')} className="month-button">
                →
              </button>
            </div>
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {generateCalendarDays().map((day, index) => {
                  const dateStr = (() => {
                    const year = currentDate.getFullYear()
                    const month = currentDate.getMonth()
                    const dayNum = day.date
                    const date = new Date(year, month, dayNum)
                    const yearStr = date.getFullYear()
                    const monthStr = String(date.getMonth() + 1).padStart(2, '0')
                    const dayStr = String(date.getDate()).padStart(2, '0')
                    return `${yearStr}-${monthStr}-${dayStr}`
                  })()
                  const dayStudySessions = studySessions.filter(session => session.date === dateStr)
                  return (
                    <div 
                      key={index} 
                      className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.studyHours > 0 ? 'has-study' : ''}`}
                      onClick={() => day.isCurrentMonth && handleDateClick(dateStr)}
                      style={{ cursor: day.isCurrentMonth ? 'pointer' : 'default' }}
                    >
                      <div className="day-number">{day.date}</div>
                      {day.studyHours > 0 && (
                        <div className="study-indicator">
                          <div className="study-hours">{day.studyHours}h</div>
                          <div className="study-subjects">
                            {day.subjects.slice(0, 2).map((subject, i) => {
                              const session = dayStudySessions.find(s => {
                                const subjectName = subjects.find(subj => subj.id === s.subjectId)?.name
                                return subjectName === subject
                              })
                              return (
                                <span key={i} className="subject-tag">
                                  {session?.emoji || '📚'} {subject}
                                </span>
                              )
                            })}
                            {day.subjects.length > 2 && (
                              <span className="more-subjects">+{day.subjects.length - 2}</span>
                            )}
                          </div>
                          {day.notes.length > 0 && (
                            <div className="study-notes-preview">
                              {day.notes.slice(0, 1).map((note, i) => (
                                <span key={i} className="note-preview">{note}</span>
                              ))}
                              {day.notes.length > 1 && (
                                <span className="more-notes">+{day.notes.length - 1}件のメモ</span>
                              )}
                            </div>
                          )}
                          {day.schedules.length > 0 && (
                            <div className="schedule-preview">
                              {day.schedules.slice(0, 2).map((schedule, i) => {
                                const subject = subjects.find(s => s.id === schedule.subjectId)
                                return (
                                  <div key={i} className="schedule-item" style={{ borderLeftColor: subject?.color || '#000000' }}>
                                    <span className="schedule-title">{schedule.title}</span>
                                  </div>
                                )
                              })}
                              {day.schedules.length > 2 && (
                                <div className="more-schedules">+{day.schedules.length - 2}件の予定</div>
                              )}
                            </div>
                          )}
                          
                          {day.exams.length > 0 && (
                            <div className="exam-preview">
                              <div className="calendar-section-label">📝</div>
                              {day.exams.map((exam, i) => {
                                const subject = subjects.find(s => s.id === exam.subjectId)
                                const percentage = exam.score
                                return (
                                  <div key={i} className="calendar-exam-item" style={{ borderLeftColor: subject?.color || '#000000' }}>
                                    <span className="exam-score">{percentage}%</span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* 日付詳細モーダル */}
        {showDateDetail && (
          <div className="modal-overlay" onClick={() => setShowDateDetail(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedDate} の勉強記録</h3>
                <button 
                  className="modal-close" 
                  onClick={() => setShowDateDetail(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {(() => {
                  const daySessions = getStudySessionsForDate(selectedDate)
                  const daySchedules = schedules.filter(schedule => schedule.date === selectedDate)
                  const dayExams = mockExams.filter(exam => exam.date === selectedDate)
                  const totalHours = daySessions.reduce((total, session) => total + session.hours, 0)
                  
                  if (daySessions.length === 0 && daySchedules.length === 0 && dayExams.length === 0) {
                    return (
                      <div className="no-study-data">
                        <p>この日は勉強記録、予定、模擬試験がありません</p>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="day-study-details">
                      {daySessions.length > 0 && (
                        <>
                          <div className="day-summary">
                            <h4>合計勉強時間: {totalHours}時間</h4>
                            <p>記録数: {daySessions.length}件</p>
                          </div>
                          <div className="day-sessions">
                            {daySessions.map(session => {
                              const subject = subjects.find(s => s.id === session.subjectId)
                              const isEditing = editingStudyId === session.id
                              return (
                                <div key={session.id} className="day-session-item">
                                  {isEditing ? (
                                    <div className="edit-form">
                                      <div className="form-row">
                                        <label>日付</label>
                                        <input type="date" value={editStudyDate} onChange={(e) => setEditStudyDate(e.target.value)} />
                                      </div>
                                      <div className="form-row">
                                        <label>科目</label>
                                        <select value={editStudySubject} onChange={(e) => setEditStudySubject(e.target.value)}>
                                          {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="form-row">
                                        <label>時間</label>
                                        <input type="number" min="0" step="0.5" value={editStudyHours} onChange={(e) => setEditStudyHours(Number(e.target.value))} />
                                      </div>
                                      <div className="form-row">
                                        <label>気分</label>
                                        <select value={editStudyEmoji} onChange={(e) => setEditStudyEmoji(e.target.value)}>
                                          {emojiOptions.map(opt => (
                                            <option key={opt.emoji} value={opt.emoji}>{opt.emoji} {opt.meaning}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="form-row">
                                        <label>メモ</label>
                                        <input type="text" value={editStudyNotes} onChange={(e) => setEditStudyNotes(e.target.value)} />
                                      </div>
                                      <div className="form-actions">
                                        <button className="save-button" onClick={saveEditStudy}>保存</button>
                                        <button className="cancel-button" onClick={cancelEditStudy}>キャンセル</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div 
                                        className="session-emoji" 
                                        title={getEmojiMeaning(session.emoji)}
                                      >
                                        {session.emoji}
                                      </div>
                                      <div className="session-subject" style={{ color: subject?.color }}>
                                        {subject?.name}
                                      </div>
                                      <div className="session-hours">{session.hours}時間</div>
                                      {session.notes && (
                                        <div className="session-notes">{session.notes}</div>
                                      )}
                                      <div className="item-actions">
                                        <button className="edit-button" onClick={() => startEditStudy(session)}>編集</button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                      
                      {daySchedules.length > 0 && (
                        <>
                          <div className="day-summary">
                            <h4>予定: {daySchedules.length}件</h4>
                          </div>
                          <div className="day-schedules">
                            {daySchedules.map(schedule => {
                              const subject = subjects.find(s => s.id === schedule.subjectId)
                              const isEditing = editingScheduleId === schedule.id
                              return (
                                <div key={schedule.id} className="day-schedule-item">
                                  <div 
                                    className="schedule-color-indicator" 
                                    style={{ backgroundColor: subject?.color || '#000000' }}
                                  />
                                  {isEditing ? (
                                    <div className="edit-form schedule">
                                      <div className="form-row">
                                        <label>タイトル</label>
                                        <input type="text" value={editScheduleTitle} onChange={(e) => setEditScheduleTitle(e.target.value)} />
                                      </div>
                                      <div className="form-row">
                                        <label>日付</label>
                                        <input type="date" value={editScheduleDate} onChange={(e) => setEditScheduleDate(e.target.value)} />
                                      </div>
                                      <div className="form-row">
                                        <label>科目</label>
                                        <select value={editScheduleSubject} onChange={(e) => setEditScheduleSubject(e.target.value)}>
                                          {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="form-row">
                                        <label>詳細</label>
                                        <input type="text" value={editScheduleDescription} onChange={(e) => setEditScheduleDescription(e.target.value)} />
                                      </div>
                                      <div className="form-actions">
                                        <button className="save-button" onClick={saveEditSchedule}>保存</button>
                                        <button className="cancel-button" onClick={cancelEditSchedule}>キャンセル</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="schedule-content">
                                      <div className="schedule-title" style={{ color: subject?.color }}>
                                        {schedule.title}
                                      </div>
                                      <div className="schedule-subject-name">
                                        {subject?.name || '不明な科目'}
                                      </div>
                                      {schedule.description && (
                                        <div className="schedule-description">{schedule.description}</div>
                                      )}
                                      <div className="item-actions">
                                        <button className="edit-button" onClick={() => startEditSchedule(schedule)}>編集</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                      
                      {dayExams.length > 0 && (
                        <>
                          <div className="day-summary">
                            <h4>チェック問題: {dayExams.length}件</h4>
                          </div>
                          <div className="day-exams">
                            {dayExams.map(exam => {
                              const subject = subjects.find(s => s.id === exam.subjectId)
                              const percentage = exam.score
                              const isEditing = editingExamId === exam.id
                              return (
                                <div key={exam.id} className="day-exam-item">
                                  <div 
                                    className="exam-color-indicator" 
                                    style={{ backgroundColor: subject?.color || '#000000' }}
                                  />
                                  {isEditing ? (
                                    <div className="edit-form exam">
                                      <div className="form-row">
                                        <label>科目</label>
                                        <select value={editExamSubject} onChange={(e) => setEditExamSubject(e.target.value)}>
                                          {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="form-row">
                                        <label>総問題数</label>
                                        <input type="number" min="1" value={editExamTotalQuestions} onChange={(e) => setEditExamTotalQuestions(Number(e.target.value))} />
                                      </div>
                                      <div className="form-row">
                                        <label>正解数</label>
                                        <input type="number" min="0" value={editExamCorrectAnswers} onChange={(e) => setEditExamCorrectAnswers(Number(e.target.value))} />
                                      </div>
                                      <div className="form-row">
                                        <label>所要時間(分)</label>
                                        <input type="number" min="0" value={editExamTimeSpent} onChange={(e) => setEditExamTimeSpent(Number(e.target.value))} />
                                      </div>
                                      <div className="form-row">
                                        <label>メモ</label>
                                        <input type="text" value={editExamNotes} onChange={(e) => setEditExamNotes(e.target.value)} />
                                      </div>
                                      <div className="form-actions">
                                        <button className="save-button" onClick={saveEditExam}>保存</button>
                                        <button className="cancel-button" onClick={cancelEditExam}>キャンセル</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="exam-content">
                                      <div className="exam-subject" style={{ color: subject?.color }}>
                                        {subject?.name || '不明な科目'}
                                      </div>
                                      <div className="exam-score">
                                        {exam.score} / {exam.totalQuestions} 問 ({percentage}%)
                                      </div>
                                      <div className="exam-time">
                                        所要時間: {exam.timeSpent}分
                                      </div>
                                      {exam.notes && (
                                        <div className="exam-notes">{exam.notes}</div>
                                      )}
                                      <div className="item-actions">
                                        <button className="edit-button" onClick={() => startEditExam(exam)}>編集</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* チェック問題タブ */}
        {activeTab === 'exams' && (
          <>
            <section className="exam-input-section">
              <h2>チェック問題 記録</h2>
              <div className="exam-form">
                <div className="form-group">
                  <label>科目:</label>
                  <select 
                    value={examSubject} 
                    onChange={(e) => setExamSubject(e.target.value)}
                  >
                    <option value="">科目を選択</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>総問題数:</label>
                  <input 
                    type="number" 
                    value={totalQuestions} 
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    min="1"
                    placeholder="問題数"
                  />
                </div>
                
                <div className="form-group">
                  <label>正解数:</label>
                  <input 
                    type="number" 
                    value={correctAnswers} 
                    onChange={(e) => setCorrectAnswers(Number(e.target.value))}
                    min="0"
                    placeholder="正解数"
                  />
                </div>
                
                <div className="form-group">
                  <label>所要時間(分):</label>
                  <input 
                    type="number" 
                    value={timeSpent} 
                    onChange={(e) => setTimeSpent(Number(e.target.value))}
                    min="0"
                    placeholder="分"
                  />
                </div>
                
                <div className="form-group">
                  <label>メモ:</label>
                  <input 
                    type="text" 
                    value={examNotes} 
                    onChange={(e) => setExamNotes(e.target.value)}
                    placeholder="感想や反省点など"
                  />
                </div>
                
                <button onClick={addMockExam} className="add-button">
                  チェック結果を記録
                </button>
              </div>
            </section>

            <section className="exam-history-section">
              <h2>チェック問題 履歴</h2>
              <div className="exam-list">
                {mockExams.length === 0 ? (
                  <p className="no-history">まだチェック問題の記録がありません</p>
                ) : (
                  mockExams
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(exam => {
                      const subject = subjects.find(s => s.id === exam.subjectId)
                      return (
                        <div key={exam.id} className="exam-item">
                          <div className="exam-header">
                            <div className="exam-date">{exam.date}</div>
                            <div 
                              className="exam-subject" 
                              style={{ color: subject?.color }}
                            >
                              {subject?.name}
                            </div>
                            <div className={`exam-score ${exam.score >= 70 ? 'pass' : 'fail'}`}>
                              {exam.score}点
                            </div>
                          </div>
                          <div className="exam-details">
                            <span>{exam.correctAnswers}/{exam.totalQuestions}問正解</span>
                            <span>{exam.timeSpent}分</span>
                          </div>
                          {exam.notes && (
                            <div className="exam-notes">{exam.notes}</div>
                          )}
                        </div>
                      )
                    })
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
