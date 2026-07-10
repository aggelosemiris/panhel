import React, { useEffect, useState } from 'react';
import { getStudentProfileStats, touchStudyActivity } from '../services/studentStats.ts';
import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';
import '../styles/StudentPlanBoard.css';
import { LuTrophy } from 'react-icons/lu';

interface StudentStats {
  totalAnswered: number;
  studyStreak: number;
  completionRate: number;
  bySubject: Array<{
    subject: string;
    progress: number;
  }>;
}

const StudentPlanBoard: React.FC = () => {
  const [stats, setStats] = useState<StudentStats>({
    totalAnswered: 0,
    studyStreak: 12,
    completionRate: 100,
    bySubject: [
      { subject: 'Μαθηματικά', progress: 100 },
      { subject: 'ΑΟΘ', progress: 72 },
      { subject: 'ΑΕΠΠ', progress: 58 },
    ],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = DEFAULT_QUIZ_USER_ID;
        await touchStudyActivity(userId).catch(() => null);
        const profileStats = await getStudentProfileStats(userId);
        
        if (profileStats) {
          const subjectProgress = profileStats.bySubject?.map(item => ({
            subject: item.subject,
            progress: Math.round(item.accuracyPercent || 0),
          })) || [
            { subject: 'Μαθηματικά', progress: 100 },
            { subject: 'ΑΟΘ', progress: 72 },
            { subject: 'ΑΕΠΠ', progress: 58 },
          ];

          setStats({
            totalAnswered: profileStats.totalAnswered || 0,
            studyStreak: profileStats.studyStreak || 0,
            completionRate: Math.round(profileStats.overallAccuracyPercent || 100),
            bySubject: subjectProgress,
          });
        }
      } catch (error) {
        console.error('Error fetching student stats:', error);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="student-plan-board">
      {/* Main Header Section */}
      <div className="plan-header">
        <div className="header-top">
          <div className="trophy-badge">
            <LuTrophy size={40} />
          </div>
          <div className="header-title">
            <p className="platform-label">ΠΛΑΤΦΟΡΜΑ ΠΡΟΕΤΟΙΜΑΣΙΑΣ</p>
            <h1 className="chalk-title">Το Πλάνο σου</h1>
            <p className="header-subtitle">Γεια σου αγαπούσσ. Συνέχισε από εκεί που σταμάτησες και κράτα ρυθμό με δεξάσθαρη εικόνα προόδου.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-label">ΣΥΝΟΛΙΚΗ<br/>ΑΚΡΙΒΕΙΑ</span>
            <span className="stat-value chalk-text">{stats.completionRate}%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">ΑΠΑΝΤΗΜΕΝΕΣ<br/>ΕΡΩΤΗΣΕΙΣ</span>
            <span className="stat-value chalk-text">{stats.totalAnswered}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">ΗΜΕΡΕΣ<br/>STUDY<br/>STREAK</span>
            <span className="stat-value chalk-text">{stats.studyStreak}</span>
          </div>
        </div>
      </div>

      {/* Subject Progress Section */}
      <div className="subjects-progress">
        {stats.bySubject.map((subject, index) => (
          <div key={index} className="subject-card">
            <div className="subject-header">
              <span className="subject-name chalk-text">{subject.subject}</span>
              <span className="subject-percentage">{subject.progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${subject.progress}%`,
                  backgroundColor: getSubjectColor(index),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getSubjectColor(index: number): string {
  const colors = ['#4c7cff', '#20bf6b', '#7b61ff'];
  return colors[index] || '#4c7cff';
}

export default StudentPlanBoard;
