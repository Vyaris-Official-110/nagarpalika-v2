import { useState, useEffect } from 'react'
import { getNotices } from '../api/index'

const TYPE_FILTERS = [
  { k: 'all',                    l: 'All' },
  { k: 'notice',                 l: 'Notice' },
  { k: 'circular',               l: 'Circular' },
  { k: 'tender',                 l: 'Tender' },
  { k: 'press',                  l: 'Press Release' },
  { k: 'recruitment',            l: 'Recruitment' },
  { k: 'result',                 l: 'Result' },
  { k: 'important_instruction',  l: 'Important Instruction' },
]

const TYPE_LABEL = {
  notice: 'Notice', circular: 'Circular', tender: 'Tender', press: 'Press',
  recruitment: 'Recruit', result: 'Result', important_instruction: 'Instruction',
}

export default function Notices() {
  const [filter, setFilter] = useState('all')
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const type = filter !== 'all' ? filter : undefined
    setLoading(true)
    setError(null)
    getNotices(type)
      .then(res => setNotices(res.data?.data ?? []))
      .catch(() => setError('Could not load notices. Please try again later.'))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <>
      <div className="page-heading">
        <h1>Notices, Circulars &amp; Public Communications</h1>
        <span className="guj">સૂચનાઓ, પરિપત્રો અને જાહેર સંદેશાઓ</span>
      </div>

      <div className="filter-row">
        <span className="label">Filter by Type</span>
        {TYPE_FILTERS.map(f => (
          <button
            key={f.k}
            className={`chip${filter === f.k ? ' active' : ''}`}
            onClick={() => setFilter(f.k)}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="box">
        <div className="box-title">
          <span>Recent Notices &amp; Circulars</span>
          <span className="guj">તાજેતરની સૂચનાઓ</span>
        </div>

        {loading && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ojas-ink-3)' }}>Loading…</div>}
        {error   && <div className="notice info" style={{ margin: '8px 0' }}><span>{error}</span></div>}
        {!loading && !error && (
          <table className="ojas">
            <thead>
              <tr>
                <th style={{ width: 36 }}>Sr.</th>
                <th style={{ width: 110 }}>Date</th>
                <th style={{ width: 130 }}>Reference No.</th>
                <th>Subject</th>
                <th style={{ width: 120 }}>Type</th>
                <th style={{ width: 80 }}>File</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n, i) => (
                <tr key={n._id}>
                  <td>{i + 1}</td>
                  <td>{new Date(n.publishedAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{n.refNo || '—'}</td>
                  <td><a href="#">{n.title}</a></td>
                  <td><span className={`tag ${n.type}`}>{TYPE_LABEL[n.type] ?? n.type}</span></td>
                  <td>
                    {n.pdfPath
                      ? <a href={`${import.meta.env.VITE_API_URL || ''}${n.pdfPath}`} target="_blank" rel="noreferrer">PDF ▶</a>
                      : '—'}
                  </td>
                </tr>
              ))}
              {notices.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--ojas-ink-3)', fontStyle: 'italic' }}>No notices found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
