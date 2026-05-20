import { useState, useEffect } from "react";
import { Card, CardBody, CardTitle, Alert, Button, Input, FormGroup, Label, Spinner } from "reactstrap";
import api from "../../api/index";
import { ENDPOINTS } from "../../api/endpoints";

export default function TwoFactorSetup() {
  const [status, setStatus] = useState(null);
  const [setupData, setSetupData] = useState(null);
  const [verifyToken, setVerifyToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [enableLoading, setEnableLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.get(ENDPOINTS.AUTH.ME)
      .then((res) => {
        setStatus({ twoFactorEnabled: res.data?.data?.twoFactorEnabled ?? false });
      })
      .catch(() => setError("Failed to load 2FA status."))
      .finally(() => setLoading(false));
  }, []);

  const handleSetup = async () => {
    setError(null);
    setSuccess(null);
    setSetupLoading(true);
    try {
      const res = await api.post(ENDPOINTS.EMPLOYEES_2FA.SETUP);
      const d = res.data?.data;
      // normalize: controller returns { otpauth, secret } — alias to otpauthUri
      setSetupData(d ? { secret: d.secret, otpauthUri: d.otpauthUri ?? d.otpauth } : null);
    } catch {
      setError("Failed to start 2FA setup. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setSuccess(null);
    setResetLoading(true);
    try {
      await api.post(ENDPOINTS.EMPLOYEES_2FA.RESET);
      setStatus({ twoFactorEnabled: false });
      setSetupData(null);
      setVerifyToken("");
      setConfirmReset(false);
      setSuccess("2FA has been reset. Click 'Set Up 2FA' to re-enroll.");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Reset failed. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!verifyToken.trim()) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setError(null);
    setEnableLoading(true);
    try {
      await api.post(ENDPOINTS.EMPLOYEES_2FA.ENABLE, { totpToken: verifyToken.trim() });
      setSuccess("Two-factor authentication enabled successfully.");
      setStatus({ twoFactorEnabled: true });
      setSetupData(null);
      setVerifyToken("");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Invalid code. Please try again.");
    } finally {
      setEnableLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <Spinner size="sm" /> Loading…
      </div>
    );
  }

  return (
    <div className="page-content">
      <h4 className="mb-4">Two-Factor Authentication</h4>

      {error && <Alert color="danger" toggle={() => setError(null)}>{error}</Alert>}
      {success && <Alert color="success" toggle={() => setSuccess(null)}>{success}</Alert>}

      <Card>
        <CardBody>
          <CardTitle tag="h5">2FA Status</CardTitle>
          <p>
            Status:{" "}
            <strong className={status?.twoFactorEnabled ? "text-success" : "text-danger"}>
              {status?.twoFactorEnabled ? "Enabled" : "Disabled"}
            </strong>
          </p>

          {!status?.twoFactorEnabled && !setupData && (
            <Button color="primary" onClick={handleSetup} disabled={setupLoading}>
              {setupLoading ? <Spinner size="sm" /> : "Set Up 2FA"}
            </Button>
          )}

          {status?.twoFactorEnabled && !setupData && !confirmReset && (
            <Button color="warning" onClick={() => setConfirmReset(true)}>
              Re-enroll 2FA (lost device / broken pairing)
            </Button>
          )}

          {status?.twoFactorEnabled && confirmReset && (
            <div className="mt-2 p-3 border border-warning rounded">
              <p className="mb-2 text-warning fw-semibold">
                This will remove your current 2FA pairing. You will need to scan a new QR code to re-enroll.
              </p>
              <Button color="danger" onClick={handleReset} disabled={resetLoading} className="me-2">
                {resetLoading ? <Spinner size="sm" /> : "Yes, Reset 2FA"}
              </Button>
              <Button color="secondary" onClick={() => setConfirmReset(false)} disabled={resetLoading}>
                Cancel
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {setupData && (
        <Card className="mt-3">
          <CardBody>
            <CardTitle tag="h5">Scan QR Code</CardTitle>
            <p className="text-muted">
              Scan the QR code below with Google Authenticator, Authy, or any TOTP-compatible app.
              If you cannot scan, enter the secret key manually.
            </p>

            <div className="mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.otpauthUri)}`}
                alt="2FA QR Code"
                style={{ border: "1px solid #dee2e6", borderRadius: 4 }}
              />
            </div>

            <FormGroup>
              <Label>Secret Key (manual entry)</Label>
              <Input
                type="text"
                readOnly
                value={setupData.secret}
                style={{ fontFamily: "monospace", letterSpacing: 2 }}
              />
            </FormGroup>

            <FormGroup className="mt-3">
              <Label>Verify — enter the 6-digit code from your app</Label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, ""))}
                style={{ maxWidth: 160, fontFamily: "monospace", letterSpacing: 4 }}
              />
            </FormGroup>

            <Button color="success" onClick={handleEnable} disabled={enableLoading}>
              {enableLoading ? <Spinner size="sm" /> : "Enable 2FA"}
            </Button>
            <Button color="secondary" className="ms-2" onClick={() => { setSetupData(null); setVerifyToken(""); setError(null); }}>
              Cancel
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
