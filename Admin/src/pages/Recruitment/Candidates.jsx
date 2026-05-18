import React, { useState, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import DataTable from "react-data-table-component";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import FormsHeader from "../../Components/Common/FormsModalHeader";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { MenuContext } from "../../context/MenuContext";
import { searchCandidates, toggleCandidateStatus } from "../../api/candidates.api";

const Candidates = () => {
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
            const res = await searchCandidates({ skip, per_page: perPage, sorton: column, sortdir: sortDir, match: query });
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

    const handleToggle = (id) => {
        toggleCandidateStatus(id)
            .then(() => { fetchData(); toast.success("Status updated."); })
            .catch(() => toast.error("Update failed."));
    };

    const col = [
        { name: "Sr", selector: (_, i) => i + 1, maxWidth: "50px" },
        { name: "Reg ID", selector: (r) => r.registrationId, sortable: true, sortField: "registrationId", minWidth: "130px" },
        { name: "Name", selector: (r) => r.name, sortable: true, sortField: "name", minWidth: "140px" },
        { name: "Mobile", selector: (r) => r.mobile, minWidth: "110px" },
        { name: "Email", selector: (r) => r.email, minWidth: "160px" },
        { name: "Gender", selector: (r) => r.gender, maxWidth: "80px" },
        { name: "Category", selector: (r) => r.category, maxWidth: "90px" },
        {
            name: "Status",
            selector: (r) => (
                <span className={`badge bg-${r.isActive ? "success" : "secondary"}`}>
                    {r.isActive ? "Active" : "Inactive"}
                </span>
            ),
            maxWidth: "90px",
        },
        {
            name: "Action",
            minWidth: "120px",
            selector: (r) => (
                <div className="d-flex gap-1">
                    {currentPagePermissions.edit && (
                        <button
                            className={`btn btn-sm ${r.isActive ? "btn-warning" : "btn-success"}`}
                            onClick={() => handleToggle(r._id)}
                        >
                            {r.isActive ? "Deactivate" : "Activate"}
                        </button>
                    )}
                </div>
            ),
        },
    ];

    document.title = `Candidates | ${adminData?.companyName}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb maintitle="Recruitment" title="Candidates" pageTitle="Recruitment" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader>
                                    <FormsHeader
                                        formName="Candidate"
                                        setQuery={setQuery}
                                        showAddButton={false}
                                    />
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

export default Candidates;
