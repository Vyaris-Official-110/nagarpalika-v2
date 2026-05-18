import React, { useState, useEffect, useContext } from "react";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Spinner, Button,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { AuthContext } from "../../context/AuthContext";
import { getDashboardStats } from "../../api/analytics.api";

const dashboardStyles = `
.vy-dashboard {
  font-family: var(--vy-font-body, 'Manrope', sans-serif);
}
.vy-dashboard .vy-greeting {
  font-family: var(--vy-font-display, 'Barlow', sans-serif);
  font-weight: 700;
  font-size: 28px;
  letter-spacing: -0.015em;
  color: var(--vy-ink, #0A0B0A);
  margin: 0;
}
.vy-dashboard .vy-greeting .accent { color: var(--vy-lime-700, #145c2e); }
.vy-dashboard .vy-sub {
  color: var(--vy-fg-2, #5C5F58);
  font-size: 14px;
  margin-top: 4px;
  margin-bottom: 0;
}

.vy-dashboard .card,
.vy-dashboard .vy-card {
  background: #FFFFFF;
  border: 1px solid var(--vy-line-1, #D2D6CB);
  border-radius: 8px;
  box-shadow: none;
  transition: border-color 120ms ease;
}
.vy-dashboard .card-animate:hover { border-color: var(--vy-line-2, #B9BEB1); }

.vy-dashboard .vy-eyebrow {
  font-family: var(--vy-font-display, 'Barlow', sans-serif);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vy-fg-2, #5C5F58);
  margin: 0;
}
.vy-dashboard .vy-metric-num {
  font-family: var(--vy-font-display, 'Barlow', sans-serif);
  font-weight: 700;
  font-size: 36px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--vy-ink, #0A0B0A);
  font-feature-settings: "tnum" 1;
  margin: 12px 0 0 0;
}
.vy-dashboard .vy-metric-delta {
  font-family: var(--vy-font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  margin-top: 6px;
  color: var(--vy-fg-3, #8E918A);
}

.vy-dashboard .vy-icon-square {
  width: 36px; height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vy-bg-2, #EDEFE8);
  color: var(--vy-ink, #0A0B0A);
  font-size: 18px;
}
.vy-dashboard .vy-icon-square.accent {
  background: rgba(200, 255, 61, 0.18);
  color: var(--vy-lime-700, #145c2e);
}

.vy-dashboard h6.card-title {
  font-family: var(--vy-font-display, 'Barlow', sans-serif);
  font-weight: 600;
  font-size: 14px;
  color: var(--vy-ink, #0A0B0A);
  margin: 0;
}
.vy-dashboard .card-header {
  background: transparent;
  border-bottom: 1px solid var(--vy-line-0, #E2E5DC);
}

.vy-dashboard .btn { font-family: var(--vy-font-display, 'Barlow', sans-serif); }
`;

const formatCurrency = (n) => {
  if (n == null) return "₹0";
  return `₹${Number(n).toLocaleString("en-IN")}`;
};

