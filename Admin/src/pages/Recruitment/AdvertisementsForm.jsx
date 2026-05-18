import React, { useState, useEffect, useContext } from "react";
import {
    Card, CardBody, CardHeader, Col, Container, Form,
    FormGroup, Input, Label, Row,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import {
    createAdvertisement,
    getAdvertisementById,
    updateAdvertisement,
} from "../../api/advertisements.api";
import { getAllDepartments } from "../../api/departments.api";

const empty = {
    advtNo: "", postTitle: "", departmentId: "", postClass: "III",
    payScale: "", vacancies: "", applicationFee: "", startDate: "", endDate: "",
};

const AdvertisementsForm = () => {
    const { adminData } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(empty);
    const [departments, setDepartments] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getAllDepartments()
            .then((res) => setDepartments(res.data?.data ?? []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        getAdvertisementById(id)
            .then((res) => {
                const d = res.data?.data;
                if (!d) return;
                setForm({
                    advtNo: d.advtNo ?? "",
                    postTitle: d.postTitle ?? "",
                    departmentId: d.departmentId?._id ?? d.departmentId ?? "",
                    postClass: d.postClass ?? "III",
                    payScale: d.payScale ?? "",
                    vacancies: d.vacancies ?? "",
                    applicationFee: d.applicationFee ?? "",
                    startDate: d.startDate ? d.startDate.slice(0, 10) : "",
                    endDate: d.endDate ? d.endDate.slice(0, 10) : "",
                });
            })
            .catch(() => toast.error("Could not load advertisement."));
    }, [id, isEdit]);

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
                vacancies: Number(form.vacancies),
                applicationFee: Number(form.applicationFee),
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

    document.title = `${isEdit ? "Edit" : "Add"} Advertisement | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        maintitle="Recruitment"
                        title={isEdit ? "Edit Advertisement" : "Add Advertisement"}
                        pageTitle="Advertisements"
                    />
                    <Row>
                        <Col lg={8}>
                            <Card>
                                <CardHeader><h5 className="mb-0">{isEdit ? "Edit" : "New"} Advertisement</h5></CardHeader>
                                <CardBody>
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Advertisement No *</Label>
                                                    <Input name="advtNo" value={form.advtNo} onChange={handleChange} required disabled={isEdit} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Post Class *</Label>
                                                    <Input type="select" name="postClass" value={form.postClass} onChange={handleChange} required>
                                                        <option value="I">Class I</option>
                                                        <option value="II">Class II</option>
                                                        <option value="III">Class III</option>
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col md={12}>
                                                <FormGroup>
                                                    <Label>Post Title *</Label>
                                                    <Input name="postTitle" value={form.postTitle} onChange={handleChange} required />
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Department</Label>
                                                    <Input type="select" name="departmentId" value={form.departmentId} onChange={handleChange}>
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
                                                    <Input name="payScale" value={form.payScale} onChange={handleChange} placeholder="e.g. ₹18,000–₹56,900" />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label>Vacancies *</Label>
                                                    <Input type="number" name="vacancies" value={form.vacancies} onChange={handleChange} min={1} required />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label>Application Fee (₹) *</Label>
                                                    <Input type="number" name="applicationFee" value={form.applicationFee} onChange={handleChange} min={0} required />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label>Start Date</Label>
                                                    <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label>Last Date *</Label>
                                                    <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <div className="d-flex gap-2 mt-3">
                                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                                {saving ? "Saving…" : isEdit ? "Update" : "Create"}
                                            </button>
                                            <button type="button" className="btn btn-light" onClick={() => navigate("/advertisement")}>
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

export default AdvertisementsForm;
