import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import { getAdvertisements } from '../api/index'

const STATUS_LABEL = { published: 'Active', closed: 'Closed', draft: 'Draft' }
const STATUS_CSS   = { published: 'active', closed: 'closed', draft: 'new' }

export default function Careers() {
  const { t } = useLang()
  const [filter, setFilter] = useState('all')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAdvertisements()
      .then(res => setJobs(res.data?.data ?? []))
      .catch(() => setError('Could not load advertisements. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = filter === 'all' ? jobs : jobs.filter(j => j.postClass === filter)
  const counts = {
    all: jobs.length,
    I:   jobs.filter(j => j.postClass === 'I').length,
    II:  jobs.filter(j => j.postClass === 'II').length,
    III: jobs.filter(j => j.postClass === 'III').length,
  }

  const FILTERS = [
    { k: 'all', i: 'car.filter.all', l: 'All' },
    { k: 'I',   i: 'car.filter.1',   l: 'Class I' },
    { k: 'II',  i: 'car.filter.2',   l: 'Class II' },
    { k: 'III', i: 'car.filter.3',   l: 'Class III' },
  ]

  return (
    <>
      <div className="page-heading">
        <h1>{t('car.h')}</h1>
        <span className="guj">{t('car.guj')}</span>
      </div>

      <div className="advt-banner">
        <div>
          <div className="meta" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}>Advertisement No.</div>
          <div className="num">UD / 2026 / 04</div>
        </div>
        <div className="meta" style={{ textAlign: 'right' }}>
          Issued <strong>28/04/2026</strong><br />
          Last Date: <strong style={{ color: '#fff' }}>22/05/2026 — 23:59 IST</strong>
        </div>
      </div>

      <div className="notice info">
        <div className="title">{t('car.notice.title')}</div>
        <span>{t('car.notice.body')}</span>
      </div>

      <div className="filter-row">
        <span className="label">{t('car.filter.label')}</span>
        {FILTERS.map(f => (
          <button
            key={f.k}
            className={`chip${filter === f.k ? ' active' : ''}`}
            onClick={() => setFilter(f.k)}
          >
            <span>{t(f.i) || f.l}</span>
            <span className="count">({counts[f.k]})</span>
          </button>
        ))}
      </div>

      <div className="box">
        <div className="box-title">
          <span>Open Positions</span>
          <span className="guj">ખાલી જગ્યાઓ</span>
        </div>
        {loading && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ojas-ink-3)' }}>Loading…</div>}
        {error   && <div className="notice info" style={{ margin: '8px 0' }}><span>{error}</span></div>}
        {!loading && !error && (
          <table className="ojas">
            <thead>
              <tr>
                <th style={{ width: 36 }}>Sr.</th>
                <th style={{ width: 110 }}>Advt. No.</th>
                <th>Name of Post</th>
                <th style={{ width: 90 }}>Class</th>
                <th style={{ width: 60 }}>Posts</th>
                <th style={{ width: 70 }}>Fee</th>
                <th style={{ width: 100 }}>Last Date</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 90 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((j, i) => {
                const endDate = j.endDate ? new Date(j.endDate).toLocaleDateString('en-IN') : '—'
                return (
                  <tr key={j._id}>
                    <td>{i + 1}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{j.advtNo}</td>
                    <td>
                      <a href="#">{j.postTitle}</a>
                      {j.departmentId?.departmentName && (
                        <div style={{ fontSize: 11, color: 'var(--ojas-ink-3)', marginTop: 2 }}>{j.departmentId.departmentName}</div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--ojas-ink-2)', marginTop: 2 }}>Pay: {j.payScale}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{j.postClass}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--ojas-navy)' }}>{j.vacancies}</td>
                    <td>₹{j.applicationFee}</td>
                    <td>{endDate}</td>
                    <td><span className={`badge ${STATUS_CSS[j.status] ?? j.status}`}>{STATUS_LABEL[j.status] ?? j.status}</span></td>
                    <td>
                      <a href="#" style={{ color: 'var(--ojas-saffron-deep)', fontWeight: 700 }}>{t('car.apply')}</a>
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--ojas-ink-3)', fontStyle: 'italic' }}>No positions match this filter.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--ojas-ink-3)', textAlign: 'center' }}>
        OTR (One Time Registration) does <strong style={{ color: 'var(--ojas-red)' }}>NOT</strong> mean your application is accepted.{' '}
        <span style={{ fontFamily: 'var(--font-guj)' }}>OTR નો અર્થ એ નથી કે તમારી અરજી સ્વીકારાઈ ગઈ છે.</span>
      </div>
    </>
  )
}
