import React, { useState, useEffect, useContext } from "react";
import {
    Card, CardBody, CardHeader, Col, Container, Form,
    FormGroup, Input, Label, Row,
} from "reactstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import {
    createAdvertisement,
    getAdvertisementById,
    updateAdvertisement,
    uploadAdvertisementPdf,
} from "../../api/advertisements.api";
import { getAllDepartments } from "../../api/departments.api";

const emptyBreakdown = { GEN: "", OBC: "", SC: "", ST: "", EWS: "", PH: "" };

const empty = {
    advtNo: "", postTitle: "", postTitleGu: "", departmentId: "", postClass: "III",
    payScale: "", vacancies: "", applicationFee: "", startDate: "", endDate: "",
    ageLimit: "", eduQualification: "", phDescription: "", experienceRequired: "",
    probationPeriod: "", otherConditions: "",
    vacancyBreakdown: { ...emptyBreakdown },
};

const AdvertisementsForm = () => {
    const { adminData } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const { pathname } = useLocation();
    const isView = Boolean(id) && !pathname.endsWith("/edit");
    const isEdit = Boolean(id) && pathname.endsWith("/edit");

    const [form, setForm] = useState(empty);
    const [departments, setDepartments] = useState([]);
    const [saving, setSaving] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfUploading, setPdfUploading] = useState(false);
    const [pdfPath, setPdfPath] = useState("");

    useEffect(() => {
        getAllDepartments()
            .then((res) => setDepartments(res.data?.data ?? []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!id) return;
        getAdvertisementById(id)
            .then((res) => {
                const d = res.data?.data;
                if (!d) return;
                setForm({
                    advtNo: d.advtNo ?? "",
                    postTitle: d.postTitle ?? "",
                    postTitleGu: d.postTitleGu ?? "",
                    departmentId: d.departmentId?._id ?? d.departmentId ?? "",
                    postClass: d.postClass ?? "III",
                    payScale: d.payScale ?? "",
                    vacancies: d.vacancies ?? "",
                    applicationFee: d.applicationFee ?? "",
                    startDate: d.startDate ? d.startDate.slice(0, 10) : "",
                    endDate: d.endDate ? d.endDate.slice(0, 10) : "",
                    ageLimit: d.ageLimit ?? "",
                    eduQualification: d.eduQualification ?? "",
                    phDescription: d.phDescription ?? "",
                    experienceRequired: d.experienceRequired ?? "",
                    probationPeriod: d.probationPeriod ?? "",
                    otherConditions: d.otherConditions ?? "",
                    vacancyBreakdown: {
                        GEN: d.vacancyBreakdown?.GEN ?? "",
                        OBC: d.vacancyBreakdown?.OBC ?? "",
                        SC:  d.vacancyBreakdown?.SC  ?? "",
                        ST:  d.vacancyBreakdown?.ST  ?? "",
                        EWS: d.vacancyBreakdown?.EWS ?? "",
                        PH:  d.vacancyBreakdown?.PH  ?? "",
                    },
                });
                if (d.pdfPath) setPdfPath(d.pdfPath);
            })
            .catch(() => toast.error("Could not load advertisement."));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleBreakdownChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, vacancyBreakdown: { ...f.vacancyBreakdown, [name]: value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                vacancies: Number(form.vacancies),
                applicationFee: Number(form.applicationFee),
                vacancyBreakdown: Object.fromEntries(
                    Object.entries(form.vacancyBreakdown).map(([k, v]) => [k, Number(v) || 0]),
                ),
            };
            if (isEdit) {
                await updateAdvertisement(id, payload);
                toast.success("Advertisement updated.");
            } else {
                await createAdvertisement(payload);
                toast.success("Advertisement created.");
            }
            navigate("/advertisement");
        } catch (err) {
            toast.error(err?.response?.data?.message ?? "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    const handlePdfUpload = async () => {
        if (!pdfFile) return;
        setPdfUploading(true);
        try {
            const res = await uploadAdvertisementPdf(id, pdfFile);
            setPdfPath(res.data?.data?.pdfPath ?? "");
            setPdfFile(null);
            toast.success("PDF uploaded.");
        } catch (err) {
            toast.error(err?.response?.data?.message ?? "Upload failed.");
        } finally {
            setPdfUploading(false);
        }
    };

    const pageLabel = isView ? "View Advertisement" : isEdit ? "Edit Advertisement" : "Add Advertisement";
    document.title = `${pageLabel} | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        maintitle="Recruitment"
                        title={pageLabel}
                        pageTitle="Advertisements"
                    />
                    <Row>
                        <Col lg={10}>
                            <Card>
                                <CardHeader><h5 className="mb-0">{pageLabel}</h5></CardHeader>
                                <CardBody>
                                    <Form onSubmit={handleSubmit}>
                                        {/* Basic Info */}
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Advertisement No *</Label>
                                                    <Input name="advtNo" value={form.advtNo} onChange={handleChange} required disabled={isEdit || isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Post Class *</Label>
                                                    <Input type="select" name="postClass" value={form.postClass} onChange={handleChange} required disabled={isView}>
                                                        <option value="I">Class I</option>
                                                        <option value="II">Class II</option>
                                                        <option value="III">Class III</option>
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Post Title (English) *</Label>
                                                    <Input name="postTitle" value={form.postTitle} onChange={handleChange} required disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Post Title (Gujarati)</Label>
                                                    <Input name="postTitleGu" value={form.postTitleGu} onChange={handleChange} disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Department</Label>
                                                    <Input type="select" name="departmentId" value={form.departmentId} onChange={handleChange} disabled={isView}>
                                                        <option value="">— None —</option>
                                                        {departments.map((d) => (
                                                            <option key={d._id} value={d._id}>{d.departmentName}</option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Pay Scale</Label>
                                                    <Input name="payScale" value={form.payScale} onChange={handleChange} placeholder="e.g. ₹18,000–₹56,900" disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Vacancies & Dates */}
                                        <Row>
                                            <Col md={3}>
                                                <FormGroup>
                                                    <Label>Total Vacancies *</Label>
                                                    <Input type="number" name="vacancies" value={form.vacancies} onChange={handleChange} min={1} required disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={3}>
                                                <FormGroup>
                                                    <Label>Age Limit</Label>
                                                    <Input name="ageLimit" value={form.ageLimit} onChange={handleChange} placeholder="e.g. 18–35 years" disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={3}>
                                                <FormGroup>
                                                    <Label>Application Fee (₹) *</Label>
                                                    <Input type="number" name="applicationFee" value={form.applicationFee} onChange={handleChange} min={0} required disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={3}>
                                                <FormGroup>
                                                    <Label>Probation Period</Label>
                                                    <Input name="probationPeriod" value={form.probationPeriod} onChange={handleChange} placeholder="e.g. 2 years" disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Start Date</Label>
                                                    <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Last Date *</Label>
                                                    <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} required disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Category-wise Vacancy Breakdown */}
                                        <Card className="border mb-3">
                                            <CardHeader className="bg-light py-2">
                                                <small className="fw-semibold">Category-wise Vacancy Breakdown</small>
                                            </CardHeader>
                                            <CardBody className="py-2">
                                                <Row>
                                                    {["GEN", "OBC", "SC", "ST", "EWS", "PH"].map((cat) => (
                                                        <Col md={2} key={cat}>
                                                            <FormGroup>
                                                                <Label>{cat}</Label>
                                                                <Input
                                                                    type="number"
                                                                    name={cat}
                                                                    value={form.vacancyBreakdown[cat]}
                                                                    onChange={handleBreakdownChange}
                                                                    min={0}
                                                                    disabled={isView}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </CardBody>
                                        </Card>

                                        {/* Qualifications & Conditions */}
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Educational Qualification</Label>
                                                    <Input type="textarea" rows={3} name="eduQualification" value={form.eduQualification} onChange={handleChange} disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>PH Description</Label>
                                                    <Input type="textarea" rows={3} name="phDescription" value={form.phDescription} onChange={handleChange} disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Experience Required</Label>
                                                    <Input type="textarea" rows={3} name="experienceRequired" value={form.experienceRequired} onChange={handleChange} disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Other Conditions</Label>
                                                    <Input type="textarea" rows={3} name="otherConditions" value={form.otherConditions} onChange={handleChange} disabled={isView} />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <div className="d-flex gap-2 mt-3">
                                            {!isView && (
                                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                                    {saving ? "Saving…" : isEdit ? "Update" : "Create"}
                                                </button>
                                            )}
                                            <button type="button" className="btn btn-light" onClick={() => navigate("/advertisement")}>
                                                {isView ? "Back" : "Cancel"}
                                            </button>
                                        </div>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    {id && (
                        <Row className="mt-3">
                            <Col lg={10}>
                                <Card>
                                    <CardHeader><h5 className="mb-0">Advertisement PDF</h5></CardHeader>
                                    <CardBody>
                                        {pdfPath && (
                                            <p className="mb-2">
                                                Current PDF:{" "}
                                                <a href={`/api/v1/advertisements/${id}/pdf`} target="_blank" rel="noreferrer">
                                                    View PDF
                                                </a>
                                            </p>
                                        )}
                                        {!isView && (
                                            <div className="d-flex gap-2 align-items-center">
                                                <Input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => setPdfFile(e.target.files[0] ?? null)}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    disabled={!pdfFile || pdfUploading}
                                                    onClick={handlePdfUpload}
                                                >
                                                    {pdfUploading ? "Uploading…" : "Upload PDF"}
                                                </button>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AdvertisementsForm;
