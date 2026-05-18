import React, { useState, useContext } from "react";
import {
    Card, CardBody, CardHeader, Col, Container, Form,
    FormGroup, Input, Label, Row,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { createNotice } from "../../api/notices.api";

const NOTICE_TYPES = [
    "notice", "circular", "tender", "press",
    "recruitment", "result", "important_instruction",
];

const empty = { title: "", type: "notice", refNo: "", pdfPath: "", expiresAt: "" };

const NoticesForm = () => {
    const { adminData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                expiresAt: form.expiresAt || undefined,
            };
            await createNotice(payload);
            toast.success("Notice created.");
            navigate("/notice");
        } catch (err) {
            toast.error(err?.response?.data?.message ?? "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    document.title = `Add Notice | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb maintitle="Recruitment" title="Add Notice" pageTitle="Notices" />
                    <Row>
                        <Col lg={7}>
                            <Card>
                                <CardHeader><h5 className="mb-0">New Notice / Circular</h5></CardHeader>
                                <CardBody>
                                    <Form onSubmit={handleSubmit}>
                                        <FormGroup>
                                            <Label>Title *</Label>
                                            <Input name="title" value={form.title} onChange={handleChange} required />
                                        </FormGroup>
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Type *</Label>
                                                    <Input type="select" name="type" value={form.type} onChange={handleChange} required>
                                                        {NOTICE_TYPES.map((t) => (
                                                            <option key={t} value={t}>{t.replace("_", " ")}</option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Reference No</Label>
                                                    <Input name="refNo" value={form.refNo} onChange={handleChange} placeholder="e.g. NP/2026/001" />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <FormGroup>
                                            <Label>PDF Path / URL</Label>
                                            <Input name="pdfPath" value={form.pdfPath} onChange={handleChange} placeholder="/uploads/notices/file.pdf" />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>Expires At</Label>
                                            <Input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} />
                                        </FormGroup>
                                        <div className="d-flex gap-2 mt-3">
                                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                                {saving ? "Saving…" : "Create Notice"}
                                            </button>
                                            <button type="button" className="btn btn-light" onClick={() => navigate("/notice")}>
                                                Cancel
                                            </button>
                                        </div>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default NoticesForm;
