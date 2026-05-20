import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
  Button,
  Spinner,
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { getConfig, updateConfig } from "../../api/config.api";

const SiteConfig = () => {
  const { adminData } = useContext(AuthContext);

  const [helpline, setHelpline] = useState("");
  const [otrStatus, setOtrStatus] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [h, o, i] = await Promise.all([
        getConfig("helpline"),
        getConfig("otr_status_message"),
        getConfig("important_instructions"),
      ]);
      setHelpline(h.data?.data ?? "");
      setOtrStatus(o.data?.data ?? "");
      setInstructions(i.data?.data ?? "");
    } catch {
      toast.error("Failed to load site config.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, value, label) => {
    setSaving(key);
    try {
      await updateConfig(key, value);
      toast.success(`${label} updated successfully.`);
    } catch (err) {
      toast.error(err?.response?.data?.error || `Failed to save ${label}.`);
    } finally {
      setSaving(null);
    }
  };

  document.title = `Site Configuration | ${adminData?.companyName}`;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Site Configuration" pageTitle="Recruitment" />

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <Row className="g-3">
              <Col lg={6}>
                <Card className="h-100">
                  <CardHeader className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">Helpline Number</h5>
                    <small className="text-muted">Ticker bar 1 on home page</small>
                  </CardHeader>
                  <CardBody>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Helpline Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={helpline}
                        onChange={(e) => setHelpline(e.target.value)}
                        placeholder="e.g. Toll Free: 1800-XXX-XXXX | Mon-Sat 10am-5pm"
                        maxLength={200}
                      />
                      <small className="text-muted">{helpline.length}/200</small>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        color="primary"
                        onClick={() => handleSave("helpline", helpline, "Helpline")}
                        disabled={saving !== null}
                      >
                        {saving === "helpline" ? (
                          <><Spinner size="sm" className="me-1" />Saving…</>
                        ) : "Save"}
                      </Button>
                      <Button color="light" onClick={fetchAll} disabled={saving !== null}>
                        Reset
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={6}>
                <Card className="h-100">
                  <CardHeader className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">OTR Status Message</h5>
                    <small className="text-muted">Ticker bar 2 on home page</small>
                  </CardHeader>
                  <CardBody>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Status Message</label>
                      <input
                        type="text"
                        className="form-control"
                        value={otrStatus}
                        onChange={(e) => setOtrStatus(e.target.value)}
                        placeholder="e.g. OTR Registration is OPEN"
                        maxLength={200}
                      />
                      <small className="text-muted">{otrStatus.length}/200</small>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        color="primary"
                        onClick={() => handleSave("otr_status_message", otrStatus, "OTR Status")}
                        disabled={saving !== null}
                      >
                        {saving === "otr_status_message" ? (
                          <><Spinner size="sm" className="me-1" />Saving…</>
                        ) : "Save"}
                      </Button>
                      <Button color="light" onClick={fetchAll} disabled={saving !== null}>
                        Reset
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={12}>
                <Card>
                  <CardHeader className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">Important Instructions</h5>
                    <small className="text-muted">Displayed on home page NOTE section</small>
                  </CardHeader>
                  <CardBody>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Instructions Text
                        <span className="text-muted fw-normal ms-2">
                          (shown to all citizens on home page)
                        </span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={8}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Enter important instructions for applicants..."
                        maxLength={2000}
                      />
                      <div className="text-end mt-1">
                        <small className="text-muted">{instructions.length}/2000</small>
                      </div>
                    </div>

                    <div className="alert alert-info py-2 mb-3" role="alert">
                      <i className="ri-information-line me-2"></i>
                      Leave blank to show default static text. Changes take effect immediately — no redeploy required.
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        color="primary"
                        onClick={() => handleSave("important_instructions", instructions, "Important Instructions")}
                        disabled={saving !== null}
                      >
                        {saving === "important_instructions" ? (
                          <><Spinner size="sm" className="me-1" />Saving…</>
                        ) : "Save Instructions"}
                      </Button>
                      <Button color="light" onClick={fetchAll} disabled={saving !== null}>
                        Reset
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default SiteConfig;
