import React, { useState, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Col, Container, Input, Row } from "reactstrap";
import DataTable from "react-data-table-component";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import FormsHeader from "../../Components/Common/FormsModalHeader";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { MenuContext } from "../../context/MenuContext";
import { searchApplications, updateApplicationStatus } from "../../api/applications.api";

const STATUS_OPTIONS = ["draft", "submitted", "fee_pending", "fee_paid", "shortlisted", "rejected"];
const STATUS_BADGE = {
    draft: "secondary", submitted: "info", fee_pending: "warning",
    fee_paid: "primary", shortlisted: "success", rejected: "danger",
};

const Applications = () => {
    const { adminData } = useContext(AuthContext);
    const { currentPagePermissions } = useContext(MenuContext);

    const [query, setQuery] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(100);
    const [pageNo, setPageNo] = useState(0);
    const [column, setColumn] = useState();
    const [sortDir, setSortDir] = useState();

    useEffect(() => { fetchData(); }, [pageNo, perPage, column, sortDir, query]);

    const fetchData = async () => {
        setLoading(true);
        let skip = (pageNo - 1) * perPage;
        if (skip < 0) skip = 0;
        try {
            const res = await searchApplications({ skip, per_page: perPage, sorton: column, sortdir: sortDir, match: query });
            if (res.data.data.length > 0) {
                setRows(res.data.data[0].data);
                setTotalRows(res.data.data[0].count);
            } else {
                setRows([]);
            }
        } catch {
            setRows([]);
        }
        setLoading(false);
    };

    const handleStatusChange = (id, status) => {
        updateApplicationStatus(id, status)
            .then(() => { fetchData(); toast.success("Status updated."); })
            .catch(() => toast.error("Update failed."));
    };

    const col = [
        { name: "Sr", selector: (_, i) => i + 1, maxWidth: "50px" },
        { name: "Ref No", selector: (r) => r.applicationRefNo, sortable: true, sortField: "applicationRefNo", minWidth: "130px" },
        { name: "Reg ID", selector: (r) => r.registrationId, minWidth: "130px" },
        { name: "Advt No", selector: (r) => r.advtNo, minWidth: "120px" },
        { name: "Submitted", selector: (r) => r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("en-IN") : "—", minWidth: "110px" },
        {
            name: "Status",
            selector: (r) => (
                <span className={`badge bg-${STATUS_BADGE[r.status] ?? "secondary"}`}>{r.status}</span>
            ),
            minWidth: "100px",
        },
        {
            name: "Update Status",
            minWidth: "160px",
            selector: (r) => currentPagePermissions.edit ? (
                <Input
                    type="select"
                    bsSize="sm"
                    value={r.status}
                    onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    style={{ fontSize: 12 }}
                >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Input>
            ) : null,
        },
    ];

    document.title = `Applications | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb maintitle="Recruitment" title="Applications" pageTitle="Recruitment" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader>
                                    <FormsHeader formName="Application" setQuery={setQuery} showAddButton={false} />
                                </CardHeader>
                                <CardBody>
                                    <div className="table-responsive table-card mt-1 mb-1">
                                        <DataTable
                                            columns={col}
                                            data={rows}
                                            progressPending={loading}
                                            sortServer
                                            onSort={(c, d) => { setColumn(c.sortField); setSortDir(d); }}
                                            pagination
                                            paginationServer
                                            paginationTotalRows={totalRows}
                                            paginationPerPage={100}
                                            paginationRowsPerPageOptions={[50, 100, 200, totalRows]}
                                            onChangeRowsPerPage={(n) => setPerPage(n)}
                                            onChangePage={(p) => setPageNo(p)}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Applications;