const Dashboard = () => {
  const { adminData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats();
      if (res.data.isOk) {
        setStats(res.data.data);
      }
    } catch {
      // silently fail — widgets show 0
    }
    setLoading(false);
  };

  document.title = `Dashboard · ${adminData?.companyName}`;

  const widgets = [
    {
      title: "Active advertisements",
      value: stats?.activeAdvertisements ?? 0,
      icon: "ri-megaphone-line",
      accent: true,
      onClick: () => navigate("/advertisement"),
    },
    {
      title: "Total candidates",
      value: stats?.totalCandidates ?? 0,
      icon: "ri-user-3-line",
      onClick: () => navigate("/candidates"),
    },
    {
      title: "Total applications",
      value: stats?.totalApplications ?? 0,
      icon: "ri-file-list-3-line",
      onClick: () => navigate("/applications"),
    },
    {
      title: "Fees collected",
      value: formatCurrency(stats?.totalFeesCollected),
      icon: "ri-money-rupee-circle-line",
      delta: "all time · successful payments",
      onClick: () => navigate("/fee-payments"),
    },
  ];

  return (
    <>
      <style>{dashboardStyles}</style>
      <div className="page-content vy-dashboard">
        <Container fluid>
          <BreadCrumb title="Dashboard" pageTitle="Dashboard" />

          <Row className="mb-4 align-items-end">
            <Col>
              <p className="vy-eyebrow mb-2">Overview</p>
              <h1 className="vy-greeting">
                {greeting},{" "}
                <span className="accent">
                  {adminData?.employeeName || adminData?.companyName}
                </span>
              </h1>
              <p className="vy-sub">Recruitment portal — {adminData?.companyName}</p>
            </Col>
            <Col xs="auto">
              <Button color="light" size="sm" onClick={fetchStats} disabled={loading}>
                <i className="ri-refresh-line me-1"></i>Refresh
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5"><Spinner color="primary" /></div>
          ) : (
            <>
              <Row className="mb-4">
                {widgets.map((w, i) => (
                  <Col md={6} xl={3} key={i}>
                    <Card
                      className="card-animate"
                      style={{ cursor: w.onClick ? "pointer" : "default" }}
                      onClick={w.onClick}
                    >
                      <CardBody>
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <p className="vy-eyebrow">{w.title}</p>
                            <h2 className="vy-metric-num">{w.value}</h2>
                            {w.delta && (
                              <p className="vy-metric-delta">{w.delta}</p>
                            )}
                          </div>
                          <div className={`vy-icon-square ${w.accent ? "accent" : ""}`}>
                            <i className={w.icon}></i>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Row>
                <Col md={6} xl={4}>
                  <Card>
                    <CardHeader>
                      <h6 className="card-title">
                        <i className="ri-flashlight-line me-2"></i>Quick actions
                      </h6>
                    </CardHeader>
                    <CardBody>
                      <div className="vstack gap-2">
                        <Button color="primary" onClick={() => navigate("/advertisement/add")}>
                          <i className="ri-add-line me-2"></i>New Advertisement
                        </Button>
                        <Button color="light" onClick={() => navigate("/notice/add")}>
                          <i className="ri-notification-3-line me-2"></i>Post Notice
                        </Button>
                        <Button color="light" onClick={() => navigate("/candidates")}>
                          <i className="ri-user-3-line me-2"></i>View Candidates
                        </Button>
                        <Button color="light" onClick={() => navigate("/applications")}>
                          <i className="ri-file-list-3-line me-2"></i>View Applications
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col md={6} xl={8}>
                  <Card>
                    <CardHeader>
                      <h6 className="card-title">
                        <i className="ri-information-line me-2"></i>Portal status
                      </h6>
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col sm={6} className="mb-3">
                          <p className="vy-eyebrow mb-1" style={{ fontSize: 10 }}>Fee payments</p>
                          <div
                            className="d-flex align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/fee-payments")}
                          >
                            <div className="vy-icon-square">
                              <i className="ri-bank-card-line"></i>
                            </div>
                            <span style={{ fontFamily: "var(--vy-font-display)", fontWeight: 700, color: "var(--vy-ink)", fontSize: 20 }}>
                              {formatCurrency(stats?.totalFeesCollected)}
                            </span>
                          </div>
                        </Col>
                        <Col sm={6} className="mb-3">
                          <p className="vy-eyebrow mb-1" style={{ fontSize: 10 }}>Call letters</p>
                          <div
                            className="d-flex align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/call-letters")}
                          >
                            <div className="vy-icon-square">
                              <i className="ri-mail-check-line"></i>
                            </div>
                            <span style={{ fontFamily: "var(--vy-font-display)", fontWeight: 600, color: "var(--vy-fg-2)", fontSize: 14 }}>
                              Manage &rarr;
                            </span>
                          </div>
                        </Col>
                        <Col sm={6}>
                          <p className="vy-eyebrow mb-1" style={{ fontSize: 10 }}>Notices &amp; circulars</p>
                          <div
                            className="d-flex align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/notice")}
                          >
                            <div className="vy-icon-square">
                              <i className="ri-notification-3-line"></i>
                            </div>
                            <span style={{ fontFamily: "var(--vy-font-display)", fontWeight: 600, color: "var(--vy-fg-2)", fontSize: 14 }}>
                              Manage &rarr;
                            </span>
                          </div>
                        </Col>
                        <Col sm={6}>
                          <p className="vy-eyebrow mb-1" style={{ fontSize: 10 }}>Help queries</p>
                          <div className="d-flex align-items-center gap-2">
                            <div className="vy-icon-square">
                              <i className="ri-question-answer-line"></i>
                            </div>
                            <span style={{ fontFamily: "var(--vy-font-display)", fontWeight: 600, color: "var(--vy-fg-2)", fontSize: 14 }}>
                              Inbox
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
