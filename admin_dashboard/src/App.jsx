import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { 
  Users, 
  CreditCard, 
  BookOpen, 
  Video, 
  CheckCircle2, 
  Search, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Download
} from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ totalStudents: 0, totalCollections: 0, activeCourses: 0 })
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [materials, setMaterials] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Modals / Form states
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [newMaterial, setNewMaterial] = useState({ title: '', category: 'youtube_video', url: '', description: '' })

  useEffect(() => {
    fetchInitialData()
  }, [])

  async function fetchInitialData() {
    setLoading(true)
    try {
      // 1. Fetch Students
      const { data: stdData, count: stdCount } = await supabase
        .from('student')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .limit(20)

      // 2. Fetch Courses
      const { data: crsData } = await supabase
        .from('courses')
        .select('*')

      // 3. Fetch Payments summary
      const { data: payData } = await supabase
        .from('payments')
        .select('amount')

      // 4. Fetch Updates/Materials
      const { data: matData } = await supabase
        .from('updates_and_materials')
        .select('*')
        .order('created_at', { ascending: false })

      const totalRev = (payData || []).reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)

      setStudents(stdData || [])
      setCourses(crsData || [])
      setMaterials(matData || [])
      setStats({
        totalStudents: stdCount || stdData?.length || 0,
        totalCollections: totalRev,
        activeCourses: crsData?.length || 0
      })
    } catch (err) {
      console.error('Error fetching data from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddMaterial(e) {
    e.preventDefault()
    if (!newMaterial.title || !newMaterial.url) return alert('Title and Link are required!')
    
    const { error } = await supabase
      .from('updates_and_materials')
      .insert([newMaterial])

    if (error) {
      alert('Error adding material: ' + error.message)
    } else {
      setNewMaterial({ title: '', category: 'youtube_video', url: '', description: '' })
      setShowAddMaterial(false)
      fetchInitialData()
    }
  }

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact?.includes(searchQuery)
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>DOT-CMC</h2>
            <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>● Next-Gen Admin</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp size={18} /> },
            { id: 'students', label: 'Students Directory', icon: <Users size={18} /> },
            { id: 'courses', label: 'Courses & Fees', icon: <BookOpen size={18} /> },
            { id: 'materials', label: 'Study & YouTube', icon: <Video size={18} /> },
            { id: 'attendance', label: 'Face Attendance', icon: <CheckCircle2 size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#60a5fa' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? '700' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="glass-panel" style={{ padding: '14px', marginTop: 'auto' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Backend Engine</p>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>Supabase Cloud DB</p>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Mumbai Region (AWS)</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800' }}>
              {activeTab === 'overview' && 'Center Performance Dashboard'}
              {activeTab === 'students' && 'Students Management'}
              {activeTab === 'courses' && 'Course Curriculum & Pricing'}
              {activeTab === 'materials' && 'Study Materials & Video Portal'}
              {activeTab === 'attendance' && 'Daily Attendance Log'}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
              Real-time synchronization with mobile apps & cloud database.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <span className="badge badge-success">Dev Environment Live</span>
            <span className="badge badge-info">Zero Downtime</span>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Total Enrolled Students</span>
                  <Users size={20} color="#60a5fa" />
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px' }}>{stats.totalStudents}</h2>
                <p style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>Migrated from sfps_db.sql</p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Total Fee Collection</span>
                  <CreditCard size={20} color="#34d399" />
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px' }}>₹{stats.totalCollections.toLocaleString('en-IN')}</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Verified Transaction Records</p>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Active Courses</span>
                  <BookOpen size={20} color="#f59e0b" />
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px' }}>{stats.activeCourses}</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Curriculum modules</p>
              </div>
            </div>

            {/* Quick Students preview */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Recently Active Students</h3>
                <button className="btn-secondary" onClick={() => setActiveTab('students')}>View Full Directory</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Contact Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 6).map(std => (
                    <tr key={std.id}>
                      <td style={{ fontWeight: '700', color: '#60a5fa' }}>{std.id_no}</td>
                      <td>{std.name}</td>
                      <td>{std.contact || 'N/A'}</td>
                      <td><span className="badge badge-success">Enrolled</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Students Directory */}
        {activeTab === 'students' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search students by roll number, name or phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '40px' }}
                />
              </div>
              <button className="btn-primary"><Plus size={18} /> New Admission</button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Full Name</th>
                  <th>Mobile Number</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(std => (
                  <tr key={std.id}>
                    <td style={{ fontWeight: '700', color: '#60a5fa' }}>{std.id_no}</td>
                    <td>{std.name}</td>
                    <td>{std.contact || 'N/A'}</td>
                    <td>{std.address || '—'}</td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        View Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Courses */}
        {activeTab === 'courses' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {courses.map(c => (
              <div key={c.id} className="glass-panel" style={{ padding: '24px' }}>
                <span className="badge badge-info" style={{ marginBottom: '12px', display: 'inline-block' }}>Code #{c.id}</span>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{c.course}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '8px 0 16px' }}>
                  {c.description || 'Standard Computer Certification Course'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Course Fee:</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#34d399' }}>₹{parseFloat(c.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Study Materials & YouTube */}
        {activeTab === 'materials' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                Upload notes and YouTube video links here. Students receive instant updates on their mobile app.
              </p>
              <button className="btn-primary" onClick={() => setShowAddMaterial(!showAddMaterial)}>
                <Plus size={18} /> Push New Material
              </button>
            </div>

            {showAddMaterial && (
              <form onSubmit={handleAddMaterial} className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Add Study Resource for Students</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Material Title (e.g., Tally Prime GST Full Lecture)" 
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  />
                  <select 
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                  >
                    <option value="youtube_video">YouTube Video Lecture</option>
                    <option value="study_material">PDF Notes / Document Link</option>
                    <option value="notice">Center Notice / Announcement</option>
                  </select>
                </div>
                <input 
                  type="url" 
                  placeholder="URL Link (YouTube link or Google Drive PDF link)" 
                  value={newMaterial.url}
                  onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                  style={{ width: '100%', marginBottom: '16px' }}
                />
                <textarea 
                  placeholder="Optional brief notes or instructions for students..."
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  style={{ width: '100%', minHeight: '80px', marginBottom: '16px' }}
                />
                <button type="submit" className="btn-primary">Publish to Students</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {materials.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No materials posted yet. Click <strong>"Push New Material"</strong> above to publish your first video or document!
                </div>
              ) : (
                materials.map(mat => (
                  <div key={mat.id} className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-warning">{mat.category}</span>
                      <a href={mat.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}><ExternalLink size={16} /></a>
                    </div>
                    <h4 style={{ fontSize: '17px', fontWeight: '700', marginTop: '8px' }}>{mat.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 16px' }}>{mat.description || 'No description provided.'}</p>
                    <a href={mat.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                      Open Resource
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Face Attendance */}
        {activeTab === 'attendance' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 size={32} color="#10b981" />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>On-Device Face Attendance Ready</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  Students scan their faces in the mobile app. Face photos remain on the student's phone (0 MB cloud storage used), only attendance timestamps log into Supabase.
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontWeight: '600', color: '#60a5fa' }}>Feature Status: Enabled in Dev Mode</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                When students verify through the mobile app, real-time records stream directly into the <code>attendance</code> table.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
